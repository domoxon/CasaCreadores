export const CAMPAIGN_PLATFORMS = ["X", "Instagram", "TikTok", "YouTube", "LinkedIn", "Twitch"] as const;
export const CAMPAIGN_COUNTRIES = ["Argentina", "Brasil", "México", "Colombia", "Chile", "Perú", "Uruguay", "Venezuela", "Ecuador", "Toda LATAM"] as const;
export const SOCIAL_FIELDS = [
  { key: "website", label: "Web" },
  { key: "x", label: "X" },
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "telegram", label: "Telegram" },
  { key: "discord", label: "Discord" },
] as const;
export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Publicada",
  PAUSED: "Pausada",
  COMPLETED: "Finalizada",
};
