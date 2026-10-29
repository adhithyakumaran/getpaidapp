import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CatalogueView, HomeHero, OfferDetail, OfferResults, PreviewBanner, StoreDirectory } from '@/components/catalogue/catalogue';
import { LoadingState } from '@/components/catalogue/loading';
import { previewAllowed, type RawQuery } from '@/src/modules/catalogue/model';
export const metadata={title:'Development preview',robots:{index:false,follow:false}};
export default async function PreviewPage({params,searchParams}:{params:Promise<{path?:string[]}>;searchParams:Promise<RawQuery>}) {
  if(!previewAllowed(process.env.NODE_ENV,process.env.ENABLE_UI_PREVIEW)) notFound();
  await connection();
  const {path=[]}=await params;const raw=await searchParams;
  const {loadPreviewCatalogue,previewOffers,previewNow}=await import('@/src/modules/catalogue/preview.server');
  if(path.join('/')==='outbound') return <><PreviewBanner/><div className="shell text-page"><h1>This is a demonstration.</h1><p>No real promotion or merchant page will open. Every offer in this preview is synthetic.</p><Link className="btn btn-primary" href="/preview/stores/amazon-india">Back to demonstration offers</Link></div></>;
  if(path[0]==='offers' && path.length===2) {
    const offer=previewOffers().find(item=>item.slug===path[1]);if(!offer) notFound();
    return <><PreviewBanner/><OfferDetail offer={offer} now={previewNow}/></>;
  }
  if(path.length && path.join('/')!=='search' && path.join('/')!=='stores/amazon-india') notFound();
  const data=loadPreviewCatalogue(raw);
  if(raw.state==='loading') return <><PreviewBanner/><LoadingState/></>;
  if(raw.state==='error') data.error='Demonstration error state. No database or source error details are shown.';
  if(!path.length) return <><PreviewBanner/><HomeHero preview/><StoreDirectory preview/><div className="shell home-results"><OfferResults data={data} base="/preview/search"/></div></>;
  return <><PreviewBanner/><CatalogueView data={data} store={path[0]==='stores'}/></>;
}
