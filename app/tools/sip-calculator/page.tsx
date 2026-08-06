import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SipCalculator from "@/components/tools/SipCalculator";

export const metadata: Metadata = {
  title: "SIP Calculator — Mutual Fund SIP Returns Estimator",
  description:
    "Estimate the future value of your monthly SIP investment based on expected returns and investment period.",
  alternates: { canonical: "/tools/sip-calculator" },
};

const faqs = [
  { q: "What return rate should I use?", a: "Equity mutual funds have historically returned roughly 10-14% annually over long periods, though this varies significantly and isn't guaranteed. Conservative planning often uses a lower assumed rate." },
  { q: "Is SIP better than a lump sum investment?", a: "SIP averages your purchase price over time (rupee cost averaging) and suits regular income earners; lump sum can outperform in consistently rising markets but carries more timing risk." },
  { q: "Does this account for inflation?", a: "No — the future value shown is nominal. To estimate real purchasing power, you'd need to separately discount for expected inflation over your investment period." },
];

export default function SipCalculatorPage() {
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
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Investment tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">SIP Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            See how your monthly SIP investment could grow over time at your expected rate of return.
          </p>
        </div>
        <div className="mt-10"><SipCalculator /></div>
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
