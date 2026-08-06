import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import NpsCalculator from "@/components/tools/NpsCalculator";

export const metadata: Metadata = {
  title: "NPS Calculator — Retirement Corpus & Pension Estimate",
  description: "Estimate your National Pension System (NPS) corpus at retirement, lump sum withdrawal, and estimated monthly pension.",
  alternates: { canonical: "/tools/nps-calculator" },
};

const faqs = [
  { q: "Can freelancers invest in NPS?", a: "Yes — NPS is open to any Indian citizen between 18-70, including freelancers and self-employed individuals, through the 'All Citizens' model." },
  { q: "Is NPS better than PPF for freelancers?", a: "NPS typically offers higher potential returns since it includes equity exposure, but locks a portion into a mandatory annuity at retirement. PPF is fully liquid at maturity with guaranteed but lower returns. Many people use both for different parts of their retirement planning." },
];

export default function NpsCalculatorPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Investment tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">NPS Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Estimate your NPS corpus at retirement and the monthly pension it could generate.</p>
        </div>
        <div className="mt-10"><NpsCalculator /></div>
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
