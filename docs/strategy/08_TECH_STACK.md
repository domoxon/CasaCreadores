# 08 — Tech Stack
**Casa Creadores**

---

## Guiding Principle

Given a $300/month operating budget, every technology choice must default to:
1. Free tier first
2. Paid only when traffic or need justifies it
3. No over-engineering — build what's needed now, not what might be needed later

---

## Frontend

| Choice | Tool | Why |
|---|---|---|
| Framework | **Next.js** (React) | SSR for SEO, API routes for backend logic, Vercel-native |
| Styling | **Tailwind CSS** | Fast to build, consistent, no CSS file bloat |
| Component library | **shadcn/ui** | Free, beautiful, Tailwind-based, easy to customise |
| Icons | **Lucide React** | Clean, free, included with shadcn |
| Animations | **Framer Motion** | Smooth UI transitions, free |

---

## Backend

| Choice | Tool | Why |
|---|---|---|
| API routes | **Next.js API Routes** | No separate backend server needed at launch |
| Language | **TypeScript** | Type safety, better for team collaboration |
| Environment variables | **.env.local** + Vercel env config | Keeps API keys secure, never in frontend |

---

## Database (Phase 2 — not needed at launch)

At launch, no database is needed. Creator applications go to a form tool, not a custom DB.

When needed (Phase 2):
| Option | Tool | Why |
|---|---|---|
| Database | **Supabase** (PostgreSQL) | Free tier generous, built-in auth, real-time |
| ORM | **Prisma** | Type-safe, pairs well with Next.js |

---

## Hosting & Deployment

| Service | Tool | Cost |
|---|---|---|
| Hosting | **Vercel** | Free tier — perfect for Next.js, auto-deploys from GitHub |
| Domain | **Namecheap** or **Cloudflare** | ~$10–$15/year for .com |
| DNS | **Cloudflare** free tier | Fast DNS, DDoS protection, free |

---

## External APIs

### Calculator Tool
| Platform | API | Auth | Cost |
|---|---|---|---|
| YouTube | YouTube Data API v3 | API Key | Free |
| Twitch | Twitch Helix API | Client ID + Secret | Free |
| Instagram | RapidAPI Instagram Scraper | RapidAPI Key | Free tier (500 req/mo) |
| TikTok | ScrapTik via RapidAPI | RapidAPI Key | Free tier |
| X (Twitter) | RapidAPI Twitter Scraper | RapidAPI Key | Free tier |
| LinkedIn | No API — manual input mode | N/A | Free |

All keys stored as server-side environment variables. All API calls run server-side only.

**RapidAPI dashboard:** https://rapidapi.com/developer/dashboard
**Google Cloud Console:** https://console.cloud.google.com
**Twitch Dev Console:** https://dev.twitch.tv/console

---

## Forms

| Form | Tool | Cost |
|---|---|---|
| Creator application | **Tally.so** | Free tier — unlimited forms, clean UI, Notion-like builder |
| Brand campaign brief | **Tally.so** | Free tier |
| Contact / email us | Native form in Next.js → send via Resend | Free tier |

**Why Tally over Typeform:** Tally free tier has no submission limits. Typeform free tier caps at 10 responses/month.

---

## Email

| Use Case | Tool | Cost |
|---|---|---|
| Transactional (form confirmations, welcome emails) | **Resend** | Free tier: 3,000 emails/mo |
| Marketing / newsletter | **Beehiiv** or **Mailchimp** | Free tiers available |

---

## Analytics

| Tool | Purpose | Cost |
|---|---|---|
| **Google Analytics 4** | Website traffic, calculator usage, conversions | Free |
| **Vercel Analytics** | Core web vitals, performance | Free tier |
| **Metricool** | Campaign analytics, creator post tracking | ~$18/mo |

---

## Calendar / Booking

| Tool | Purpose | Cost |
|---|---|---|
| **Calendly** | Brand discovery call booking | Free tier (1 event type) |

---

## Payments (Creator Payouts)

| Method | Tool | Notes |
|---|---|---|
| Crypto (primary) | **Binance Pay** or direct wallet | USDT/USDC, no fees, LATAM-friendly |
| Bank transfer | **Wise** (Transferwise) | Good for Brazil/Mexico bank transfers |
| Platform | **Deel** (Phase 2) | Handles contracts + payments, ~$49/mo |

---

## Internal Operations (No-Code)

| Tool | Purpose | Cost |
|---|---|---|
| **Notion** | Creator roster, campaign tracker, internal docs | Free team plan |
| **Canva Pro** | Campaign reports, pitch decks, brand assets | ~$13/mo |

---

## Community

| Tool | Purpose | Cost |
|---|---|---|
| **Discord** | Creator community | Free |
| **Whop.com** | Paid Discord tier gating + payments | Free + small % fee on transactions |

---

## Security

- All API keys in environment variables, never committed to Git
- Rate limiting on calculator endpoint: 10 requests/IP/hour (built into Next.js API route)
- 24-hour response caching per handle to reduce API quota usage
- No PII stored from calculator usage
- Form submissions go to Tally (their storage) + email notification to you

---

## Monthly Cost Summary

| Tool | Monthly Cost |
|---|---|
| Vercel hosting | $0 |
| Domain (amortised) | ~$1 |
| RapidAPI (IG + TikTok scrapers) | $0–$15 |
| Metricool Essential | ~$18 |
| Canva Pro | ~$13 |
| Resend email | $0 |
| Tally forms | $0 |
| Calendly | $0 |
| Discord | $0 |
| Notion | $0 |
| **Total** | **~$32–$47/mo** |

Well within $300/month budget, leaving significant buffer for paid API upgrades when traffic grows.

---

## Build Order

1. Set up GitHub repo + Vercel project + custom domain
2. Build website shell (pages, nav, footer) in Next.js + Tailwind
3. Build homepage with static content
4. Build calculator (most complex feature — API integrations)
5. Build creator application page (Tally embed)
6. Build brand/contact pages (Calendly + contact form)
7. Set up Discord server
8. Set up Metricool for campaign tracking
9. Launch

Phase 2 (post-validation):
10. Add Supabase database for creator roster management
11. Add client login + campaign dashboard
12. Add blog/SEO content
