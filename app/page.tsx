import {CatalogueWorkspace} from '@/components/catalogue/workspace';
import {ContentDirectory} from '@/components/content/editorial';
import { connection } from 'next/server';
import { HomeHero, OfferResults, StoreDirectory } from '@/components/catalogue/catalogue';
import { loadPublicCatalogue } from '@/src/modules/catalogue/public.server';
export default async function Home() {
  await connection();
  const data=await loadPublicCatalogue();
  return <><HomeHero/><StoreDirectory total={data.total}/><CatalogueWorkspace data={data}><OfferResults data={data} base="/search"/></CatalogueWorkspace><ContentDirectory/></>;
}
