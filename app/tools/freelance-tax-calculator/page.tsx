import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FreelanceTaxCalculator from "@/components/tools/FreelanceTaxCalculator";

export const metadata: Metadata = {
  title: "Freelance Tax Calculator — Section 44ADA Presumptive Tax",
  description:
    "Estimate your income tax as a freelancer or consultant under Section 44ADA presumptive taxation. Free calculator for FY 2025-26.",
  alternates: { canonical: "/tools/freelance-tax-calculator" },
};

const faqs = [
  {
    q: "What is Section 44ADA?",
    a: "Section 44ADA lets freelancers and professionals (consultants, designers, developers, and similar) declare 50% of their gross receipts as taxable income, without maintaining detailed books of account, provided receipts stay within the eligibility limit.",
  },
  {
    q: "What's the receipts limit for Section 44ADA?",
    a: "The limit is ₹75 lakh per year, provided at least 95% of receipts are through digital/banking channels. If cash receipts exceed 5%, the older ₹50 lakh limit applies instead.",
  },
  {
    q: "Can I claim actual expenses instead of the 50% presumption?",
    a: "Yes — if your actual expenses are lower than 50% of receipts, you can opt out of presumptive taxation and declare actual profit, but then you must maintain proper books of account and may be subject to audit requirements.",
  },
];

export default function FreelanceTaxCalculatorPage() {
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
            Tax tools
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Freelance Tax Calculator
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Estimate your tax as a freelancer or consultant under Section
            44ADA presumptive taxation — no detailed bookkeeping required.
          </p>
        </div>

        <div className="mt-10">
          <FreelanceTaxCalculator />
        </div>

        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-[22px] font-semibold text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-[15px] font-semibold text-ink">{faq.q}</h3>
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
