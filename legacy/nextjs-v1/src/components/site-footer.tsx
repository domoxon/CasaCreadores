import Image from "next/image";
import Link from "next/link";
import { navItems, platforms } from "@/lib/site-data";

const footerLinks = [
  ...navItems,
  { href: "/apply", label: "Apply" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/creator-terms", label: "Creator agreement" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--jade-dark)] text-white">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/casa-creadores-logo.png"
              width={46}
              height={46}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
            <strong className="text-xl">Casa Creadores</strong>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">
            A managed LATAM UGC creator network for crypto, fintech, and tech brands.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-white/50">Map</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/78">
            {footerLinks.map((link) => (
              <Link key={link.href} className="hover:text-white" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-normal text-white/50">Platforms</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <span key={platform} className="rounded-md border border-white/14 px-3 py-2 text-sm text-white/78">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col gap-2 text-sm text-white/56 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Casa Creadores. All rights reserved.</span>
          <span>Not affiliated with Instagram, TikTok, YouTube, X, Twitch, or LinkedIn.</span>
        </div>
      </div>
    </footer>
  );
}
