import { NICHOS_CRIPTO } from "@casa-creadores/shared";

export const COUNTRIES = [
  "Argentina", "Brasil", "México", "Colombia", "Chile", "Perú", "Uruguay", "Venezuela", "Ecuador",
  "Bolivia", "Paraguay", "Costa Rica", "Panamá", "República Dominicana", "Guatemala", "España", "Otro",
] as const;
export const LANGUAGES = ["Español", "Português", "English"] as const;
export const PLATFORMS = ["X", "Instagram", "TikTok", "YouTube", "LinkedIn", "Twitch"] as const;
export const CONTENT_TYPES = [
  "Posts escritos", "Hilos", "Video corto (Reels/TikTok)", "Video largo", "Memes / gráficos",
  "Educativo / explicativo", "Noticias / alpha", "Reseñas / UGC", "Streams / podcast",
] as const;
export const PAYOUT_METHODS = ["USDT / USDC", "Binance Pay", "Transferencia bancaria", "Wise"] as const;
export const NICHOS = NICHOS_CRIPTO;
