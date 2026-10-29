import StorePage,{generateMetadata as storeMetadata} from '../[storeSlug]/page';
import type {RawQuery} from '@/src/modules/catalogue/model';
type Props={searchParams:Promise<RawQuery>};
export function generateMetadata({searchParams}:Props){return storeMetadata({searchParams,params:Promise.resolve({storeSlug:'amazon-india'})});}
export default function AmazonPage({searchParams}:Props){return StorePage({searchParams,params:Promise.resolve({storeSlug:'amazon-india'})});}
