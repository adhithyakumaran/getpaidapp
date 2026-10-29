import {pageMetadata} from '@/src/modules/seo/config';
import { CatalogueView } from '@/components/catalogue/catalogue';
import { loadPublicCatalogue } from '@/src/modules/catalogue/public.server';
import type { RawQuery } from '@/src/modules/catalogue/model';
export const metadata=pageMetadata('Search coupon codes, discounts and brands','Search source-listed coupons by merchant, category or code. Read eligibility before using an offer.','/search',false);
export default async function SearchPage({searchParams}:{searchParams:Promise<RawQuery>}) {
  return <CatalogueView data={await loadPublicCatalogue(await searchParams)}/>;
}
