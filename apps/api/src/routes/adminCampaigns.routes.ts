import express, { Router } from "express";
import { put } from "@vercel/blob";
import crypto from "crypto";
import { renderEmail, sendEmail } from "../lib/mailer";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  adminApplicationDecisionSchema,
  adminCampaignSchema,
  adminCampaignStatusSchema,
} from "../validators/adminCampaigns.validators";

// Gestión de campañas desde el panel (solo ADMIN): crear, editar, subir imágenes,
// publicar/pausar y decidir sobre los creadores que aplican.
// Montado en /api/admin/campaigns y /api/admin/uploads.

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

// Todas las campañas del equipo cuelgan de una "marca" interna. La marca cliente que se
// muestra va en campaign.brandName. Preferimos la cuenta de operaciones (OPS_EMAIL); si no
// existe, la del propio admin.
async function getInternalBrandId(adminUserId: string): Promise<string> {
  const opsEmail = (process.env.OPS_EMAIL || "").trim().toLowerCase();
  if (opsEmail) {
    const ops = await prisma.user.findUnique({ where: { email: opsEmail }, include: { brand: true } });
    if (ops?.brand) return ops.brand.id;
  }
  const own = await prisma.brand.findUnique({ where: { userId: adminUserId } });
  if (own) return own.id;
  const created = await prisma.brand.create({
    data: { userId: adminUserId, companyName: "Casa Creadores", website: "https://casacreadores.vercel.app", industry: "Interno" },
  });
  return created.id;
}

router.get("/campaigns", async (_req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
});

router.get("/campaigns/:id", async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!campaign) return res.status(404).json({ error: "Campaña no encontrada." });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

router.post("/campaigns", validateBody(adminCampaignSchema), async (req: AuthRequest, res, next) => {
  try {
    const brandId = await getInternalBrandId(req.user!.userId);
    const campaign = await prisma.campaign.create({ data: { ...req.body, brandId, status: "DRAFT" } });
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
});

router.put("/campaigns/:id", validateBody(adminCampaignSchema), async (req, res, next) => {
  try {
    const exists = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ error: "Campaña no encontrada." });
    const campaign = await prisma.campaign.update({ where: { id: req.params.id }, data: req.body });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

router.patch("/campaigns/:id/status", validateBody(adminCampaignStatusSchema), async (req, res, next) => {
  try {
    const current = await prisma.campaign.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: "Campaña no encontrada." });
    const campaign = await prisma.campaign.update({
      where: { id: current.id },
      data: {
        status: req.body.status,
        publishedAt: req.body.status === "ACTIVE" && !current.publishedAt ? new Date() : current.publishedAt,
      },
    });
    res.json(campaign);
  } catch (err) {
    next(err);
  }
});

router.delete("/campaigns/:id", async (req, res, next) => {
  try {
    const current = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { applications: true } } },
    });
    if (!current) return res.status(404).json({ error: "Campaña no encontrada." });
    if (current._count.applications > 0) {
      return res.status(409).json({ error: "Esta campaña ya tiene aplicaciones: márcala como finalizada en vez de borrarla." });
    }
    await prisma.campaign.delete({ where: { id: current.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/campaigns/:id/applications", async (req, res, next) => {
  try {
    const applications = await prisma.campaignApplication.findMany({
      where: { campaignId: req.params.id },
      orderBy: { appliedAt: "desc" },
      include: { creator: { include: { user: { select: { email: true } } } } },
    });
    const names = await prisma.creatorApplication.findMany({
      where: { userId: { in: applications.map((a) => a.creator.userId) } },
      select: { userId: true, name: true, country: true, contact: true },
    });
    const byUser = new Map(names.map((n) => [n.userId, n]));
    res.json(applications.map((a) => ({ ...a, profile: byUser.get(a.creator.userId) || null })));
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/campaigns/:id/applications/:appId",
  validateBody(adminApplicationDecisionSchema),
  async (req, res, next) => {
    try {
      const application = await prisma.campaignApplication.findUnique({
        where: { id: req.params.appId },
        include: { campaign: true, creator: { include: { user: { select: { email: true } } } } },
      });
      if (!application || application.campaignId !== req.params.id) {
        return res.status(404).json({ error: "Aplicación no encontrada." });
      }
      const updated = await prisma.campaignApplication.update({
        where: { id: application.id },
        data: { status: req.body.status },
      });
      if (req.body.status !== "PENDING") {
        const accepted = req.body.status === "ACCEPTED";
        const brand = application.campaign.brandName || "la marca";
        const mail = renderEmail({
          title: accepted ? `¡Estás dentro de "${application.campaign.title}"!` : `Sobre "${application.campaign.title}"`,
          paragraphs: accepted
            ? [`Te seleccionamos para la campaña de ${brand}. En breve te escribimos con el brief completo y los siguientes pasos.`]
            : [`Gracias por aplicar a la campaña de ${brand}. Esta vez no fuiste seleccionado; seguí atento a las próximas campañas en tu panel.`],
        });
        await sendEmail({ to: application.creator.user.email, subject: accepted ? "Fuiste seleccionado para una campaña" : "Actualización de tu aplicación", ...mail });
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// Subida de imágenes (portada, logo) a Vercel Blob. El navegador envía el archivo en bruto
// con su content-type; devolvemos la URL pública. Máx. 4 MB (límite de las funciones de Vercel).
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
router.post(
  "/uploads",
  express.raw({ type: () => true, limit: "4mb" }),
  async (req, res, next) => {
    try {
      const type = String(req.headers["content-type"] || "").split(";")[0].trim();
      if (!ALLOWED.has(type)) return res.status(400).json({ error: "Formato no admitido. Usa PNG, JPG, WEBP, GIF o SVG." });
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: "Archivo vacío." });
      if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: "El almacenamiento de imágenes no está configurado." });
      const ext = type === "image/svg+xml" ? "svg" : type.split("/")[1].replace("jpeg", "jpg");
      const raw = String(req.query.name || "imagen").toLowerCase().replace(/\.[a-z0-9]+$/, "");
      const base = raw.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "imagen";
      const blob = await put(`campanas/${base}-${crypto.randomBytes(4).toString("hex")}.${ext}`, req.body, {
        access: "public",
        contentType: type,
      });
      res.status(201).json({ url: blob.url });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
