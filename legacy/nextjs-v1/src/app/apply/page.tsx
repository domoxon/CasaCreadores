import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { applicationFields } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join the Casa Creadores founding creator network.",
};

const niches = ["Crypto", "DeFi", "Fintech", "Technology", "Entrepreneurship", "LinkedIn professional"];
const countries = ["Argentina", "Brazil", "Mexico", "Colombia", "Chile", "Peru", "Uruguay", "Venezuela", "Other"];

export default function ApplyPage() {
  return (
    <section className="section">
      <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <aside>
          <SectionHeading
            eyebrow="Application"
            title="Join the founding cohort."
            lede="We review profiles within 5 business days. We are looking for creators with useful content, real audiences, and good judgment for crypto/tech campaigns."
          />
          <div className="mt-8 card p-6">
            <h2 className="text-xl font-black">What we review</h2>
            <ul className="mt-5 space-y-3">
              {applicationFields.map((field) => (
                <li key={field} className="flex gap-2 text-sm font-bold text-[var(--muted)]">
                  <CheckCircle2 size={18} className="shrink-0 text-[var(--jade)]" aria-hidden /> {field}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <form className="card p-6">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[var(--terracotta)]">Step 1 of 2</p>
              <h2 className="mt-1 text-2xl font-black">Creator profile</h2>
            </div>
            <span className="rounded-lg bg-[var(--maize)] px-3 py-2 text-sm font-black">Founders</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black">
              Full name
              <input className="field" name="name" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Country
              <select className="field" name="country">
                {countries.map((country) => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Email
              <input className="field" name="email" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Primary platform
              <select className="field" name="platform">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>X</option>
                <option>LinkedIn</option>
                <option>Twitch</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Primary handle
              <input className="field" name="handle" placeholder="@yourhandle" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Followers
              <input className="field" name="followers" type="number" min="0" />
            </label>
            <label className="grid gap-2 text-sm font-black md:col-span-2">
              Other handles
              <input className="field" name="otherHandles" placeholder="YouTube, LinkedIn, X..." />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Primary niche
              <select className="field" name="niche">
                {niches.map((niche) => (
                  <option key={niche}>{niche}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Payment preference
              <select className="field" name="payment">
                <option>USDT/USDC</option>
                <option>Binance Pay</option>
                <option>Bank transfer</option>
                <option>Wise</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black md:col-span-2">
              Short bio
              <textarea className="field min-h-28 resize-y" name="bio" />
            </label>
            <label className="grid gap-2 text-sm font-black md:col-span-2">
              Three best-performing posts
              <textarea className="field min-h-28 resize-y" name="posts" placeholder="Paste links, one per line" />
            </label>
          </div>

          <label className="mt-5 flex gap-3 text-sm font-bold text-[var(--muted)]">
            <input className="mt-1 h-4 w-4 accent-[var(--terracotta)]" type="checkbox" />
            I agree to receive messages about opportunities, profile review, and next steps.
          </label>

          <button className="button button-primary mt-6" type="submit">
            Submit application <ArrowRight size={18} aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}
