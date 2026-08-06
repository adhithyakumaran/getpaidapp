import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import RentReceiptGenerator from "@/components/tools/RentReceiptGenerator";

export const metadata: Metadata = {
  title: "Rent Receipt Generator — Free, for HRA Claims",
  description: "Generate a rent receipt for your HRA claim, with landlord PAN field where required. Download as PDF instantly.",
  alternates: { canonical: "/tools/rent-receipt-generator" },
};

export default function RentReceiptGeneratorPage() {
  return (
    <div className="py-14 md:py-20 print:py-0">
      <Container>
        <div className="max-w-2xl print:hidden">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">Salary tools</span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">Rent Receipt Generator</h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">Generate a rent receipt for your HRA exemption claim — download as PDF in under a minute.</p>
        </div>
        <div className="mt-10 print:mt-0"><RentReceiptGenerator /></div>
      </Container>
    </div>
  );
}
