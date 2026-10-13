import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { SectionHeading } from "@/components/section-heading";
import { countries, howItWorks, operations, packages, platforms, stats } from "@/lib/site-data";

const creators = [
  { name: "Marina BTC", handle: "@marinabtc", platform: "Instagram", followers: "18K", er: "4.8%" },
  { name: "Lucas Fintech", handle: "@lucasfintech", platform: "LinkedIn", followers: "9K", er: "2.1%" },
  { name: "Ana DeFi", handle: "@anadefi", platform: "TikTok", followers: "42K", er: "6.4%" },
  { name: "Bruno Tech", handle: "@brunotech", platform: "YouTube", followers: "31K", er: "5.2%" },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/brand/casa-creadores-banner.png"
            alt=""
            fill
            className="object-cover opacity-18"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_0%,rgba(255,250,242,0.9)_48%,rgba(255,250,242,0.55)_100%)]" />
        </div>
        <div className="container grid items-center gap-12 py-14 md:min-h-[calc(86vh-80px)] md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow">Crypto and tech UGC network</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.96] tracking-normal text-[var(--ink)] md:text-6xl lg:text-7xl">
              LATAM creators for crypto and tech.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              We connect brands that need local trust with vetted voices across Argentina, Brazil, Mexico,
              Colombia, and more markets across the region.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="button button-primary" href="/contact">
                <CalendarDays size={18} aria-hidden /> Launch a campaign
              </Link>
              <Link className="button button-secondary" href="/creators">
                Join as a creator <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
          </div>
          <div className="card hidden p-4 md:block">
            <Image
              src="/brand/casa-creadores-logo.png"
              alt="Casa Creadores"
              width={760}
              height={760}
              className="aspect-square w-full rounded-lg object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper)] py-5">
        <div className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-[var(--line)] bg-white px-5 py-4">
              <strong className="block text-3xl font-black text-[var(--jade-dark)]">{stat.value}</strong>
              <span className="mt-1 block text-sm font-bold text-[var(--ink)]">{stat.label}</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">{stat.detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="From brief to results without operational chaos."
            lede="Casa Creadores combines sales, talent management, and clear reporting so campaigns do not depend on scattered messages."
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

      <section className="bg-[var(--jade-dark)] py-16 text-white">
        <div className="container">
          <p className="eyebrow text-[var(--maize)]">Platforms</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <span key={platform} className="rounded-lg border border-white/14 bg-white/8 px-4 py-3 font-black">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Priority markets"
            title="A network built for the LATAM context."
            lede="We do not simply translate global campaigns: we adapt the message, format, disclosure, and creator fit to the real market."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {countries.map((country) => (
              <article key={country.name} className="border-l-4 border-[var(--terracotta)] bg-white p-5 shadow-sm">
                <h3 className="text-xl font-black">{country.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{country.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-[var(--paper)]">
        <div className="container">
          <SectionHeading
            eyebrow="Founding creators"
            title="Niche voices, not generic inventory."
            lede="The initial cohort prioritizes crypto, DeFi, fintech, technology, entrepreneurship, and LinkedIn professionals."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {creators.map((creator) => (
              <article key={creator.handle} className="card p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--maize)] text-lg font-black text-[var(--ink)]">
                  {creator.name.slice(0, 1)}
                </div>
                <h3 className="mt-5 text-xl font-black">{creator.name}</h3>
                <p className="text-sm text-[var(--muted)]">{creator.handle}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--muted)]">Platform</dt>
                    <dd className="font-black">{creator.platform}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">ER</dt>
                    <dd className="font-black">{creator.er}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Audience</dt>
                    <dd className="font-black">{creator.followers}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Packages"
            title="Campaigns that are simple to buy and easy to measure."
            lede="Spark validates fast, Fire scales learnings, and Scale builds multi-country presence with LinkedIn as a B2B differentiator."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {packages.map((item) => (
              <article key={item.name} className="card p-6">
                <item.icon size={28} className="text-[var(--terracotta)]" aria-hidden />
                <div className="mt-5 flex items-end justify-between gap-3">
                  <h3 className="text-3xl font-black">{item.name}</h3>
                  <strong className="text-lg text-[var(--jade)]">{item.price}</strong>
                </div>
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

      <section className="bg-[var(--paper)] py-10">
        <div className="container grid gap-3 md:grid-cols-4">
          {operations.map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white p-4">
              <item.icon className="text-[var(--sky)]" size={22} aria-hidden />
              <div>
                <p className="text-xs font-black uppercase tracking-normal text-[var(--muted)]">{item.label}</p>
                <p className="font-black">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
