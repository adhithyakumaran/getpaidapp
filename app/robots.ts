import type { MetadataRoute } from "next";
import {indexingEnabled,SITE_ORIGIN} from '@/src/modules/seo/config';

// Pre-launch only. Phase 6 replaces this with the approved public crawl policy.
export default function robots(): MetadataRoute.Robots {
  return indexingEnabled()?{rules:{userAgent:'*',allow:'/',disallow:['/preview','/search','/privacy-policy-placeholder','/advertising/']},sitemap:SITE_ORIGIN+'/sitemap.xml'}:{ rules: { userAgent: "*", disallow: "/" } };
}
