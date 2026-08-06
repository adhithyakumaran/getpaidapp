import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import NetWorthCalculator from "@/components/tools/NetWorthCalculator";

export const metadata: Metadata = {
  title: "Net Worth Calculator — Track Assets vs Liabilities",
  description: "Calculate your net worth by listing your assets and liabilities. Free and private — nothing is saved or uploaded.",
  alternates: { canonical: "/tools/net-worth-calculator" },
};

export default function NetWorthCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Personal finance</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Net Worth Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Add up your assets and liabilities to see where you stand.</p>
        </div>
        <div className="mt-10"><NetWorthCalculator /></div>
      </Container>
    </div>
  );
}
