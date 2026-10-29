import Link from 'next/link';
import type {ReactNode} from 'react';
import type {CataloguePage} from '@/src/modules/catalogue/model';
import {categoryPages} from '@/src/content/model';
import {brandFor} from '@/src/modules/catalogue/brands';
import {BrandImage} from './brand-image';
function AdSpace(){return <div className="ad-reservation" aria-label="Reserved advertising space"><span>Advertisement space</span><small>Reserved</small></div>;}
export function CatalogueWorkspace({data,children}:{data:CataloguePage;children:ReactNode}) {
 return <div className="catalogue-workspace"><aside className="catalogue-left" aria-label="Browse categories and advertising"><nav className="rail-categories"><h2>Browse categories</h2>{categoryPages.map(c=><Link key={c.slug} href={'/'+c.slug}>{c.title.split(' & ')[0]}</Link>)}</nav><AdSpace/></aside><div className="catalogue-center">{children}</div><aside className="catalogue-right" aria-label="More coupons and advertising">{!!data.relatedOffers?.length&&<section className="related-tickets"><h2>More to explore</h2>{data.relatedOffers.map(offer=><Link className="mini-coupon" key={offer.id} href={(data.preview?'/preview':'')+'/offers/'+offer.slug}><BrandImage id={offer.terms.retailerId}/><span><strong>{brandFor(offer.terms.retailerId).name}</strong><span>{offer.terms.title.replace(/^.*?: /,'')}</span><small>View conditions</small></span></Link>)}</section>}<AdSpace/><Link className="rail-guide" href="/why-coupon-code-not-working">Code not working? Here’s what to check.</Link></aside></div>;
}
