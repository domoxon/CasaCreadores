import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service">
      <p>
        Casa Creadores operates as a managed network that connects brands with independent creators. The information on
        this site is provided for operational context and does not constitute financial, legal, or commercial advice.
      </p>
      <p>
        Brands are responsible for the accuracy, legality, and regulatory compliance of the claims included in each
        campaign. Creators are responsible for publishing visible sponsorship disclosures and following the approved
        brief.
      </p>
      <p>
        Campaign results depend on platform, timing, creative quality, audience, and external factors. Casa Creadores
        does not guarantee returns, conversions, or regulatory approval of any message.
      </p>
    </LegalPage>
  );
}

function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-5xl font-black leading-none tracking-normal">{title}</h1>
        <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--muted)]">{children}</div>
      </div>
    </section>
  );
}
