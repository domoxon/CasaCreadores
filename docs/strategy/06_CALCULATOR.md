# 06 — Engagement Rate Calculator
**Casa Creadores**

---

## Purpose

A free, public tool on the Casa Creadores website that allows any creator or brand to enter a social media handle and instantly see:
1. Engagement rate (%)
2. ER benchmark (how it compares to industry averages)
3. Average likes and views per post
4. Estimated earnings per post range

Secondary purpose: creator acquisition funnel. After results are shown, prompt creators to apply to the network.

---

## Reference
- Design reference: https://fuelyourbrands.com/calculator
- Benchmark reference: https://thesocialcat.com/tools/instagram-engagement-rate-calculator

---

## Supported Platforms

| Platform | Data Source | Auth Required | Notes |
|---|---|---|---|
| Instagram | RapidAPI scraper | No | Public profiles only |
| TikTok | ScrapTik via RapidAPI | No | Public profiles only |
| YouTube | YouTube Data API v3 (official) | No (API key only) | Free, generous quota |
| X (Twitter) | RapidAPI scraper | No | Public profiles only |
| Twitch | Twitch Helix API (official) | No (client credentials) | Free |
| LinkedIn | Manual / not scraped | N/A | See note below |

> **LinkedIn note:** LinkedIn cannot be scraped without violating ToS and has no usable public data API. For LinkedIn, the calculator will use a **manual input mode** — user enters their own follower count and average likes/comments from their last 10 posts, and the tool calculates ER client-side with no API call. Clearly label this as "Self-reported data."

---

## API Links & Credentials Needed

### YouTube Data API v3
- Console: https://console.cloud.google.com
- Docs: https://developers.google.com/youtube/v3
- Getting started: https://developers.google.com/youtube/v3/getting-started
- Cost: Free (10,000 units/day)
- Credential type: API Key (no OAuth needed for public data)

### Twitch Helix API
- App registration: https://dev.twitch.tv/console
- Docs: https://dev.twitch.tv/docs/api
- Cost: Free
- Credential type: Client ID + Client Secret → exchange for App Access Token

### RapidAPI (Instagram + TikTok + X)
- Account: https://rapidapi.com
- Instagram scraper: https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2
- TikTok (ScrapTik): https://rapidapi.com/scraptik-api-scraptik-api-default/api/scraptik
- Cost: Free tiers available; Instagram free = 500 req/mo; TikTok free tier varies
- Credential type: Single RapidAPI key (works across all RapidAPI providers)

---

## Data Points Fetched Per Platform

### Instagram
- Follower count
- Last 12 posts: likes, comments per post
- Profile: username, profile pic, bio, post count

### TikTok
- Follower count
- Last 12 videos: likes, comments, shares, views per video
- Profile: username, avatar

### YouTube
- Subscriber count
- Last 10 videos: view count, like count, comment count
- Channel: name, thumbnail

### X (Twitter)
- Follower count
- Last 10 posts: likes, reposts, replies, impressions (if available)

### Twitch
- Follower count
- Average concurrent viewers (last 30 streams if available)
- Stream count

### LinkedIn (Manual Input)
- User inputs: follower/connection count, avg likes, avg comments on last 10 posts
- Calculated client-side, no API

---

## Engagement Rate Formulas

### Instagram
```
ER = (avg likes + avg comments) / followers × 100
```

### TikTok
```
ER = (avg likes + avg comments + avg shares) / followers × 100
```

### YouTube
```
ER = (avg likes + avg comments) / avg views × 100
```
> Note: YouTube ER is views-based, not subscriber-based, as views better reflect actual reach.

### X (Twitter)
```
ER = (avg likes + avg reposts + avg replies) / followers × 100
```
> If impressions are available: ER = total engagements / impressions × 100

### Twitch
```
ER = avg concurrent viewers / followers × 100
```

### LinkedIn (Manual)
```
ER = (avg likes + avg comments) / followers × 100
```

