import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Request, Router } from "express";
import { signAccessToken, signRefreshToken } from "../lib/jwt";
import { getAdminNotifyEmail, renderEmail, sendEmail } from "../lib/mailer";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { contactLimiter } from "../middleware/rateLimit";
import { validateBody } from "../middleware/validate";
import { activateSchema, applicationSchema, reviewSchema } from "../validators/applications.validators";

// Flujo de solicitud -> revisión -> activación:
//   POST /api/applications                 (público)  crea la solicitud y avisa al equipo por email
//   GET  /api/applications/review/:token   (enlace)   datos para la página /revisar/:token
//   POST /api/applications/review/:token   (enlace)   aprobar / rechazar; al aprobar envía el enlace de activación
//   GET  /api/applications/invite/:token   (enlace)   datos para la página /activar/:token
//   POST /api/applications/invite/:token   (enlace)   crea la cuenta CREADOR ya aprobada y abre sesión
//   GET  /api/applications                 (ADMIN)    listado para /admin
//
// Las acciones de los emails NUNCA se ejecutan con un GET: los escáneres de enlaces de
// Gmail/Outlook abren los links y aprobarían solicitudes solos. El email lleva a una página
// y la acción es un botón (POST).

const router = Router();
const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

function token(): string {
  return crypto.randomBytes(24).toString("base64url");
}

function siteUrl(req: Request): string {
  const configured = (process.env.PUBLIC_SITE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (process.env.NODE_ENV !== "production") {
    return (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/+$/, "");
  }
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "casacreadores.vercel.app";
  return `https://${host.split(",")[0].trim()}`;
}

type Platforms = Record<string, string>;

function platformsText(p: unknown): string {
  return Object.entries((p as Platforms) || {})
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function publicApplication(a: {
  name: string; email: string; country: string; languages: string[]; contact: string; platforms: unknown;
  followerCount: number; nichos: string[]; contentTypes: string[]; payoutMethod: string; bestPosts: string;
  bio: string; referredBy: string | null; status: string; createdAt: Date; reviewedAt: Date | null; activatedAt: Date | null;
}) {
  return {
    name: a.name, email: a.email, country: a.country, languages: a.languages, contact: a.contact,
    platforms: a.platforms, followerCount: a.followerCount, nichos: a.nichos, contentTypes: a.contentTypes,
    payoutMethod: a.payoutMethod, bestPosts: a.bestPosts, bio: a.bio, referredBy: a.referredBy,
    status: a.status, createdAt: a.createdAt, reviewedAt: a.reviewedAt, activatedAt: a.activatedAt,
  };
}

// --- 1. Solicitud pública -------------------------------------------------------------
router.post("/", contactLimiter, validateBody(applicationSchema), async (req, res, next) => {
  try {
    const data = req.body as import("zod").infer<typeof applicationSchema>;

    if (await prisma.user.findUnique({ where: { email: data.email } })) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email. Inicia sesión." });
    }
    const pending = await prisma.creatorApplication.findFirst({ where: { email: data.email, status: "PENDING" } });
    if (pending) {
      return res.status(409).json({ error: "Ya recibimos una solicitud con ese email. Te escribiremos pronto." });
    }

    const platforms = Object.fromEntries(Object.entries(data.platforms).filter(([, v]) => v));
    const application = await prisma.creatorApplication.create({
      data: {
        name: data.name, email: data.email, country: data.country, languages: data.languages,
        contact: data.contact, platforms, followerCount: data.followerCount, nichos: data.nichos,
        contentTypes: data.contentTypes, payoutMethod: data.payoutMethod, bestPosts: data.bestPosts,
        bio: data.bio, referredBy: data.referredBy || null, reviewToken: token(),
      },
    });

    const reviewUrl = `${siteUrl(req)}/revisar/${application.reviewToken}`;
    const admin = getAdminNotifyEmail();
    if (admin) {
      const mail = renderEmail({
        title: `Nueva solicitud: ${application.name}`,
        paragraphs: ["Un creador quiere unirse a Casa Creadores. Revisa su perfil y apruébalo o recházalo."],
        rows: [
          ["Nombre", application.name],
          ["Email", application.email],
          ["País", application.country],
          ["Idiomas", application.languages.join(", ")],
          ["Contacto", application.contact],
          ["Redes", platformsText(application.platforms)],
          ["Seguidores", application.followerCount.toLocaleString("es")],
          ["Nichos", application.nichos.join(", ")],
          ["Contenido", application.contentTypes.join(", ")],
          ["Cobro", application.payoutMethod],
          ...(application.bestPosts ? ([["Mejores posts", application.bestPosts]] as Array<[string, string]>) : []),
          ...(application.bio ? ([["Bio", application.bio]] as Array<[string, string]>) : []),
        ],
        button: { label: "Revisar solicitud", url: reviewUrl },
      });
      await sendEmail({ to: admin, subject: `Nueva solicitud de creador: ${application.name}`, ...mail });
    }

    const ack = renderEmail({
      title: "Recibimos tu solicitud",
      paragraphs: [
        `Hola ${application.name}, gracias por aplicar a Casa Creadores.`,
        "Revisamos cada perfil a mano (calidad del contenido, engagement y nicho). Te escribiremos a este email con la respuesta, normalmente en menos de 5 días hábiles.",
      ],
    });
    await sendEmail({ to: application.email, subject: "Recibimos tu solicitud — Casa Creadores", ...ack });

    res.status(201).json({ message: "Solicitud recibida. Te escribiremos por email." });
  } catch (err) {
    next(err);
  }
});

// --- 2. Revisión (desde el email del equipo) --------------------------------------------
router.get("/review/:token", async (req, res, next) => {
  try {
    const a = await prisma.creatorApplication.findUnique({ where: { reviewToken: req.params.token } });
    if (!a) return res.status(404).json({ error: "Solicitud no encontrada." });
    res.json(publicApplication(a));
  } catch (err) {
    next(err);
  }
});

router.post("/review/:token", validateBody(reviewSchema), async (req, res, next) => {
  try {
    const a = await prisma.creatorApplication.findUnique({ where: { reviewToken: req.params.token } });
    if (!a) return res.status(404).json({ error: "Solicitud no encontrada." });
    if (a.activatedAt) return res.status(409).json({ error: "Este creador ya activó su cuenta." });

    if (req.body.action === "reject") {
      const updated = await prisma.creatorApplication.update({
        where: { id: a.id },
        data: { status: "REJECTED", reviewedAt: new Date(), inviteToken: null, inviteExpiresAt: null },
      });
      const mail = renderEmail({
        title: "Sobre tu solicitud",
        paragraphs: [
          `Hola ${a.name}, gracias por tu interés en Casa Creadores.`,
          "Por ahora no podemos sumarte a la red. Revisamos los perfiles de nuevo cada pocos meses, así que puedes volver a aplicar más adelante.",
        ],
      });
      const emailResult = await sendEmail({ to: a.email, subject: "Tu solicitud a Casa Creadores", ...mail });
      return res.json({ status: updated.status, emailSent: emailResult.sent });
    }

    const inviteToken = token();
    const updated = await prisma.creatorApplication.update({
      where: { id: a.id },
      data: { status: "APPROVED", reviewedAt: new Date(), inviteToken, inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS) },
    });
    const inviteUrl = `${siteUrl(req)}/activar/${inviteToken}`;
    const mail = renderEmail({
      title: "¡Bienvenido a Casa Creadores!",
      paragraphs: [
        `Hola ${a.name}, tu solicitud fue aprobada.`,
        "Crea tu contraseña con el botón de abajo para entrar a tu panel, ver las campañas activas y aplicar. El enlace caduca en 14 días.",
      ],
      button: { label: "Crear mi cuenta", url: inviteUrl },
    });
    const emailResult = await sendEmail({ to: a.email, subject: "Tu solicitud fue aprobada — Casa Creadores", ...mail });
    res.json({ status: updated.status, inviteUrl, emailSent: emailResult.sent, emailError: emailResult.error || null });
  } catch (err) {
    next(err);
  }
});

