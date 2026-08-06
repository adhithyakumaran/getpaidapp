import type { MetadataRoute } from "next";
import { tools, guides } from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE_URL = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/guides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools
    .filter((t) => t.status === "live")
    .map((t) => ({
      url: `${BASE_URL}/tools/${t.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const guideRoutes: MetadataRoute.Sitemap = guides
    .filter((g) => g.status === "live")
    .map((g) => ({
      url: `${BASE_URL}/guides/${g.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...toolRoutes, ...guideRoutes];
}
