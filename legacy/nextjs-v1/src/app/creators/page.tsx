import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { SectionHeading } from "@/components/section-heading";
import { creatorBenefits, creatorTiers, platforms } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "For creators",
  description: "Join Casa Creadores and receive paid opportunities with crypto, fintech, and tech brands.",
};

const requirements = [
  "Public profile on at least one accepted platform.",
  "Spanish, Portuguese, or bilingual content.",
  "At least 50% of content focused on crypto, fintech, technology, or entrepreneurship.",
  "No history of promoting scams or projects without disclosure.",
];

export default function CreatorsPage() {
  return (
    <>
      <section className="section">
        <div className="container grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="eyebrow">For creators</p>
            <h1 className="mt-5 text-5xl font-black leading-none tracking-normal md:text-7xl">
              Get paid to create the crypto and tech content you already love.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Casa Creadores connects LATAM voices with brands that need local, honest, measurable content.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button button-primary" href="/apply">
                Apply to the network <ArrowRight size={18} aria-hidden />
              </Link>
              <Link className="button button-secondary" href="/contact">
                Ask about deals
              </Link>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-2xl font-black">Base requirements</h2>
            <ul className="mt-5 space-y-4">
              {requirements.map((item) => (
                <li key={item} className="flex gap-3 leading-7 text-[var(--muted)]">
                  <CheckCircle2 className="mt-1 shrink-0 text-[var(--jade)]" size={20} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-[var(--paper)]">
        <div className="container">
          <SectionHeading
            eyebrow="Benefits"
            title="A team that protects your work and your payout."
            lede="We prioritize clear briefs, reliable payments, and brands that fit your audience."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {creatorBenefits.map((item) => (
              <article key={item.title} className="card p-6">
                <item.icon size={28} className="text-[var(--terracotta)]" aria-hidden />
                <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Platforms"
            title="We accept niche audiences across six channels."
            lede="LinkedIn has a lower threshold because a small professional audience can be very valuable for B2B."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <span key={platform} className="rounded-lg border border-[var(--line)] bg-white px-4 py-3 font-black">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[var(--paper)]">
        <div className="container">
          <SectionHeading eyebrow="Tiers" title="Every audience size has value." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {creatorTiers.map((tier) => (
              <article key={tier.tier} className="card p-6">
                <p className="text-sm font-black uppercase tracking-normal text-[var(--terracotta)]">{tier.range}</p>
                <h3 className="mt-3 text-3xl font-black">{tier.tier}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{tier.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Apply as a founding creator." copy="We are looking for the first 20-30 creators to build the network before opening public applications at scale." />
    </>
  );
}
