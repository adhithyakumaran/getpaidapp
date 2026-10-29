import Image from 'next/image';
import manifest from '@/public/brands/manifest.json';
import {brandFor} from '@/src/modules/catalogue/brands';
export function BrandImage({id,large=false}:{id:string;large?:boolean}) {
  const brand=brandFor(id);const entry=(manifest as Record<string,{path:string}>)[brand.id];
  return <span className={`merchant-logo ${large?'merchant-logo-large':''}`}><Image src={entry.path} alt={`${brand.name} logo`} width={large?100:64} height={large?100:64} unoptimized/></span>;
}
export function BrandBanner({id}:{id:string}) {
  const brand=brandFor(id);const entry=(manifest as Record<string,{path:string;banner?:{path:string}}>)[brand.id];
  return <div className="store-image-banner"><Image src={entry.banner?.path??entry.path} alt={`${brand.name} official website brand image`} width={320} height={140} unoptimized/><p>Find the code.<br/>Keep the conditions.</p></div>;
}
