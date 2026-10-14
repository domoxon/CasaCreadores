import { z } from "zod";

export const PLATFORMS = ["X", "Instagram", "TikTok", "YouTube", "LinkedIn", "Twitch"] as const;

export const applicationSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(120),
  email: z.string().trim().toLowerCase().email("Email inválido."),
  country: z.string().trim().min(2, "Elige tu país.").max(60),
  languages: z.array(z.string().max(30)).min(1, "Elige al menos un idioma.").max(3),
  contact: z.string().trim().min(3, "Déjanos tu WhatsApp o Telegram.").max(80),
  platforms: z
    .record(z.enum(PLATFORMS), z.string().trim().max(200))
    .refine((p) => Object.values(p).some((v) => v.length > 0), "Añade al menos una red con tu usuario o enlace."),
  followerCount: z.coerce.number().int().min(0).max(100_000_000),
  nichos: z.array(z.string().max(40)).min(1, "Elige al menos un nicho.").max(5, "Máximo 5 nichos."),
  contentTypes: z.array(z.string().max(40)).min(1, "Elige al menos un tipo de contenido.").max(5, "Máximo 5 tipos."),
  payoutMethod: z.string().trim().min(2, "Elige cómo quieres cobrar.").max(40),
  bestPosts: z.string().trim().max(2000).default(""),
  bio: z.string().trim().max(1000).default(""),
  referredBy: z.string().trim().max(64).optional().nullable(),
  accurate: z.literal(true, { errorMap: () => ({ message: "Confirma que la información es correcta." }) }),
});

export const reviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const activateSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(200),
});
