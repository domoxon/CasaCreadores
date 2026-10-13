import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { SectionHeading } from "@/components/section-heading";
import { complianceItems, howItWorks, packages } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "For brands",
  description: "Managed UGC campaigns for crypto, fintech, and tech brands that want to grow in LATAM.",
};

const reasons = [
  "Spanish and Portuguese creators with real communities.",
  "LinkedIn as a premium channel for B2B, fintech, and crypto infrastructure.",
  "Payments, briefs, tracking, and reporting managed by one team.",
  "Compliance checklist to avoid risky financial claims.",
];

const faqs = [
  {
    q: "What budget can I start with?",
    a: "Spark starts at $500-$800 to validate a market or message with 5 creators.",
  },
  {
    q: "How long does a campaign take?",
    a: "A Spark campaign usually runs in 10-14 days; Fire and Scale operate across 30 to 60 day windows.",
  },
  {
    q: "What does my team receive at the end?",
    a: "A report with published posts, impressions, engagements, UTM clicks, cost per engagement, and recommendations.",
  },
  {
    q: "Can we reuse creator content?",
    a: "Yes, it is agreed in the campaign brief. The recommended standard is a 12-month paid media license.",
  },
];

export default function BrandsPage() {
  return (
    <>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="eyebrow">For brands</p>
            <h1 className="mt-5 text-5xl font-black leading-none tracking-normal md:text-7xl">
              Reach the fastest-moving crypto and tech market.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              We design campaigns with vetted LATAM creators to build trust, conversation, and clear metrics in
              each target country.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button button-primary" href="/contact">
                Book discovery <ArrowRight size={18} aria-hidden />
              </Link>
              <Link className="button button-secondary" href="/creators">
                View creator network
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl font-black">Why LATAM now</h2>
            <ul className="mt-5 space-y-4">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-3 leading-7 text-[var(--muted)]">
                  <CheckCircle2 className="mt-1 shrink-0 text-[var(--jade)]" size={20} aria-hidden />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-[var(--paper)]">
        <div className="container">
          <SectionHeading
            eyebrow="Process"
            title="Campaign management without improvisation."
            lede="Brief, shortlist, contracts, disclosure, UTMs, tracking, and final reporting in a lean operation."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item) => (
              <article key={item.title} className="card p-6">
                <item.icon className="text-[var(--terracotta)]" size={28} aria-hidden />
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Packages"
            title="Choose the level of signal you need."
            lede="Every package includes creator management, UTM tracking, and reporting. LinkedIn can be added as a premium B2B layer."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <article key={item.name} className="card p-6">
                <item.icon size={28} className="text-[var(--terracotta)]" aria-hidden />
                <h3 className="mt-5 text-3xl font-black">{item.name}</h3>
                <p className="mt-1 text-xl font-black text-[var(--jade)]">{item.price}</p>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.copy}</p>
                <ul className="mt-5 space-y-3">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm font-bold">
                      <CheckCircle2 size={18} className="shrink-0 text-[var(--jade)]" aria-hidden /> {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[var(--paper)]">
        <div className="container">
          <SectionHeading
            eyebrow="Compliance"
            title="Crypto needs responsible content."
            lede="The goal is to sell trust, not regulatory risk. Every brief includes required language and clear limits."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {complianceItems.map((item) => (
              <article key={item.title} className="card p-6">
                <item.icon size={28} className="text-[var(--sky)]" aria-hidden />
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Questions" title="Frequently asked questions." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <article key={faq.q} className="card p-6">
                <h3 className="text-xl font-black">{faq.q}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Let's talk about your next LATAM campaign." copy="Bring the goal, market, and budget. We will propose the creator mix, platforms, and measurement plan." />
    </>
  );
}
