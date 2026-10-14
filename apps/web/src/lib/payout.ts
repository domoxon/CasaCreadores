export type PayoutMethod = "CRYPTO" | "BINANCE_PAY" | "BANK" | "WISE";
export type PayoutDetails = Record<string, string>;

export const PAYOUT_METHOD_LABEL: Record<PayoutMethod, string> = {
  CRYPTO: "Cripto (USDT / USDC)",
  BINANCE_PAY: "Binance Pay",
  BANK: "Transferencia bancaria",
  WISE: "Wise",
};

export const CRYPTO_NETWORKS = ["Tron (TRC-20)", "Ethereum (ERC-20)", "BNB Chain (BEP-20)", "Polygon", "Solana", "Base", "Arbitrum"];

export const PAYOUT_FIELDS: Record<PayoutMethod, Array<{ key: string; label: string; placeholder?: string; optional?: boolean }>> = {
  CRYPTO: [
    { key: "token", label: "Moneda" },
    { key: "network", label: "Red" },
    { key: "address", label: "Dirección de la wallet", placeholder: "0x… / T…" },
  ],
  BINANCE_PAY: [{ key: "payId", label: "Binance Pay ID o email" }],
  BANK: [
    { key: "holder", label: "Titular de la cuenta" },
    { key: "bank", label: "Banco" },
    { key: "country", label: "País de la cuenta" },
    { key: "account", label: "Nº de cuenta / CBU / CLABE / IBAN" },
    { key: "taxId", label: "CUIT / CPF / RFC (opcional)", optional: true },
  ],
  WISE: [
    { key: "holder", label: "Titular" },
    { key: "email", label: "Email de Wise" },
  ],
};

export function describePayout(method?: string | null, details?: PayoutDetails | null): Array<[string, string]> {
  if (!method || !details) return [];
  const fields = PAYOUT_FIELDS[method as PayoutMethod] || [];
  return [
    ["Método", PAYOUT_METHOD_LABEL[method as PayoutMethod] || method],
    ...fields.filter((f) => details[f.key]).map((f) => [f.label, details[f.key]] as [string, string]),
  ];
}

export const PAYOUT_STATUS_LABEL: Record<string, string> = {
  NOT_DUE: "Aún no corresponde",
  DUE: "Pendiente de pago",
  PAID: "Pagado",
};

export const SUBMISSION_STATUS: Record<string, { label: string; variant: "warning" | "success" | "destructive" | "secondary" }> = {
  SUBMITTED: { label: "En revisión", variant: "warning" },
  CHANGES_REQUESTED: { label: "Cambios pedidos", variant: "destructive" },
  APPROVED: { label: "Aprobado · falta publicar", variant: "success" },
  PUBLISHED: { label: "Publicado · por verificar", variant: "warning" },
  VERIFIED: { label: "Verificado", variant: "success" },
};

// Enlaces de una entrega de contenido.
export const DRAFT_LINK = { key: "draft", label: "Borrador (Google Drive / Dropbox)", placeholder: "https://drive.google.com/… o https://www.dropbox.com/…" };
export const POST_LINKS = [
  { key: "x", label: "X", placeholder: "https://x.com/usuario/status/…" },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/p/… o /reel/…" },
  { key: "tiktok", label: "TikTok", placeholder: "https://www.tiktok.com/@usuario/video/…" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/watch?v=… o /shorts/…" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/posts/…" },
  { key: "twitch", label: "Twitch", placeholder: "https://www.twitch.tv/videos/…" },
  { key: "other", label: "Otro (blog, newsletter, Telegram…)", placeholder: "https://…" },
] as const;
export const LINK_LABEL: Record<string, string> = Object.fromEntries([
  [DRAFT_LINK.key, "Borrador"],
  ...POST_LINKS.map((l) => [l.key, l.label.split(" (")[0]]),
]);

/** Enlaces de una entrega, normalizando las antiguas (contentUrl/postUrl). */
export function submissionLinks(s: { links?: Record<string, string> | null; contentUrl?: string | null; postUrl?: string | null }): Array<[string, string]> {
  const l: Record<string, string> = { ...(s.links || {}) };
  if (!s.links) {
    if (s.contentUrl) l.draft = s.contentUrl;
    if (s.postUrl) l.other = s.postUrl;
  }
  const order = [DRAFT_LINK.key, ...POST_LINKS.map((p) => p.key)];
  return order.filter((k) => l[k]).map((k) => [k, l[k]]);
}
