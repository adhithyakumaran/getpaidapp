import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import TdsCalculator from "@/components/tools/TdsCalculator";

export const metadata: Metadata = {
  title: "TDS Calculator — Section 194J & 194C for Freelancers",
  description:
    "Calculate TDS deducted on your professional fees or contractor invoices under Section 194J or 194C, and see your net receivable amount.",
  alternates: { canonical: "/tools/tds-calculator" },
};

const faqs = [
  { q: "What is Section 194J?", a: "Section 194J requires clients to deduct 10% TDS when paying for professional or technical services, if the payment exceeds ₹30,000 in a financial year (per payer)." },
  { q: "Is TDS an extra tax on top of income tax?", a: "No — TDS deducted by your client is credited against your total tax liability when you file your ITR. If your total tax due is lower than TDS already deducted, you get a refund." },
  { q: "What's the difference between Section 194J and 194C?", a: "194J applies to professional/technical/consultancy services (10% TDS). 194C applies to payments to contractors for work contracts (typically 1-2% TDS depending on the payee type)." },
];

export default function TdsCalculatorPage() {
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
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">TDS Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            See how much TDS your client will deduct from an invoice, and what you&apos;ll actually receive.
          </p>
        </div>
        <div className="mt-10"><TdsCalculator /></div>
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
