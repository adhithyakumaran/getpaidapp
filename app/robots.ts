import type { MetadataRoute } from "next";

// Pre-launch only. Phase 6 replaces this with the approved public crawl policy.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
