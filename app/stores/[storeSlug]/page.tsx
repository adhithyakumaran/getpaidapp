import {pageMetadata} from '@/src/modules/seo/config';
import {notFound} from 'next/navigation';
import {brands} from '@/src/modules/catalogue/brands';
import {CatalogueView} from '@/components/catalogue/catalogue';
import {loadPublicCatalogue} from '@/src/modules/catalogue/public.server';
import type {RawQuery} from '@/src/modules/catalogue/model';
export async function generateMetadata({params,searchParams}:{params:Promise<{storeSlug:string}>;searchParams:Promise<RawQuery>}) {const {storeSlug}=await params;const brand=brands.find(b=>b.id===storeSlug);if(!brand)return {};const raw=await searchParams;const data=await loadPublicCatalogue({...raw,store:storeSlug});const filtered=Object.entries(raw).some(([k,v])=>k!=='page'&&!(k==='store'&&v===storeSlug)&&v&&v!=='all');return pageMetadata(brand.name+' Coupons & Offers', 'Compare '+brand.name+' coupon claims, restrictions and source dates before shopping in India.','/stores/'+storeSlug+(data.page>1?'?page='+data.page:''),!filtered&&!data.error&&data.total>0);}
export default async function StorePage({params,searchParams}:{params:Promise<{storeSlug:string}>;searchParams:Promise<RawQuery>}) {
  const {storeSlug}=await params;if(!brands.some(b=>b.id===storeSlug))notFound();
  return <CatalogueView data={await loadPublicCatalogue({...await searchParams,store:storeSlug})} store/>;
}
