import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { guides } from "@/lib/content";
import { guideContent } from "@/lib/guides-data";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return guides
    .filter((g) => g.status === "live")
    .map((g) => ({ slug: g.slug }));
}

function getGuide(slug: string) {
  const meta = guides.find((g) => g.slug === slug && g.status === "live");
  const content = guideContent[slug];
  if (!meta || !content) return null;
  return { meta, content };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.meta.title,
    description: guide.meta.description,
    alternates: { canonical: `${siteConfig.url}/guides/${slug}` },
    openGraph: {
      type: "article",
      url: `${siteConfig.url}/guides/${slug}`,
      title: guide.meta.title,
      description: guide.meta.description,
      images: [
        {
          url: `${siteConfig.url}/opengraph-image.png`,
          width: 1200,
          height: 630,
          alt: guide.meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.meta.title,
      description: guide.meta.description,
      images: [`${siteConfig.url}/opengraph-image.png`],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const { meta, content } = guide;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    url: `${siteConfig.url}/guides/${slug}`,
    dateModified: meta.updated,
    image: siteConfig.logoUrl,
    author: {
      "@type": "Organization",
      name: "GetPaid",
      url: siteConfig.url,
      logo: siteConfig.logoUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "GetPaid",
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: siteConfig.logoUrl,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/guides/${slug}`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${siteConfig.url}/guides` },
      { "@type": "ListItem", position: 3, name: meta.title, item: `${siteConfig.url}/guides/${slug}` },
    ],
  };

  return (
    <div className="py-14 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Container>
        <div className="mx-auto max-w-2xl">
          <Link
            href="/guides"
            className="text-[13px] font-medium text-blue hover:underline"
          >
            ← All guides
          </Link>

          <div className="mt-4 flex items-center gap-3 text-[13px] text-slate-light">
            <span>{meta.readTime}</span>
            <span>·</span>
            <span>Updated {meta.updated}</span>
          </div>

          <h1 className="mt-3 font-display text-[30px] font-semibold leading-tight text-ink md:text-[36px]">
            {meta.title}
          </h1>

          <p className="mt-4 text-[17px] leading-relaxed text-slate">
            {content.intro}
          </p>

          <div className="mt-10 space-y-5">
            {content.blocks.map((block, i) => {
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="!mt-10 font-display text-[21px] font-semibold text-ink"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "p") {
                return (
                  <p
                    key={i}
                    className="text-[16px] leading-relaxed text-ink-soft"
                  >
                    {block.text}
                  </p>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="space-y-2.5 pl-1">
                    {block.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex gap-3 text-[16px] leading-relaxed text-ink-soft"
                      >
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "callout") {
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-amber/20 bg-amber-tint px-5 py-4 text-[14px] leading-relaxed text-amber"
                  >
                    {block.text}
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-display text-[17px] font-semibold text-ink">
              Related tools
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link
                href="/tools/gst-calculator"
                className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-blue hover:text-blue"
              >
                GST Calculator
              </Link>
              <Link
                href="/tools/payment-gateway-comparison"
                className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-blue hover:text-blue"
              >
                Gateway Comparison
              </Link>
              <Link
                href="/tools/invoice-generator"
                className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-blue hover:text-blue"
              >
                Invoice Generator
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
