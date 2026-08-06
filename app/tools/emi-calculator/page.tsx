import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import EmiCalculator from "@/components/tools/EmiCalculator";

export const metadata: Metadata = {
  title: "EMI Calculator — Loan EMI, Interest & Total Payment",
  description:
    "Calculate your monthly EMI, total interest, and total repayment for any loan amount, interest rate, and tenure.",
  alternates: { canonical: "/tools/emi-calculator" },
};

const faqs = [
  { q: "How is EMI calculated?", a: "EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the loan principal, r is the monthly interest rate, and n is the tenure in months." },
  { q: "Does a longer tenure always mean lower EMI?", a: "Yes, a longer tenure reduces the monthly EMI, but increases the total interest paid over the life of the loan — there's a real tradeoff between monthly affordability and total cost." },
  { q: "Is this calculator accurate for home, car, or personal loans?", a: "The EMI formula is the same across loan types. What differs is the interest rate and any processing fees or insurance add-ons your lender may charge separately." },
];

export default function EmiCalculatorPage() {
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
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Loan tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">EMI Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Work out your monthly EMI, total interest, and total repayment for any loan.
          </p>
        </div>
        <div className="mt-10"><EmiCalculator /></div>
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
