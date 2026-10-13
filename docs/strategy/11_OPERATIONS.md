# 11 — Operations & Internal Setup
**Casa Creadores**

---

## Guiding Principle

Keep operations as lean as possible. At this stage, two people running the business need clarity, not complexity. Every process should be simple enough to do consistently without reminders.

---

## Notion Workspace Structure

Notion is the single source of truth for internal operations.

```
Casa Creadores (Notion workspace)
├── 📋 Campaigns
│   ├── Campaign Tracker (database)
│   └── Campaign Templates
├── 👥 Creators
│   ├── Creator Roster (database)
│   └── Application Review Queue
├── 🏢 Brands
│   ├── Brand Pipeline (CRM-lite)
│   └── Brand Contracts Folder
├── 📊 Reporting
│   ├── Report Templates
│   └── Completed Reports Archive
├── 📁 Resources
│   ├── Creator Brief Template
│   ├── Brand Proposal Template
│   ├── UTM Link Log
│   └── This MD files folder
└── 🗓️ Weekly Operations
    └── Weekly check-in notes
```

---

## Creator Roster Database (Notion)

Properties per creator:

| Property | Type | Notes |
|---|---|---|
| Name | Title | Full name |
| Handle(s) | Text | All platform handles |
| Country | Select | Argentina, Brazil, Mexico, etc. |
| Primary Platform | Select | IG, TikTok, YouTube, X, LinkedIn, Twitch |
| Follower Count | Number | Primary platform |
| Engagement Rate | Number | % on primary platform |
| Tier | Select | Nano / Micro / Mid |
| Niche | Multi-select | Crypto, DeFi, Fintech, Tech, Entrepreneur |
| Language | Multi-select | Spanish, Portuguese, English |
| Payment Method | Select | USDT, Bank, Binance Pay |
| Payment Details | Text | Wallet address or bank info |
| Status | Select | Applied / Approved / Active / Paused / Removed |
| Campaigns | Relation | Links to Campaign Tracker |
| Discord Status | Select | Free / Paid / Not Joined |
| Notes | Text | Anything relevant |
| Date Joined | Date | |

---

## Brand Pipeline Database (Notion)

Properties per brand lead:

| Property | Type | Notes |
|---|---|---|
| Brand Name | Title | |
| Contact Name | Text | |
| Contact Email | Text | |
| Contact LinkedIn | URL | |
| Industry | Select | Crypto Exchange, DeFi, Fintech, B2B SaaS |
| Stage | Select | Prospect / Contacted / Call Booked / Proposal Sent / Negotiating / Won / Lost |
| Budget Range | Select | <$500 / $500–$1,500 / $1,500–$5,000 / $5,000+ |
| Target Countries | Multi-select | |
| Source | Select | Outreach / Referral / Inbound |
| Last Contact Date | Date | |
| Next Action | Text | |
| Notes | Text | |
| Campaigns | Relation | Links to Campaign Tracker |

---

## Weekly Operations Rhythm

### Every Monday (~30 min)
- Review Brand Pipeline: any follow-ups needed?
- Review Campaign Tracker: any active campaigns? Any deadlines this week?
- Check creator application queue: any new applications to review?
- Check Discord: any creator questions or deal flow updates?

### Every Friday (~15 min)
- Log any outreach sent that week to Brand Pipeline
- Check UTM link clicks for any active campaigns
- Note anything to improve for the following week

### Monthly (~1 hour)
- Pull Metricool report for any completed campaigns
- Send campaign reports to any completed brand clients
- Post LATAM Creator Brief to Discord
- Review creator roster: anyone to feature or upgrade?
- Review Discord membership numbers and revenue
- Review operating costs vs budget

---

## Outreach Tracker

Track all brand outreach in the Brand Pipeline Notion database. For each outreach:

- Date contacted
- Platform used (LinkedIn / Email / X / Instagram)
- Message sent (or link to message template)
- Response: Yes / No / Follow-up needed
- Next step

**Target:** 20 outreach messages per week, minimum. Even at a 5% conversion rate, that's 1 new brand conversation per week.

---

## Campaign Operations Checklist

Use this for every campaign from brief to report.

**Pre-Campaign**
- [ ] Brand brief received and confirmed
- [ ] Campaign package agreed and deposit invoice sent
- [ ] Deposit received
- [ ] UTM links created and logged
- [ ] Creators selected from roster and matched to brief
- [ ] Creator briefs sent (content guidelines, key messages, disclosure requirements, deadline)
- [ ] Creators confirmed participation
- [ ] Content draft submission deadline set
- [ ] Metricool set up for campaign tracking

**During Campaign**
- [ ] Content drafts reviewed (if applicable)
- [ ] Posts going live on schedule
- [ ] Creator submissions collected (post URL + analytics screenshot)
- [ ] UTM clicks monitored
- [ ] Mid-campaign update sent to brand (if campaign >2 weeks)

**Post-Campaign**
- [ ] All creator submissions received
- [ ] Data compiled in Notion campaign tracker
- [ ] Report drafted in Canva
- [ ] Report reviewed internally
- [ ] Report sent to brand
- [ ] Final invoice sent (remaining 50%)
- [ ] Payment received
- [ ] Creators paid (within agreed window)
- [ ] Campaign marked Complete in Notion
- [ ] Upsell / renewal conversation initiated

---

## Communication Channels

| Who | Channel | Notes |
|---|---|---|
| Brands | Email (primary) | Professional, paper trail |
| Brands | WhatsApp (secondary) | Once relationship is established |
| Creators | WhatsApp or Telegram | Most LATAM creators prefer this |
| Creators | Discord | For community and deal flow |
| Internal (team) | WhatsApp or Notion comments | Keep it simple |

---

## File Naming Convention

Keep all files organised with consistent naming:

```
[YYYYMM]_[BrandName]_[CampaignName]_[FileType]

Examples:
202508_Bybit_LATAMLaunch_Brief.pdf
202508_Bybit_LATAMLaunch_Report.pdf
202508_Bybit_LATAMLaunch_CreatorList.xlsx
202508_CreatorRoster_August.xlsx
```

---

## What Not to Build Right Now

To stay focused and within budget, explicitly defer:

- ❌ Custom client login portal (use PDF reports instead)
- ❌ Automated creator payment system (manual USDT transfers for now)
- ❌ Custom CRM (use Notion Brand Pipeline)
- ❌ Blog / SEO content (Phase 2)
- ❌ Automated creator onboarding flow (manual email + Tally form is enough)
- ❌ Mobile app (website only)
