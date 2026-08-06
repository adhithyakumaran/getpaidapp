import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import InterestCalculator from "@/components/tools/InterestCalculator";

export const metadata: Metadata = {
  title: "Simple & Compound Interest Calculator",
  description: "Calculate simple or compound interest on any principal amount, rate, and time period.",
  alternates: { canonical: "/tools/interest-calculator" },
};

export default function InterestCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Basic tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Simple &amp; Compound Interest Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Compare simple and compound interest on any amount, rate, and time period.</p>
        </div>
        <div className="mt-10"><InterestCalculator /></div>
      </Container>
    </div>
  );
}
