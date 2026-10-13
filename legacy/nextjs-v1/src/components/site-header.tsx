import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { navItems } from "@/lib/site-data";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(255,250,242,0.86)] backdrop-blur-xl">
      <div className="container flex min-h-20 items-center justify-between gap-5">
        <Link className="flex items-center gap-3" href="/" aria-label="Casa Creadores">
          <Image
            src="/brand/casa-creadores-logo.png"
            width={44}
            height={44}
            alt=""
            className="h-11 w-11 rounded-lg object-cover"
            priority
          />
          <span className="text-lg font-black text-[var(--ink)]">Casa Creadores</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-[var(--muted)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} className="transition hover:text-[var(--ink)]" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link className="button button-secondary" href="/apply">
            Apply
          </Link>
          <Link className="button button-primary" href="/contact">
            Book <ArrowRight size={17} aria-hidden />
          </Link>
        </div>
        <Link
          className="inline-flex h-11 w-14 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] md:hidden"
          href="/contact"
          aria-label="Open contact"
        >
          <Menu size={20} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
