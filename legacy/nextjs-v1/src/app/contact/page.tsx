import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Book a call or send a campaign brief to launch a LATAM creator campaign.",
};

export default function ContactPage() {
  return (
    <section className="section">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside>
          <SectionHeading
            eyebrow="Contact"
            title="Tell us which market you want to win."
            lede="We respond within 24 hours with next steps, campaign questions, or a package recommendation."
          />
          <div className="mt-8 grid gap-4">
            <Link className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5" href="https://calendly.com/casa-creadores/discovery">
              <CalendarDays className="text-[var(--terracotta)]" size={28} aria-hidden />
              <div>
                <h2 className="font-black">Book a call</h2>
                <p className="text-sm text-[var(--muted)]">30-minute call.</p>
              </div>
            </Link>
            <Link className="card flex items-center gap-4 p-5 transition hover:-translate-y-0.5" href="mailto:hola@casacreadores.com">
              <Mail className="text-[var(--sky)]" size={28} aria-hidden />
              <div>
                <h2 className="font-black">Send email</h2>
                <p className="text-sm text-[var(--muted)]">hola@casacreadores.com</p>
              </div>
            </Link>
          </div>
        </aside>

        <form className="card p-6">
          <h2 className="text-2xl font-black">Initial brief</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-black">
              Name
              <input className="field" name="name" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Email
              <input className="field" name="email" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Brand
              <input className="field" name="brand" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Website
              <input className="field" name="website" type="url" />
            </label>
            <label className="grid gap-2 text-sm font-black">
              Goal
              <select className="field" name="goal">
                <option>Awareness</option>
                <option>Signups</option>
                <option>Conversions</option>
                <option>Community</option>
                <option>B2B authority</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black">
              Budget
              <select className="field" name="budget">
                <option>$500-$1,500</option>
                <option>$1,500-$5,000</option>
                <option>$5,000+</option>
                <option>To define</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-black md:col-span-2">
              Target countries
              <input className="field" name="countries" placeholder="Argentina, Brazil, Mexico..." />
            </label>
            <label className="grid gap-2 text-sm font-black md:col-span-2">
              Message
              <textarea className="field min-h-36 resize-y" name="message" />
            </label>
          </div>
          <button className="button button-primary mt-6" type="submit">
            Send brief <ArrowRight size={18} aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}
