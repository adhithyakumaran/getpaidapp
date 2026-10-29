import Link from 'next/link';
import {brands} from '@/src/modules/catalogue/brands';
import {categoryPages,guides,trustPages} from '@/src/content/model';
import {pageMetadata} from '@/src/modules/seo/config';
export const metadata=pageMetadata('Explore the coupon directory','Find merchant pages, coupon categories, shopping guides and contact information.','/site-map');
export default function SiteMap(){return <div className="shell editorial-page"><h1>Explore the directory</h1><h2>Stores</h2><nav className="site-map-links">{brands.map(b=><Link key={b.id} href={'/stores/'+b.id}>{b.name} coupons</Link>)}</nav><h2>Categories</h2><nav className="site-map-links">{categoryPages.map(c=><Link key={c.slug} href={'/'+c.slug}>{c.title}</Link>)}</nav><h2>Shopping guides</h2><nav className="site-map-links">{guides.map(g=><Link key={g.slug} href={'/'+g.slug}>{g.title}</Link>)}</nav><h2>About the site</h2><nav className="site-map-links">{trustPages.map(t=><Link key={t.slug} href={'/'+t.slug}>{t.title}</Link>)}<Link href="/contact-report-an-offer">Contact & report</Link><Link href="/faq">Frequently asked questions</Link></nav></div>;}
