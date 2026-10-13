# 10 — Campaign Tracking & Reporting
**Casa Creadores**

---

## Philosophy

At this stage, we run a **lean reporting operation**. No custom dashboards, no complex integrations. We track what matters to brands, we compile it clearly, and we deliver it professionally. As the business grows, we automate.

---

## Tools We Use

| Tool | Purpose | Cost |
|---|---|---|
| **Metricool** (Essential plan) | Creator post analytics, scheduling, reports | ~$18/mo |
| **Bitly** or **Rebrandly** | UTM link creation and click tracking | Free |
| **Google Analytics 4** | Receives UTM click data on brand's site (brand shares access) | Free |
| **Canva Pro** | Campaign report design (PDF) | ~$13/mo (shared with brand assets budget) |
| **Notion** | Internal campaign tracker | Free |

---

## UTM Link Tracking

Every campaign creator gets a unique UTM link to include in their bio, stories link, or post caption.

### UTM Structure
```
https://brandsite.com/landing?
utm_source=casacreadores
&utm_medium=[platform]
&utm_campaign=[campaign_slug]
&utm_creator=[creator_handle]
```

**Example:**
```
https://bybit.com/register?
utm_source=casacreadores
&utm_medium=instagram
&utm_campaign=bybit_latam_q3
&utm_creator=marinabtc
```

### How to Create UTM Links
Use Google's Campaign URL Builder: https://ga.google.com/analytics/web/template?type=AD_HOC
Or Bitly's built-in UTM builder for shortened, trackable links.

### What UTM Tracking Shows
- Total clicks per creator
- Total clicks per platform
- Which creators drove the most traffic
- Conversion rate (if brand shares GA access or reports conversions)

**Limitation:** UTM only tracks clicks. It cannot track users who saw the post and converted without clicking the link. Always caveat this in reports.

---

## Metrics We Track Per Campaign

### Post-Level Metrics (Collected from Creator)
Creators submit these after each post via a simple Tally form or WhatsApp message:

- Post URL
- Platform
- Date posted
- Screenshot of native analytics showing:
  - Views / Impressions
  - Likes
  - Comments
  - Shares / Saves (where applicable)

### Platform-Level Metrics (Via Metricool, where connected)
- Reach
- Impressions
- Engagement rate
- Best performing post

### Campaign-Level Metrics (Compiled by Casa Creadores)
- Total posts live
- Total impressions (sum)
- Total engagements (sum)
- Average engagement rate (across creators)
- Total link clicks (from UTM/Bitly)
- Cost per engagement (total brand spend / total engagements)
- Cost per click (total brand spend / total clicks)

---

## Metricool Setup Per Campaign

1. Create a new "Brand" workspace in Metricool for each client campaign
2. Connect social accounts where possible (requires creator to grant access or share login — optional, not mandatory)
3. Use Metricool's link tracking feature for UTM links
4. Pull analytics report from Metricool at campaign end
5. Export as PDF or use data in Canva report template

> If creators don't connect Metricool, use screenshot submissions instead. Metricool is mainly used for tracking your own posts and UTM links at this stage.

---

## Creator Reporting Process

**During campaign:**
- Creators submit post URL + screenshot within 24 hours of posting
- Submission method: simple Tally form (link sent in WhatsApp/Telegram group or Discord #active-campaigns)

**Tally form fields:**
- Your handle
- Platform
- Post URL
- Date posted
- Upload screenshot of analytics
- Any notable comments / community reaction (qualitative)

**After campaign:**
- Casa Creadores collates all submissions into Notion tracker
- Cross-references with UTM click data from Bitly/GA
- Builds campaign report

---

## Notion Campaign Tracker Structure

Create one Notion database with the following properties per campaign:

| Property | Type |
|---|---|
| Campaign Name | Title |
| Brand | Text |
| Status | Select: Briefing / Active / Reporting / Complete |
| Start Date | Date |
| End Date | Date |
| Total Budget | Number |
| Creators Assigned | Relation (to Creator DB) |
| Posts Live | Number |
| Total Impressions | Number |
| Total Engagements | Number |
| Avg ER % | Number |
| Total Clicks | Number |
| Report Sent | Checkbox |
| Notes | Text |

---

## Campaign Report Format

Delivered as a **PDF via email** within 5 business days of campaign end.

**Report sections:**

### 1. Campaign Overview (1 page)
- Brand name, campaign name, dates
- Goal / objective stated at brief stage
- Creator count, platforms, countries

### 2. Performance Summary (1 page)
- Total impressions
- Total engagements
- Average engagement rate
- Total link clicks
- Cost per engagement
- Cost per click
- vs. benchmark (industry average ER for platform/tier)

### 3. Creator Breakdown (1 page)
- Table: Creator handle | Platform | Followers | Posts | Impressions | ER% | Clicks
- Top performer highlighted

### 4. Selected Content (1 page)
- Screenshots of 3–5 best performing posts
- With their individual metrics shown

### 5. Qualitative Insights (1 page)
- Notable comments / community reactions
- Which content formats performed best
- Any unexpected audiences reached
- Recommendations for next campaign

### 6. Next Steps (1 page)
- Suggested follow-up campaign package
- Creators recommended for repeat engagement
- Platforms to expand or pull back on

---

## Mid-Campaign Check-In (For Fuego and Escala Campaigns)

For campaigns longer than 2 weeks, send a brief mid-campaign update:
- Posts live so far: X of Y
- Impressions to date: X
- Top performing post so far
- Any issues flagged

This builds client confidence and creates opportunities to adjust if something isn't working.

---

## What We Don't Track (Yet)

- Real-time dashboard (Phase 2 — client login portal)
- Automated metric pulling from creator accounts (Phase 2 — Phyllo integration)
- Brand sales attribution beyond the UTM click (requires brand to share deeper analytics — ask for this, but don't require it)
- Sentiment analysis (Phase 2 — Metricool has this feature at higher tiers)

---

## Escalation: When a Campaign Underperforms

If engagement is significantly below expected benchmarks mid-campaign:

1. Flag to brand immediately — do not wait for the final report
2. Identify cause: wrong creator match, weak brief, poor timing, platform algorithm
3. Offer corrective action: additional post from a different creator, revised content brief, extended campaign window
4. Document in report with honest assessment + lesson learned

Clients respect honesty and problem-solving. They do not respect silence.
