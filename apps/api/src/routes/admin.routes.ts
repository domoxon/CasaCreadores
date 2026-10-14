import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { z } from "zod";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

const verifyCreatorSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
});

router.get("/creators", async (req, res, next) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status && typeof status === "string") where.verifiedStatus = status;

    const creators = await prisma.creator.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, createdAt: true } } },
    });
    res.json(creators);
  } catch (err) {
    next(err);
  }
});

// Red de creadores: todos los creadores con cuenta, con los datos de su solicitud
// (nombre, país, contacto, cobro…) cuando entraron por /aplicar.
router.get("/network", async (_req, res, next) => {
  try {
    const creators = await prisma.creator.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
    });
    const apps = await prisma.creatorApplication.findMany({
      where: { userId: { in: creators.map((c) => c.userId) } },
    });
    const byUser = new Map(apps.map((a) => [a.userId, a]));
    res.json(
      creators.map((c) => {
        const a = byUser.get(c.userId);
        return {
          id: c.id,
          email: c.user.email,
          joinedAt: c.user.createdAt,
          status: c.verifiedStatus,
          followerCount: c.followerCount,
          nichos: c.nichos,
          bio: c.bio,
          handles: { X: c.xHandle, Instagram: c.igHandle, TikTok: c.tiktokHandle },
          campaignApplications: c._count.applications,
          name: a?.name ?? null,
          country: a?.country ?? null,
          languages: a?.languages ?? [],
          contact: a?.contact ?? null,
          platforms: (a?.platforms as Record<string, string> | undefined) ?? null,
          contentTypes: a?.contentTypes ?? [],
          payoutMethod: a?.payoutMethod ?? null,
          reviewToken: a?.reviewToken ?? null,
        };
      })
    );
  } catch (err) {
    next(err);
  }
});

// Ficha completa de un creador para el panel: perfil, solicitud original e historial de campañas.
router.get("/creators/:id/profile", async (req, res, next) => {
  try {
    const c = await prisma.creator.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, createdAt: true } },
        applications: {
          orderBy: { appliedAt: "desc" },
          include: { campaign: { select: { id: true, title: true, brandName: true, status: true } } },
        },
      },
    });
    if (!c) return res.status(404).json({ error: "Creador no encontrado." });
    const a = await prisma.creatorApplication.findFirst({ where: { userId: c.userId } });
    res.json({
      id: c.id,
      email: c.user.email,
      joinedAt: c.user.createdAt,
      status: c.verifiedStatus,
      followerCount: c.followerCount,
      nichos: c.nichos,
      bio: c.bio,
      handles: { X: c.xHandle, Instagram: c.igHandle, TikTok: c.tiktokHandle },
      application: a
        ? {
            name: a.name, country: a.country, languages: a.languages, contact: a.contact,
            platforms: a.platforms, contentTypes: a.contentTypes, payoutMethod: a.payoutMethod,
            bestPosts: a.bestPosts, bio: a.bio, referredBy: a.referredBy, createdAt: a.createdAt,
            reviewedAt: a.reviewedAt, reviewToken: a.reviewToken,
          }
        : null,
      campaigns: c.applications.map((x) => ({
        id: x.id, status: x.status, appliedAt: x.appliedAt,
        campaign: x.campaign,
      })),
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/creators/:id/verify", validateBody(verifyCreatorSchema), async (req, res, next) => {
  try {
    const creator = await prisma.creator.update({
      where: { id: req.params.id },
      data: { verifiedStatus: req.body.status },
    });
    res.json(creator);
  } catch (err) {
    next(err);
  }
});

router.get("/contact-messages", async (_req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.patch("/contact-messages/:id", validateBody(z.object({ handled: z.boolean() })), async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { handled: req.body.handled },
    });
    res.json(message);
  } catch (err) {
    next(err);
  }
});

router.get("/payments", async (_req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { companyName: true } },
        campaign: { select: { title: true } },
      },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (_req, res, next) => {
  try {
    const [totalBrands, totalCreators, pendingCreators, totalCampaigns, activeCampaigns, payments] =
      await Promise.all([
        prisma.brand.count(),
        prisma.creator.count(),
        prisma.creator.count({ where: { verifiedStatus: "PENDING" } }),
        prisma.campaign.count(),
        prisma.campaign.count({ where: { status: "ACTIVE" } }),
        prisma.payment.findMany({ where: { status: "COMPLETED" } }),
      ]);

    const totalRevenueUSDC = payments.reduce((sum, p) => sum + p.amountUSDC, 0);
    // Comisión de plataforma: 15-20%. Usamos 17.5% como estimado promedio para el panel.
    const platformCommissionUSDC = totalRevenueUSDC * 0.175;

    res.json({
      totalBrands,
      totalCreators,
      pendingCreators,
      totalCampaigns,
      activeCampaigns,
      totalPayments: payments.length,
      totalRevenueUSDC,
      platformCommissionUSDC,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