### Averaging Method
Use **median** (not mean) across the last 10–12 posts to reduce skew from viral outliers. This matches the approach used by industry reference tools (Social Cat, FuelYourBrands).

---

## ER Benchmark Tiers

### Instagram
| Followers | Excellent | Good | Average | Below Avg | Poor |
|---|---|---|---|---|---|
| 1K–10K | >7% | 4–7% | 2–4% | 1–2% | <1% |
| 10K–100K | >3.5% | 2–3.5% | 1–2% | 0.5–1% | <0.5% |
| 100K–500K | >2.5% | 1.5–2.5% | 0.8–1.5% | 0.4–0.8% | <0.4% |
| 500K+ | >2% | 1–2% | 0.5–1% | 0.3–0.5% | <0.3% |

### TikTok
| Followers | Excellent | Good | Average | Below Avg | Poor |
|---|---|---|---|---|---|
| Any | >9% | 5–9% | 3–5% | 1–3% | <1% |

### YouTube
| Subscribers | Excellent | Good | Average | Below Avg | Poor |
|---|---|---|---|---|---|
| Any | >7% | 4–7% | 2–4% | 1–2% | <1% |

### LinkedIn
| Followers | Excellent | Good | Average | Below Avg | Poor |
|---|---|---|---|---|---|
| Any | >4% | 2–4% | 1–2% | 0.5–1% | <0.5% |

---

## Estimated Earnings Formula

```
Base Rate = follower_tier_base × platform_multiplier
Estimated Rate = Base Rate × ER multiplier × LATAM adjustment (0.4)
```

### Follower Tier Base Rates (USD, global benchmark)
| Tier | Followers | Base Rate/Post |
|---|---|---|
| Nano | 1K–10K | $50 |
| Micro | 10K–100K | $250 |
| Mid | 100K–500K | $1,500 |
| Macro | 500K–1M | $5,000 |
| Mega | 1M+ | $10,000 |

### Platform Multipliers
| Platform | Multiplier |
|---|---|
| Instagram | 1.0 (baseline) |
| TikTok | 0.9 |
| YouTube | 1.3 |
| X (Twitter) | 0.7 |
| Twitch | 0.8 |
| LinkedIn | 1.5 (B2B premium) |

### ER Multiplier
| ER Rating | Multiplier |
|---|---|
| Excellent | 1.5 |
| Good | 1.2 |
| Average | 1.0 |
| Below Average | 0.7 |
| Poor | 0.5 |

### LATAM Adjustment
Multiply final figure by **0.4** to reflect LATAM market rates (approximately 30–50% of US/EU rates).

### Output
Show as a range: `estimated_rate × 0.8` to `estimated_rate × 1.2`

Example output: "Based on your engagement rate, you could earn **$40–$60 per post** on Instagram."

---

## UI Flow

1. User lands on `/calculator`
2. Selects platform tab (Instagram / TikTok / YouTube / X / Twitch / LinkedIn)
3. Enters their handle (or @handle)
4. Clicks "Calculate"
5. Loading state (1–3 seconds while API call runs server-side)
6. Results card appears:
   - Profile picture + username pulled from API
   - Follower count
   - Avg likes / views per post
   - **Engagement Rate: X.X%**
   - ER badge: Excellent / Good / Average / Below Average / Poor
   - **Estimated earnings per post: $X–$X**
7. Below results: "Want to earn from your audience? Apply to join Casa Creadores →"

---

## Backend Architecture

- All API calls made **server-side** (Next.js API routes or edge functions)
- API keys never exposed to client
- Response cached per handle for 24 hours (reduces API quota burn)
- Rate limit: max 10 calculator requests per IP per hour (prevents abuse)
- Error handling: if API fails or account is private, show user-friendly message

---

## Privacy & Data

- No user data stored from calculator usage
- Handles looked up are public profiles only
- Add one-line disclaimer: "We only access publicly available data."
- No cookies placed for calculator use
