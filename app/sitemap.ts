import type { MetadataRoute } from "next";
import { tools, guides } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = siteConfig.url;
  const lastModified = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1, lastModified },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.9, lastModified },
    { url: `${BASE_URL}/guides`, changeFrequency: "weekly", priority: 0.9, lastModified },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.4, lastModified },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools
    .filter((t) => t.status === "live")
    .map((t) => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
      lastModified,
    }));

  const guideRoutes: MetadataRoute.Sitemap = guides
    .filter((g) => g.status === "live")
    .map((g) => ({
      url: `${BASE_URL}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.75,
      lastModified,
    }));

  return [...staticRoutes, ...toolRoutes, ...guideRoutes];
}
