import {pageMetadata} from '@/src/modules/seo/config';
import Link from 'next/link';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { OfferDetail } from '@/components/catalogue/catalogue';
import { loadPublicCatalogue } from '@/src/modules/catalogue/public.server';
export async function generateMetadata({params}:{params:Promise<{offerSlug:string}>}) {const {offerSlug}=await params;const data=await loadPublicCatalogue({},offerSlug);const offer=data.offers[0];return pageMetadata(offer?.terms.title??'Offer unavailable',offer?'Read the source-listed conditions, attribution and submission date for this offer.':'This offer is unavailable.','/offers/'+encodeURIComponent(offerSlug),!!offer&&offer.lifecycle!=='EXPIRED'&&(!offer.terms.validUntil||Date.parse(offer.terms.validUntil)>Date.now()));}
export default async function OfferPage({params}:{params:Promise<{offerSlug:string}>}) {
  await connection();
  const {offerSlug}=await params;
  if(offerSlug.length>200) notFound();
  const data=await loadPublicCatalogue({},offerSlug);
  if(data.error) return <div className="shell text-page" role="alert"><h1>Offer details are unavailable.</h1><p>Please try again in a moment.</p><Link href="/search" className="btn btn-outline">Browse offers</Link></div>;
  const offer=data.offers[0];if(!offer) notFound();
  return <OfferDetail offer={offer} now={data.now}/>;
}
