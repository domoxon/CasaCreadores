# 05 — Website Structure
**Casa Creadores**

---

## Reference
Based on the structure of https://thecreatorverse.xyz/ adapted for LATAM positioning.

---

## Pages

### 1. Homepage `/`

**Above the fold:**
- Headline: "LATAM's Creator Network for Crypto & Tech"
- Subheadline: "Connect your brand with trusted voices across Argentina, Brazil, Mexico, Colombia and beyond."
- Two CTAs side by side:
  - "Launch a Campaign" → scrolls to or links to campaign booking section
  - "Join as a Creator" → links to `/creators`
- Animated live stats bar (mirroring Creatorverse):
  - Total Creators in Network
  - Total Impressions Delivered
  - Average Engagement Rate
  - Countries Represented

**Social proof strip:**
- Platform icons: Instagram, TikTok, YouTube, X, LinkedIn, Twitch

**How It Works (3 steps):**
1. Brief us on your campaign goals
2. We match you with vetted LATAM creators
3. Content goes live, you get full analytics

**Creator Showcase:**
- Scrolling row of creator profile cards (name, handle, platform, followers, ER %)
- Pulls from founding cohort — real profiles

**Platform Stats Section:**
- Visual breakdown of network by platform and country

**Campaign CTA Section:**
- "Ready to reach LATAM?" 
- Two buttons: "Book a Call" (Calendly) + "Email Us" (contact form)

**Footer:**
- Links: Home, For Brands, For Creators, Calculator, Blog (future), Discord
- Social: X, Instagram, LinkedIn
- Legal: Terms, Privacy Policy
- Language toggle: ES / PT / EN

---

### 2. For Brands `/brands`

- Hero: "Reach the fastest-growing crypto market in the world"
- Why LATAM section (stats: adoption rates, user growth, language gap)
- Why LinkedIn section (B2B differentiator, decision-maker audience quality)
- Campaign packages: Spark / Fuego / Escala cards with pricing
- Creator network stats
- Process walkthrough (how a campaign works step by step)
- FAQ (budget, timeline, content rights, platforms)
- Book a Call / Email Us CTA

---

### 3. For Creators `/creators`

- Hero: "Get paid to create crypto content you already love"
- What we offer creators:
  - Paid brand deals
  - USDT/USDC payments
  - Community access (Discord)
  - Your rate estimate (link to Calculator)
- Supported platforms listed
- Creator tier breakdown (Nano / Micro / Mid)
- Application CTA → links to `/apply`
- FAQ (vetting, payment, content guidelines)

---

### 4. Creator Application `/apply`

- Embedded form (all fields from `03_CREATOR_STRATEGY.md`)
- Keep it clean and simple — max 2 pages of fields
- Progress indicator (Step 1 of 2)
- Thank you page on submission with next steps explained

---

### 5. Calculator `/calculator`

- Full engagement rate calculator
- Platform tabs: Instagram, TikTok, YouTube, X, Twitch, LinkedIn
- Handle input → results card
- Results show:
  - Engagement Rate %
  - ER benchmark (Poor / Average / Good / Excellent)
  - Average Likes per post
  - Average Views/Impressions per post
  - Estimated earnings per post range
- CTA below results: "Apply to join Casa Creadores and start earning"
- More detail in `06_CALCULATOR.md`

---

### 6. Blog `/blog` _(Phase 2)_

- SEO content targeting LATAM crypto marketing searches
- Example posts:
  - "How to find crypto influencers in Argentina"
  - "LinkedIn creator marketing for fintech brands in LATAM"
  - "What is a good engagement rate for TikTok in Brazil?"
- Drives organic traffic to calculator and brand pages

---

### 7. Contact `/contact`

- Two options:
  - Book a call (Calendly embed)
  - Send a message (form: name, company, email, message, budget range dropdown)
- Response time promise: "We respond within 24 hours"

---

### 8. Legal Pages
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- `/creator-terms` — Creator Agreement summary

---

## Navigation Structure

**Primary Nav:**
- For Brands
- For Creators
- Calculator
- Community (Discord link)

**Secondary Nav / Footer:**
- Blog (Phase 2)
- Contact
- Apply (Creators)
- Terms / Privacy

---

## Design Direction

- **Tone:** Confident, warm, LATAM-authentic — not cold/corporate
- **Language:** Spanish-first on creator-facing pages, English on brand-facing pages, toggle for both
- **Colour palette:** To be defined during brand identity phase — suggest rich, warm tones that feel distinctly LATAM without being clichéd (avoid generic "tropical" palette)
- **Typography:** Clean, modern — legible at small sizes for stats-heavy sections
- **Imagery:** Real LATAM creator faces where possible; avoid stock photos of generic influencers
- **Mobile-first:** Majority of LATAM web traffic is mobile

---

## Tech Stack for Website

See `08_TECH_STACK.md` for full details. Summary:
- Framework: Next.js (React)
- Styling: Tailwind CSS
- Hosting: Vercel (free tier sufficient at launch)
- Forms: native or Typeform embed
- Calendar booking: Calendly free tier
- Analytics: Google Analytics 4 (free)
