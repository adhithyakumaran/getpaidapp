import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import RetirementCorpusCalculator from "@/components/tools/RetirementCorpusCalculator";

export const metadata: Metadata = {
  title: "Retirement Corpus Calculator — How Much You Need to Retire",
  description: "Calculate the retirement corpus you need based on current expenses, inflation, and years to retirement — plus the monthly SIP required.",
  alternates: { canonical: "/tools/retirement-corpus-calculator" },
};

export default function RetirementCorpusCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Investment tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Retirement Corpus Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Find out how much you need to retire, and the monthly SIP required to get there.</p>
        </div>
        <div className="mt-10"><RetirementCorpusCalculator /></div>
      </Container>
    </div>
  );
}
