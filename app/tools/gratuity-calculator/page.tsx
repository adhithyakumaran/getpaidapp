import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import GratuityCalculator from "@/components/tools/GratuityCalculator";

export const metadata: Metadata = {
  title: "Gratuity Calculator — Payment of Gratuity Act",
  description: "Calculate your gratuity amount based on last drawn salary and years of service, under the Payment of Gratuity Act.",
  alternates: { canonical: "/tools/gratuity-calculator" },
};

const faqs = [
  { q: "When am I eligible for gratuity?", a: "Generally after 5 years of continuous service with the same employer, though exceptions apply in cases of death or disability." },
  { q: "Is gratuity taxable?", a: "Gratuity received by government employees is fully tax-exempt. For private-sector employees, exemption is available up to a statutory limit (currently ₹20 lakh) under the Payment of Gratuity Act." },
];

export default function GratuityCalculatorPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <div className="py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Salary tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Gratuity Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Estimate your gratuity payout based on salary and years of service.</p>
        </div>
        <div className="mt-10"><GratuityCalculator /></div>
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
