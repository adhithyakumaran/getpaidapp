import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PpfCalculator from "@/components/tools/PpfCalculator";

export const metadata: Metadata = {
  title: "PPF Calculator — Public Provident Fund Maturity Value",
  description: "Calculate the maturity value of your PPF investment based on yearly contribution, interest rate, and tenure.",
  alternates: { canonical: "/tools/ppf-calculator" },
};

const faqs = [
  { q: "What is the PPF lock-in period?", a: "PPF has a minimum 15-year lock-in period, though partial withdrawals are allowed from the 7th year onward under specific conditions." },
  { q: "Is PPF interest taxable?", a: "No — PPF falls under the EEE (Exempt-Exempt-Exempt) category, meaning contributions, interest earned, and maturity proceeds are all tax-free under current rules." },
];

export default function PpfCalculatorPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Investment tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">PPF Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">See how your PPF investment grows over its 15-year term.</p>
        </div>
        <div className="mt-10"><PpfCalculator /></div>
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
