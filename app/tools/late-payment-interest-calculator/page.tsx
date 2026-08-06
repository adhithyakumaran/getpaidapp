import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import LatePaymentCalculator from "@/components/tools/LatePaymentCalculator";

export const metadata: Metadata = {
  title: "Late Payment Interest Calculator — For Overdue Invoices",
  description: "Calculate interest owed on an overdue invoice, including MSME Act reference rates for Udyam-registered freelancers.",
  alternates: { canonical: "/tools/late-payment-interest-calculator" },
};

export default function LatePaymentCalculatorPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Freelance tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Late Payment Interest Calculator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Calculate interest owed on an overdue client payment.</p>
        </div>
        <div className="mt-10"><LatePaymentCalculator /></div>
      </Container>
    </div>
  );
}
