import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import DiscountCalculator from "@/components/tools/DiscountCalculator";

export const metadata: Metadata = {
  title: "Discount Calculator — Final Price After Discount",
  description: "Calculate the final price after a percentage discount, and see exactly how much you save.",
  alternates: { canonical: "/tools/discount-calculator" },
};

export default function DiscountCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Basic tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Discount Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Enter the original price and discount percentage to see the final price and savings.</p>
        </div>
        <div className="mt-10"><DiscountCalculator /></div>
      </Container>
    </div>
  );
}
