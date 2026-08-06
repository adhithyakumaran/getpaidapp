import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { guides } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guides for Freelancers & Businesses in India",
  description:
    "Practical guides on receiving international payments, choosing a payment gateway, and staying GST-compliant in India.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-green-dark">
            All guides
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Guides for getting paid in India
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Straight answers on payments, invoicing, and tax — written for
            freelancers and small businesses, not accountants.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {guides.map((guide) =>
            guide.status === "live" ? (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block rounded-xl border border-border bg-white p-6 transition-all hover:border-blue hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)]"
              >
                <span className="text-[12px] font-medium text-slate-light">
                  {guide.readTime}
                </span>
                <h2 className="mt-2 font-display text-[17px] font-semibold text-ink">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {guide.description}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium text-blue">
                  Read guide →
                </span>
              </Link>
            ) : (
              <div
                key={guide.slug}
                className="rounded-xl border border-border bg-white p-6 opacity-70"
              >
                <h2 className="font-display text-[17px] font-semibold text-ink">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {guide.description}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium text-slate-light">
                  Coming soon
                </span>
              </div>
            )
          )}
        </div>
      </Container>
    </div>
  );
}
