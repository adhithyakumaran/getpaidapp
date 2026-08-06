import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import TaxRegimeComparison from "@/components/tools/TaxRegimeComparison";

export const metadata: Metadata = {
  title: "Old vs New Tax Regime Calculator — Which Saves You More",
  description:
    "Compare your income tax under the old and new tax regimes side by side, based on your income, 80C deductions, and HRA exemption.",
  alternates: { canonical: "/tools/tax-regime-comparison" },
};

const faqs = [
  { q: "Which regime is better for me?", a: "It depends on how much you claim in deductions. If your 80C, HRA, and other exemptions are large relative to your income, the old regime often wins; if you have few deductions, the new regime's lower rates usually win." },
  { q: "Can I switch between regimes every year?", a: "Salaried individuals can choose either regime each financial year. Those with business or professional income have more restrictions on switching back once they've opted for a particular regime." },
  { q: "Is the new tax regime the default now?", a: "Yes — the new tax regime is the default from FY 2023-24 onward. You have to actively opt for the old regime if you want to use it." },
];

export default function TaxRegimeComparisonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Tax tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Old vs New Tax Regime Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            See which tax regime actually saves you more, based on your real income and deductions.
          </p>
        </div>
        <div className="mt-10"><TaxRegimeComparison /></div>
        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-[22px] font-semibold text-ink">Frequently asked questions</h2>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-[15px] font-semibold text-ink">{faq.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
