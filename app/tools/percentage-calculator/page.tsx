import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import PercentageCalculator from "@/components/tools/PercentageCalculator";

export const metadata: Metadata = {
  title: "Percentage Calculator — Quick % Calculations",
  description: "Calculate X% of Y, what percentage X is of Y, or the percentage change between two numbers. Free and instant.",
  alternates: { canonical: "/tools/percentage-calculator" },
};

export default function PercentageCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Basic tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Percentage Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Three common percentage calculations in one place — no formulas to remember.</p>
        </div>
        <div className="mt-10"><PercentageCalculator /></div>
      </Container>
    </div>
  );
}
