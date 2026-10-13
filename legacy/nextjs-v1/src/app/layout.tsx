import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Casa Creadores | LATAM UGC network for crypto and tech",
    template: "%s | Casa Creadores",
  },
  description:
    "Casa Creadores connects crypto, fintech, and tech brands with local LATAM voices on Instagram, TikTok, YouTube, X, LinkedIn, and Twitch.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://casacreadores.com"),
  openGraph: {
    title: "Casa Creadores",
    description: "LATAM UGC network for crypto, fintech, and tech brands.",
    images: ["/brand/casa-creadores-social.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
