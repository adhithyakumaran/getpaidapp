import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import GstCalculator from "@/components/tools/GstCalculator";

export const metadata: Metadata = {
  title: "GST Calculator — Add or Remove GST Instantly",
  description:
    "Free GST calculator for India. Add GST to a base amount or extract GST from a total. Get CGST, SGST, and IGST breakdowns instantly.",
  alternates: { canonical: "/tools/gst-calculator" },
};

const faqs = [
  {
    q: "What's the difference between CGST, SGST, and IGST?",
    a: "For sales within the same state, GST is split equally between CGST (central) and SGST (state). For inter-state sales, the full amount is charged as IGST instead.",
  },
  {
    q: "How do I remove GST from a total amount?",
    a: "Switch to 'Remove GST' mode and enter the total amount including GST. The calculator extracts the base amount and GST portion using the formula: base = total × 100 / (100 + rate).",
  },
  {
    q: "Which GST rate applies to my business?",
    a: "Rates vary by category — most services are taxed at 18%, while many goods fall under 5%, 12%, or 28%. Check your HSN/SAC code on the GST portal to confirm your applicable rate.",
  },
];

export default function GstCalculatorPage() {
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
            GST Calculator
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Add GST to a base amount, or work backwards from a GST-inclusive
            total. Includes CGST/SGST and IGST breakdowns.
          </p>
        </div>

        <div className="mt-10">
          <GstCalculator />
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
