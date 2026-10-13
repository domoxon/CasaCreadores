import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator agreement",
};

export default function CreatorTermsPage() {
  return (
    <section className="section">
      <div className="container max-w-3xl">
        <p className="eyebrow">Creators</p>
        <h1 className="mt-4 text-5xl font-black leading-none tracking-normal">Creator agreement summary</h1>
        <div className="mt-8 space-y-5 text-lg leading-8 text-[var(--muted)]">
          <p>
            Every campaign defines deliverables, dates, format, required disclosure, usage rights, and payment terms
            before content is produced.
          </p>
          <p>
            The creator acts as an independent contractor. They must publish original content, follow the approved brief,
            and avoid return promises, price predictions, or financial advice.
          </p>
          <p>
            The recommended payment model is 50% on content approval and 50% after publication is confirmed with a URL
            and metrics screenshot.
          </p>
        </div>
      </div>
    </section>
  );
}
