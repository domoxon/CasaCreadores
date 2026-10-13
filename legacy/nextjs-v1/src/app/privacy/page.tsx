import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-5xl font-black leading-none tracking-normal">Privacy policy</h1>
        <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--muted)]">
          <p>
            We only collect the data a brand or creator submits through forms, email, or connected tools such as Tally,
            Calendly, and analytics providers.
          </p>
          <p>
            We do not sell personal data. Application and brief data is used to review profiles, respond to requests,
            coordinate campaigns, and meet operational obligations.
          </p>
          <p>We do not collect private social account data or sell creator and brand contact details to third parties.</p>
          <p>To request data deletion or correction, write to hola@casacreadores.com.</p>
        </div>
      </div>
    </section>
  );
}
