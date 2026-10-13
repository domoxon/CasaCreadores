import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

type CtaBandProps = {
  title?: string;
  copy?: string;
};

export function CtaBand({
  title = "Ready to reach LATAM?",
  copy = "Tell us the goal, country, and platform. We will propose a creator and measurement plan within 24 hours.",
}: CtaBandProps) {
  return (
    <section className="bg-[var(--ink)] py-16 text-white">
      <div className="container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow text-[var(--maize)]">Next step</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-black leading-none tracking-normal md:text-6xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{copy}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link className="button button-primary" href="/contact">
            <CalendarDays size={18} aria-hidden /> Book a call
          </Link>
          <Link className="button border-white/18 bg-white/10 text-white hover:bg-white/16" href="/apply">
            Apply as a creator <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
