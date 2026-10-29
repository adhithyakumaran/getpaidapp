import Link from 'next/link';
import {connection} from 'next/server';
import {notFound} from 'next/navigation';
import {categoryPages,guides,trustPages} from '@/src/content/model';
import {Article,RelatedReading} from '@/components/content/editorial';
import {loadPublicCatalogue} from '@/src/modules/catalogue/public.server';
import {pageMetadata} from '@/src/modules/seo/config';
import {OfferResults} from '@/components/catalogue/catalogue';
import {CatalogueWorkspace} from '@/components/catalogue/workspace';
import {brandFor} from '@/src/modules/catalogue/brands';
import type {RawQuery} from '@/src/modules/catalogue/model';
type Props={params:Promise<{slug:string}>;searchParams:Promise<RawQuery>};
export async function generateMetadata({params,searchParams}:Props){const {slug}=await params;const c=categoryPages.find(c=>c.slug===slug);const g=guides.find(g=>g.slug===slug);const t=trustPages.find(t=>t.slug===slug);if(c){const raw=await searchParams;const data=await loadPublicCatalogue({...raw,category:c.category??'all',scope:c.scope??'all'});const filtered=Object.entries(raw).some(([k,v])=>k!=='page'&&v&&v!=='all');return pageMetadata(c.title,c.intro,'/'+slug+(data.page>1?'?page='+data.page:''),!filtered&&!data.error);}return g?pageMetadata(g.title,g.excerpt,'/'+slug):t?pageMetadata(t.title,t.description,'/'+slug,slug!=='privacy-policy-placeholder'):{};}
export default async function ContentPage({params,searchParams}:Props){
 const {slug}=await params;const c=categoryPages.find(c=>c.slug===slug);
 if(c){await connection();const raw=await searchParams;const data=await loadPublicCatalogue({...raw,category:c.category??'all',scope:c.scope??'all'});return <><section className="shell category-intro"><nav className="breadcrumbs-line" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Categories</span></nav><h1>{c.title}</h1><p>{c.intro}</p><nav className="category-store-links" aria-label="Related stores">{c.stores.map(id=><Link key={id} href={'/stores/'+id}>{brandFor(id).name} coupons</Link>)}</nav></section><div className="category-search"><form action={'/'+slug} method="get"><label htmlFor="category-q">Search this category</label><div><input className="input" id="category-q" name="q" defaultValue={data.query.q} maxLength={120}/><button className="btn btn-primary">Search</button></div></form></div><CatalogueWorkspace data={data}><OfferResults data={data} base={'/'+slug} paginationQuery={{...data.query,category:'all',scope:'all'}}/><section className="shopping-checklist"><h2>Before you use an offer</h2><ul>{c.checklist.map(s=><li key={s}>{s}</li>)}</ul></section><RelatedReading slugs={c.guides}/></CatalogueWorkspace></>;}
 const g=guides.find(g=>g.slug===slug);if(g)return <Article title={g.title} excerpt={g.excerpt} body={g.body} path={'/'+slug} guide/>;
 const t=trustPages.find(t=>t.slug===slug);if(t)return <Article title={t.title} excerpt={t.description} body={t.body} path={'/'+slug}/>;
 notFound();
}
