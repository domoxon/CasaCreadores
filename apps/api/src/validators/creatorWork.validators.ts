import { z } from "zod";

const s = (min: number, max: number, msg: string) => z.string().trim().min(min, msg).max(max);

export const payoutSchema = z.discriminatedUnion("method", [
  z.object({
    method: z.literal("CRYPTO"),
    details: z.object({
      token: z.enum(["USDT", "USDC"]),
      network: s(2, 40, "Elige la red."),
      address: s(20, 120, "La dirección de la wallet parece incompleta."),
    }),
  }),
  z.object({
    method: z.literal("BINANCE_PAY"),
    details: z.object({ payId: s(3, 120, "Escribe tu Binance Pay ID o email.") }),
  }),
  z.object({
    method: z.literal("BANK"),
    details: z.object({
      holder: s(2, 120, "Escribe el titular de la cuenta."),
      bank: s(2, 120, "Escribe el banco."),
      country: s(2, 60, "Escribe el país de la cuenta."),
      account: s(5, 64, "Escribe el número de cuenta / CBU / CLABE / IBAN."),
      taxId: z.string().trim().max(40).optional().default(""),
    }),
  }),
  z.object({
    method: z.literal("WISE"),
    details: z.object({
      holder: s(2, 120, "Escribe el titular."),
      email: z.string().trim().email("Email de Wise inválido."),
    }),
  }),
]);

const httpsUrl = (msg: string) =>
  z.string().trim().max(1000).refine((v) => /^https?:\/\/\S+\.\S+/i.test(v), msg);

export const submissionSchema = z.object({
  contentUrl: httpsUrl("Pega un enlace válido (Google Drive, Dropbox…) que empiece por https://"),
  notes: z.string().trim().max(2000).default(""),
});

export const publishedSchema = z.object({
  postUrl: httpsUrl("Pega el enlace del post publicado (https://…)."),
});

export const submissionReviewSchema = z.object({
  status: z.enum(["APPROVED", "CHANGES_REQUESTED", "VERIFIED"]),
  feedback: z.string().trim().max(2000).optional().nullable(),
});

export const payoutUpdateSchema = z.object({
  payoutStatus: z.enum(["NOT_DUE", "DUE", "PAID"]),
  payoutAmount: z.coerce.number().min(0).nullable().optional(),
  payoutReference: z.string().trim().max(200).nullable().optional(),
});
