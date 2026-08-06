import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import CurrencyConverter from "@/components/tools/CurrencyConverter";

export const metadata: Metadata = {
  title: "Currency Converter — USD, EUR, GBP to INR",
  description: "Convert foreign currency to INR or vice versa using today's exchange rate. Useful for pricing international freelance work.",
  alternates: { canonical: "/tools/currency-converter" },
};

export default function CurrencyConverterPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Payments</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Currency Converter</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Convert between INR and major currencies using the current exchange rate.</p>
        </div>
        <div className="mt-10"><CurrencyConverter /></div>
      </Container>
    </div>
  );
}
