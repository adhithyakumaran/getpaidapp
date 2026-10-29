import type {MetadataRoute} from 'next';
import {connection} from 'next/server';
import {categoryPages,guides,editorialUpdatedAt} from '@/src/content/model';
import {indexingEnabled,SITE_ORIGIN} from '@/src/modules/seo/config';
import {loadPublicCatalogue} from '@/src/modules/catalogue/public.server';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
 await connection();
 if(!indexingEnabled())return [];
 const first=await loadPublicCatalogue();if(first.error)throw new Error('Sitemap catalogue unavailable');
 const offers=[...first.offers];
 for(let page=2;page<=first.pages;page++){const data=await loadPublicCatalogue({page:String(page)});if(data.error)throw new Error('Sitemap catalogue unavailable');offers.push(...data.offers);}
 const eligible=offers.filter(o=>o.lifecycle!=='EXPIRED'&&(!o.terms.validUntil||Date.parse(o.terms.validUntil)>Date.now()));
 const paths=['/','/guides','/faq','/about','/terms','/contact-report-an-offer','/affiliate-disclosure','/site-map',...categoryPages.map(c=>'/'+c.slug),...guides.map(g=>'/'+g.slug),...new Set(eligible.map(o=>'/stores/'+o.terms.retailerId)),...eligible.map(o=>'/offers/'+o.slug)];
 return [...new Set(paths)].map(path=>({url:SITE_ORIGIN+path,...(guides.some(g=>path==='/'+g.slug)?{lastModified:editorialUpdatedAt}:{})}));
}
