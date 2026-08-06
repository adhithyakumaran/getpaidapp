import type { Metadata } from "next";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About GetPaid",
  description:
    "GetPaid builds free tools and guides for Indian freelancers and small businesses to get paid, priced right, and compliant.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
            About
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Built for how India actually gets paid
          </h1>
          <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-slate">
            <p>
              GetPaid started as a simple observation: Indian freelancers and
              small businesses spend an enormous amount of time on things
              that should take thirty seconds — figuring out GST on an
              invoice, working out what a CTC actually means in hand, or
              choosing between five different payment gateways with unclear
              fee structures.
            </p>
            <p>
              We&apos;re building free, fast, no-login tools that answer
              those questions directly, alongside guides written in plain
              language rather than tax-code jargon.
            </p>
            <p>
              GetPaid is independently run and not affiliated with any
              payment gateway, bank, or government body. Calculators are
              provided for estimation purposes — for anything filed with the
              government, confirm with a qualified CA.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
