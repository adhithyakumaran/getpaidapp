import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SalaryCalculator from "@/components/tools/SalaryCalculator";

export const metadata: Metadata = {
  title: "In-hand Salary Calculator — CTC to Take-home Pay",
  description:
    "Convert your annual CTC into monthly in-hand salary. See PF, professional tax, and income tax deductions under the new tax regime (FY 2025-26).",
  alternates: { canonical: "/tools/salary-calculator" },
};

const faqs = [
  {
    q: "Is this calculator based on the old or new tax regime?",
    a: "This calculator uses the new tax regime for FY 2025-26, which is now the default regime and offers zero tax up to ₹12 lakh taxable income after the Section 87A rebate.",
  },
  {
    q: "Why is my actual in-hand salary different from this estimate?",
    a: "Every company structures CTC differently — some include bonuses, ESOPs, or insurance premiums in CTC, while others don't. This calculator assumes a standard 40% basic salary structure, which is common but not universal.",
  },
  {
    q: "What is professional tax?",
    a: "Professional tax is a small state-level tax on salaried income, typically capped around ₹2,400/year, though the exact amount varies by state and a few states don't levy it at all.",
  },
];

export default function SalaryCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
            Salary tools
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            In-hand Salary Calculator
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Enter your annual CTC to estimate your monthly take-home pay,
            after PF, professional tax, and income tax.
          </p>
        </div>

        <div className="mt-10">
          <SalaryCalculator />
        </div>

        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-[22px] font-semibold text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-[15px] font-semibold text-ink">
                  {faq.q}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
