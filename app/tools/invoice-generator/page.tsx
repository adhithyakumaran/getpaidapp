import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import InvoiceGenerator from "@/components/tools/InvoiceGenerator";

export const metadata: Metadata = {
  title: "Free Invoice Generator — GST-Ready, Download as PDF",
  description:
    "Create a professional, GST-compliant invoice in your browser and download it as a PDF. No sign-up, no watermark.",
  alternates: { canonical: "/tools/invoice-generator" },
};

export default function InvoiceGeneratorPage() {
  return (
    <div className="py-14 md:py-20 print:py-0">
      <Container>
        <div className="max-w-2xl print:hidden">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
            Invoicing
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Invoice Generator
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Fill in your details on the left, see the invoice update live on
            the right, then download it as a PDF.
          </p>
        </div>

        <div className="mt-10 print:mt-0">
          <InvoiceGenerator />
        </div>
      </Container>
    </div>
  );
}
