import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import BreakEvenCalculator from "@/components/tools/BreakEvenCalculator";

export const metadata: Metadata = {
  title: "Break-even Calculator — Units & Revenue to Break Even",
  description: "Calculate how many units you need to sell, and the revenue required, to cover your fixed and variable costs.",
  alternates: { canonical: "/tools/break-even-calculator" },
};

export default function BreakEvenCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Business tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Break-even Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Find out how many units you need to sell to cover your costs.</p>
        </div>
        <div className="mt-10"><BreakEvenCalculator /></div>
      </Container>
    </div>
  );
}
