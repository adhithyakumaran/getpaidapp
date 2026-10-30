import type { MetadataRoute } from "next";
import { indexingEnabled, SITE_ORIGIN } from "@/src/modules/seo/config";

// Next serves this metadata route at /robots.txt; do not add a competing file
// under public/. Development and unreleased production keep their crawl block.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexingEnabled()
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/preview",
            "/search",
            "/privacy-policy-placeholder",
            "/advertising/",
          ],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