// --- 3. Activación (enlace que recibe el creador aprobado) --------------------------------
async function findValidInvite(inviteToken: string) {
  const a = await prisma.creatorApplication.findUnique({ where: { inviteToken } });
  if (!a || a.status !== "APPROVED" || a.activatedAt || !a.inviteExpiresAt || a.inviteExpiresAt < new Date()) return null;
  return a;
}

router.get("/invite/:token", async (req, res, next) => {
  try {
    const a = await findValidInvite(req.params.token);
    if (!a) return res.status(404).json({ error: "Este enlace no es válido o ya caducó." });
    res.json({ name: a.name, email: a.email });
  } catch (err) {
    next(err);
  }
});

router.post("/invite/:token", contactLimiter, validateBody(activateSchema), async (req, res, next) => {
  try {
    const a = await findValidInvite(req.params.token);
    if (!a) return res.status(404).json({ error: "Este enlace no es válido o ya caducó." });
    if (await prisma.user.findUnique({ where: { email: a.email } })) {
      return res.status(409).json({ error: "Ya existe una cuenta con ese email. Inicia sesión." });
    }

    const p = (a.platforms as Platforms) || {};
    const clean = (v?: string) => (v ? v.replace(/^https?:\/\/(www\.)?[^/]+\//, "").replace(/^@/, "").replace(/\/+$/, "") : null);
    const user = await prisma.user.create({
      data: {
        email: a.email,
        password: await bcrypt.hash(req.body.password, 10),
        role: "CREADOR",
        emailVerified: true,
        creator: {
          create: {
            bio: a.bio,
            xHandle: clean(p.X),
            igHandle: clean(p.Instagram),
            tiktokHandle: clean(p.TikTok),
            followerCount: a.followerCount,
            nichos: a.nichos,
            verifiedStatus: "VERIFIED",
          },
        },
      },
    });
    await prisma.creatorApplication.update({
      where: { id: a.id },
      data: { activatedAt: new Date(), userId: user.id, inviteToken: null },
    });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id, role: user.role });
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, emailVerified: user.emailVerified },
    });
  } catch (err) {
    next(err);
  }
});

// --- 4. Listado para el panel de administración ------------------------------------------
router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const list = await prisma.creatorApplication.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
    res.json(list.map((a) => ({ id: a.id, reviewToken: a.reviewToken, ...publicApplication(a) })));
  } catch (err) {
    next(err);
  }
});

export default router;
