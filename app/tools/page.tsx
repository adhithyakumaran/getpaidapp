import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { tools } from "@/lib/content";

export const metadata: Metadata = {
  title: "Free Tools for Freelancers & Businesses",
  description:
    "GST calculator, in-hand salary calculator, invoice generator, and more — free tools built for Indian freelancers and small businesses.",
  alternates: { canonical: "/tools" },
};

export default function ToolsIndexPage() {
  return (
    <div className="py-14 md:py-20">
      <Container>
        <div className="max-w-2xl">
          <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
            All tools
          </span>
          <h1 className="mt-2 font-display text-[32px] font-semibold text-ink md:text-[38px]">
            Tools to price, invoice, and get paid
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-slate">
            Free, no sign-up required. Built specifically for how Indian
            freelancers and small businesses get paid.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) =>
            tool.status === "live" ? (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block rounded-xl border border-border bg-white p-6 transition-all hover:border-blue hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)]"
              >
                <span className="text-[12px] font-medium uppercase tracking-wide text-slate-light">
                  {tool.category}
                </span>
                <h2 className="mt-3 font-display text-[18px] font-semibold text-ink">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {tool.description}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium text-blue">
                  Open calculator →
                </span>
              </Link>
            ) : (
              <div
                key={tool.slug}
                className="rounded-xl border border-border bg-white p-6 opacity-70"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[12px] font-medium uppercase tracking-wide text-slate-light">
                    {tool.category}
                  </span>
                  <span className="rounded-full bg-amber-tint px-2.5 py-0.5 text-[11px] font-medium text-amber">
                    Coming soon
                  </span>
                </div>
                <h2 className="mt-3 font-display text-[18px] font-semibold text-ink">
                  {tool.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {tool.description}
                </p>
              </div>
            )
          )}
        </div>
      </Container>
    </div>
  );
}
