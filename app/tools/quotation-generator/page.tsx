import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import QuotationGenerator from "@/components/tools/QuotationGenerator";

export const metadata: Metadata = {
  title: "Free Quotation Generator — Client Estimates as PDF",
  description: "Create a professional project quotation or estimate for clients, and download it as a PDF. No sign-up.",
  alternates: { canonical: "/tools/quotation-generator" },
};

export default function QuotationGeneratorPage() {
  return (
    <div className="py-14 md:py-20 print:py-0">
      <Container>
        <div className="max-w-2xl print:hidden">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Invoicing</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Quotation Generator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Send clients a clean, professional project estimate before work begins.</p>
        </div>
        <div className="mt-10 print:mt-0"><QuotationGenerator /></div>
      </Container>
    </div>
  );
}
