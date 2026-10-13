import {
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  Handshake,
  LineChart,
  Megaphone,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  Zap,
} from "lucide-react";

export const navItems = [
  { href: "/brands", label: "For brands" },
  { href: "/creators", label: "For creators" },
  { href: "/contact", label: "Contact" },
];

export const stats = [
  { label: "Founding creators", value: "30", detail: "initial cohort" },
  { label: "Priority markets", value: "4", detail: "AR, BR, MX, CO" },
  { label: "Platforms", value: "6", detail: "IG, TikTok, YouTube, X, LinkedIn, Twitch" },
  { label: "Target margin", value: "30%", detail: "managed model" },
];

export const platforms = ["Instagram", "TikTok", "YouTube", "X", "LinkedIn", "Twitch"];

export const countries = [
  {
    name: "Argentina",
    copy: "Stablecoins, financial education, and a tech community already talking about crypto.",
  },
  {
    name: "Brazil",
    copy: "LATAM's largest market, with a huge gap for Portuguese-language creator content.",
  },
  {
    name: "Mexico",
    copy: "Remittances, fintech, and a professional audience that is ideal for LinkedIn campaigns.",
  },
  {
    name: "Colombia",
    copy: "A fast-growing startup ecosystem with active audiences in technology and finance.",
  },
];

export const howItWorks = [
  {
    icon: BriefcaseBusiness,
    title: "Clear brief",
    copy: "We define the goal, country, budget, platform, and approved messaging before launching a campaign.",
  },
  {
    icon: UsersRound,
    title: "Creator matching",
    copy: "We select vetted LATAM voices by niche, language, engagement, and audience trust.",
  },
  {
    icon: BarChart3,
    title: "Content and reporting",
    copy: "We coordinate deliverables, UTMs, metric screenshots, and a final report for the marketing team.",
  },
];

export const packages = [
  {
    name: "Spark",
    price: "$500-$800",
    icon: Sparkles,
    copy: "Fast validation with 5 creators on one platform.",
    features: ["10-14 days", "5 posts", "UTM tracking", "Final PDF report"],
  },
  {
    name: "Fire",
    price: "$1,500-$2,500",
    icon: Zap,
    copy: "A growth campaign with 15 creators across 2-3 platforms.",
    features: ["30 days", "30 posts", "Metricool + UTMs", "Mid-campaign and final reports"],
  },
  {
    name: "Scale",
    price: "Custom",
    icon: LineChart,
    copy: "Retainer or multi-country campaign with LinkedIn and dedicated management.",
    features: ["30+ creators", "60+ days", "Full analytics", "Dedicated manager"],
  },
];

export const creatorBenefits = [
  {
    icon: CircleDollarSign,
    title: "Paid opportunities",
    copy: "Access campaigns from crypto, fintech, and tech brands looking for local voices.",
  },
  {
    icon: WalletCards,
    title: "USDT/USDC payouts",
    copy: "A LATAM-friendly model: 50% on content approval and 50% once the post is confirmed live.",
  },
  {
    icon: MessageCircle,
    title: "Private community",
    copy: "Discord access with opportunities, feedback, resources, and LATAM creator market signals.",
  },
  {
    icon: BadgeDollarSign,
    title: "Transparent deal flow",
    copy: "We share clear campaign terms, expected deliverables, and payment timing before you commit.",
  },
];

export const creatorTiers = [
  {
    tier: "Nano",
    range: "1K-10K",
    copy: "Close-knit communities, strong engagement, and high trust.",
  },
  {
    tier: "Micro",
    range: "10K-100K",
    copy: "The core of the network: reach, specialization, and consistency.",
  },
  {
    tier: "Mid",
    range: "100K-500K",
    copy: "Aspirational creators for campaigns with larger budgets and visibility.",
  },
];

export const applicationFields = [
  "Full name",
  "Country",
  "Primary platform and handle",
  "Other handles",
  "Follower count",
  "Content niche",
  "Content language",
  "Payment preference",
  "Short bio",
  "Three best-performing posts",
  "Previous brand experience",
];

export const complianceItems = [
  {
    icon: ShieldCheck,
    title: "Required disclosure",
    copy: "Every sponsored post must include #ad, #sponsored, or the campaign-specific disclosure language.",
  },
  {
    icon: FileCheck2,
    title: "No financial promises",
    copy: "We do not allow price predictions, guaranteed returns, or financial advice.",
  },
  {
    icon: Handshake,
    title: "Shared responsibility",
    copy: "The brand validates claims; Casa Creadores coordinates clear briefs and a compliance checklist.",
  },
];

export const operations = [
  { icon: Globe2, label: "Hosting", value: "Vercel" },
  { icon: Megaphone, label: "Tracking", value: "UTM + Metricool" },
  { icon: PlayCircle, label: "Forms", value: "Tally or native" },
  { icon: BarChart3, label: "Reports", value: "PDF in 5 days" },
];

export const platformMultipliers: Record<string, number> = {
  instagram: 1,
  tiktok: 0.9,
  youtube: 1.3,
  x: 0.7,
  twitch: 0.8,
  linkedin: 1.5,
};

export const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  x: "X",
  twitch: "Twitch",
  linkedin: "LinkedIn",
};
