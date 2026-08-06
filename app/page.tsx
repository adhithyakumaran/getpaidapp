import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroCalculator from "@/components/tools/HeroCalculator";
import { tools, guides } from "@/lib/content";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        <Container className="grid gap-14 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[13px] font-medium text-slate">
              Built for Indian freelancers &amp; businesses
            </span>
            <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.1] text-ink md:text-[52px]">
              Get paid right.
              <br />
              <span className="text-blue">Priced</span> right.{" "}
              <span className="text-green">Compliant</span> right.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate">
              Free calculators and guides for GST, salary, invoicing, and
              payment gateways — built specifically for how Indian
              freelancers and small businesses actually get paid.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/tools" variant="primary" size="lg">
                Browse all tools
              </Button>
              <Button href="/guides" variant="outline" size="lg">
                Read guides
              </Button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <HeroCalculator />
          </div>
        </Container>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-6 text-sm text-slate">
          <span>No sign-up required for calculators</span>
          <span className="hidden h-4 w-px bg-border md:block" />
          <span>Updated for FY 2025-26 tax slabs</span>
          <span className="hidden h-4 w-px bg-border md:block" />
          <span>Built in India, for India</span>
        </Container>
      </section>

      {/* Tools grid */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-[13px] font-medium uppercase tracking-wide text-blue">
                Tools
              </span>
              <h2 className="mt-2 font-display text-[28px] font-semibold text-ink md:text-[32px]">
                Everything to price, invoice, and get paid
              </h2>
            </div>
            <Link
              href="/tools"
              className="hidden shrink-0 text-sm font-medium text-blue hover:underline md:block"
            >
              View all tools →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </Container>
      </section>

      {/* Guides */}
      <section className="border-t border-border bg-surface py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <span className="text-[13px] font-medium uppercase tracking-wide text-green-dark">
                Guides
              </span>
              <h2 className="mt-2 font-display text-[28px] font-semibold text-ink md:text-[32px]">
                Answers to what freelancers actually search
              </h2>
            </div>
            <Link
              href="/guides"
              className="hidden shrink-0 text-sm font-medium text-blue hover:underline md:block"
            >
              View all guides →
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="block rounded-xl border border-border bg-white p-6 transition-all hover:border-blue hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)]"
              >
                <span className="text-[12px] font-medium text-slate-light">
                  {guide.readTime}
                </span>
                <h3 className="mt-2 font-display text-[17px] font-semibold text-ink">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {guide.description}
                </p>
                <span className="mt-4 inline-block text-[13px] font-medium text-blue">
                  Read guide →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-ink px-8 py-12 md:flex-row md:items-center md:justify-between md:px-14">
            <div>
              <h2 className="font-display text-[26px] font-semibold text-white md:text-[30px]">
                Have a payment or tax question?
              </h2>
              <p className="mt-2 max-w-md text-[15px] text-white/70">
                Our guides are written specifically for freelancers and small
                businesses navigating Indian payments and tax.
              </p>
            </div>
            <Button href="/guides" variant="green" size="lg">
              Explore guides
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-wide text-slate-light">
          {tool.category}
        </span>
        {tool.status === "coming-soon" && (
          <span className="rounded-full bg-amber-tint px-2.5 py-0.5 text-[11px] font-medium text-amber">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-[18px] font-semibold text-ink">
        {tool.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        {tool.description}
      </p>
    </>
  );

  const baseClasses =
    "block rounded-xl border border-border bg-white p-6 transition-all";

  if (tool.status === "live") {
    return (
      <Link
        href={`/tools/${tool.slug}`}
        className={`${baseClasses} hover:border-blue hover:shadow-[0_8px_24px_-12px_rgba(29,78,216,0.25)]`}
      >
        {content}
        <span className="mt-4 inline-block text-[13px] font-medium text-blue">
          Open calculator →
        </span>
      </Link>
    );
  }

  return <div className={`${baseClasses} opacity-70`}>{content}</div>;
}
