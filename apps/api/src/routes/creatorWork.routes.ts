import { Router } from "express";
import { getAdminNotifyEmail, renderEmail, sendEmail } from "../lib/mailer";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { POST_KEYS, payoutSchema, publishedSchema, submissionSchema } from "../validators/creatorWork.validators";

const LINK_LABEL: Record<string, string> = {
  draft: "Borrador (Drive/Dropbox)", x: "X", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", twitch: "Twitch", other: "Otro",
};

// Lado del creador: datos de cobro y entrega de contenido. Montado en /api/creator.
const router = Router();
router.use(requireAuth, requireRole("CREADOR"));

async function myCreator(userId: string) {
  return prisma.creator.findUnique({ where: { userId } });
}

router.get("/payout", async (req: AuthRequest, res, next) => {
  try {
    const c = await myCreator(req.user!.userId);
    if (!c) return res.status(404).json({ error: "Perfil no encontrado." });
    res.json({ method: c.payoutMethod, details: c.payoutDetails, updatedAt: c.payoutUpdatedAt });
  } catch (err) {
    next(err);
  }
});

router.put("/payout", validateBody(payoutSchema), async (req: AuthRequest, res, next) => {
  try {
    const c = await myCreator(req.user!.userId);
    if (!c) return res.status(404).json({ error: "Perfil no encontrado." });
    const updated = await prisma.creator.update({
      where: { id: c.id },
      data: { payoutMethod: req.body.method, payoutDetails: req.body.details, payoutUpdatedAt: new Date() },
    });
    res.json({ method: updated.payoutMethod, details: updated.payoutDetails, updatedAt: updated.payoutUpdatedAt });
  } catch (err) {
    next(err);
  }
});

async function myApplication(userId: string, campaignId: string) {
  const c = await myCreator(userId);
  if (!c) return null;
  return prisma.campaignApplication.findUnique({
    where: { campaignId_creatorId: { campaignId, creatorId: c.id } },
    include: { campaign: { select: { id: true, title: true, brandName: true } } },
  });
}

// Todo lo de "mi trabajo" en una campaña: estado de la aplicación, entregas y pago.
router.get("/campaigns/:campaignId/work", async (req: AuthRequest, res, next) => {
  try {
    const app = await myApplication(req.user!.userId, req.params.campaignId);
    if (!app) return res.json({ application: null, submissions: [] });
    const submissions = await prisma.contentSubmission.findMany({
      where: { applicationId: app.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      application: {
        id: app.id, status: app.status, payoutStatus: app.payoutStatus, payoutAmount: app.payoutAmount, paidAt: app.paidAt,
      },
      submissions,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/campaigns/:campaignId/submissions", validateBody(submissionSchema), async (req: AuthRequest, res, next) => {
  try {
    const app = await myApplication(req.user!.userId, req.params.campaignId);
    if (!app || app.status !== "ACCEPTED") {
      return res.status(403).json({ error: "Solo puedes entregar contenido en campañas en las que fuiste seleccionado." });
    }
    const links = req.body.links as Record<string, string>;
    const hasPost = POST_KEYS.some((k) => links[k]);
    const submission = await prisma.contentSubmission.create({
      data: {
        applicationId: app.id,
        links,
        contentUrl: links.draft || Object.values(links)[0],
        notes: req.body.notes,
        // Si ya trae el post publicado, pasa directo a "por verificar".
        status: hasPost ? "PUBLISHED" : "SUBMITTED",
        publishedAt: hasPost ? new Date() : null,
      },
    });
    const admin = getAdminNotifyEmail();
    if (admin) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { email: true } });
      const mail = renderEmail({
        title: `Nuevo contenido para "${app.campaign.title}"`,
        paragraphs: ["Un creador entregó contenido para revisar."],
        rows: [
          ["Creador", user?.email || "—"],
          ["Estado", hasPost ? "Post publicado (por verificar)" : "Borrador para revisar"],
          ...Object.entries(links).map(([k, v]) => [LINK_LABEL[k] || k, v] as [string, string]),
          ...(req.body.notes ? ([["Notas", req.body.notes]] as Array<[string, string]>) : []),
        ],
        button: { label: "Revisar en el panel", url: `${(process.env.PUBLIC_SITE_URL || "https://casacreadores.vercel.app").replace(/\/+$/, "")}/admin/campanas/${app.campaign.id}` },
      });
      await sendEmail({ to: admin, subject: `Contenido entregado: ${app.campaign.title}`, ...mail });
    }
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
});

router.patch("/submissions/:id/published", validateBody(publishedSchema), async (req: AuthRequest, res, next) => {
  try {
    const c = await myCreator(req.user!.userId);
    const sub = await prisma.contentSubmission.findUnique({ where: { id: req.params.id }, include: { application: true } });
    if (!c || !sub || sub.application.creatorId !== c.id) return res.status(404).json({ error: "Entrega no encontrada." });
    if (sub.status !== "APPROVED" && sub.status !== "PUBLISHED") {
      return res.status(400).json({ error: "Primero el equipo tiene que aprobar este contenido." });
    }
    const merged = { ...((sub.links as Record<string, string> | null) || {}), ...req.body.links };
    const firstPost = POST_KEYS.map((k) => merged[k]).find(Boolean) || null;
    const updated = await prisma.contentSubmission.update({
      where: { id: sub.id },
      data: { links: merged, postUrl: firstPost, status: "PUBLISHED", publishedAt: new Date() },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
