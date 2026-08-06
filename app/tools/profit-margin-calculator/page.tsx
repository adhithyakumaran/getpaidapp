import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import ProfitMarginCalculator from "@/components/tools/ProfitMarginCalculator";

export const metadata: Metadata = {
  title: "Profit Margin Calculator — Margin & Markup",
  description: "Calculate profit margin and markup percentage from cost price and selling price. Understand the difference between the two.",
  alternates: { canonical: "/tools/profit-margin-calculator" },
};

const faqs = [
  { q: "What's the difference between margin and markup?", a: "Margin is profit as a percentage of selling price. Markup is profit as a percentage of cost price. A 50% markup is not the same as a 50% margin — they answer different questions." },
];

export default function ProfitMarginCalculatorPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Business tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Profit Margin Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Calculate your profit margin and markup from cost and selling price.</p>
        </div>
        <div className="mt-10"><ProfitMarginCalculator /></div>
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
