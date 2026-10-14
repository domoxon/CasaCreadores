import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Debe ser un enlace que empiece por https://")
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const optionalDate = z
  .string()
  .trim()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), "Fecha inválida.")
  .nullable()
  .optional();

export const adminCampaignSchema = z.object({
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres.").max(140),
  description: z.string().trim().min(10, "Describe la campaña (mínimo 10 caracteres).").max(5000),
  brandName: z.string().trim().min(2, "Escribe el nombre de la marca.").max(120),
  brandWebsite: optionalUrl,
  brandLogoUrl: optionalUrl,
  coverImageUrl: optionalUrl,
  brandContext: z.string().trim().max(5000).default(""),
  deliverables: z.string().trim().max(3000).default(""),
  requirements: z.string().trim().max(3000).default(""),
  socialLinks: z.record(z.string(), z.string().trim().max(300)).default({}),
  platforms: z.array(z.string().max(30)).max(10).default([]),
  countries: z.array(z.string().max(40)).max(25).default([]),
  nichos: z.array(z.string().max(40)).max(10).default([]),
  budgetUSDC: z.coerce.number().min(0, "El presupuesto no puede ser negativo."),
  paymentPerCreator: z.coerce.number().min(0).nullable().optional(),
  spots: z.coerce.number().int().min(1).nullable().optional(),
  duration: z.coerce.number().int().min(1, "La duración debe ser de al menos 1 día."),
  minFollowers: z.coerce.number().int().min(0).default(0),
  startDate: optionalDate,
  endDate: optionalDate,
});

export const adminCampaignStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED"]),
});

export const adminApplicationDecisionSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "PENDING"]),
});
