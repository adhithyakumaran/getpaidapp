import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import FreelanceRateCalculator from "@/components/tools/FreelanceRateCalculator";

export const metadata: Metadata = {
  title: "Freelance Hourly Rate Calculator — What to Charge",
  description:
    "Work out the hourly or daily rate you need to charge to hit your income goal, accounting for non-billable time.",
  alternates: { canonical: "/tools/freelance-rate-calculator" },
};

const faqs = [
  { q: "Why isn't 100% of my time billable?", a: "Freelancers spend real time on proposals, client communication, admin, invoicing, and finding new work — none of which is billed directly. Most freelancers bill 60-80% of their working hours, not all of them." },
  { q: "Should I charge hourly or a fixed project rate?", a: "This calculator gives you a baseline hourly rate; many freelancers then convert that into fixed project quotes by estimating hours per project, which also protects you if a project runs efficiently." },
  { q: "Does this rate include business expenses?", a: "No — this calculates the rate needed to hit a personal income target. If you have significant business expenses (software, equipment, coworking space), add those to your desired income before calculating." },
];

export default function FreelanceRateCalculatorPage() {
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
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Freelance tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Freelance Hourly Rate Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Find the hourly rate you need to charge to hit your income goal — accounting for the time that never gets billed.
          </p>
        </div>
        <div className="mt-10"><FreelanceRateCalculator /></div>
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
