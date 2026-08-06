import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import HraCalculator from "@/components/tools/HraCalculator";

export const metadata: Metadata = {
  title: "HRA Exemption Calculator — House Rent Allowance Tax Benefit",
  description:
    "Calculate your HRA tax exemption based on basic salary, HRA received, and rent paid. For salaried employees under the old tax regime.",
  alternates: { canonical: "/tools/hra-calculator" },
};

const faqs = [
  { q: "Can I claim HRA exemption under the new tax regime?", a: "No — HRA exemption is only available under the old tax regime. The new regime offers lower slab rates and a higher standard deduction instead, but doesn't allow most exemptions including HRA." },
  { q: "What if I don't pay rent but receive HRA?", a: "If you don't pay rent, your entire HRA received is taxable — there's no exemption without an actual rent payment (and, for larger amounts, a valid rent receipt or agreement)." },
  { q: "Do I need rent receipts to claim HRA exemption?", a: "Yes, your employer will typically ask for rent receipts to process HRA exemption in your salary TDS, and receipts also matter if the claim is scrutinized later." },
];

export default function HraCalculatorPage() {
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
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Salary tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">HRA Exemption Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Work out how much of your House Rent Allowance is tax-exempt, based on your basic salary, HRA received, and rent paid.
          </p>
        </div>
        <div className="mt-10"><HraCalculator /></div>
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
