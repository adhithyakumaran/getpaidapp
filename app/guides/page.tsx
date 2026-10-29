import Link from 'next/link';
import {guides} from '@/src/content/model';
import {pageMetadata} from '@/src/modules/seo/config';
export const metadata=pageMetadata('Shopping guides for using coupons in India','Practical guides to coupon eligibility, bank offers, checkout totals and source verification.','/guides');
export default function GuidesPage(){return <section className="shell editorial-page"><h1>Better decisions before checkout.</h1><p className="article-summary">Eight practical guides to using coupons, comparing conditions and spotting the catches.</p><div className="guide-directory">{guides.map(g=><article key={g.slug}><h2><Link href={'/'+g.slug}>{g.title}</Link></h2><p>{g.excerpt}</p></article>)}</div></section>;}
