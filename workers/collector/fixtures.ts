import { readFile } from 'node:fs/promises';
import { CollectionError } from '../../src/modules/sources/contracts';
import type { Transport } from '../../src/modules/sources/http';

export const fixtureTransport:Transport=async(url,_headers,signal)=> {
  signal.throwIfAborted();
  const token=url.searchParams.get('paginationToken');
  if(token && token!=='synthetic-page-2') throw new CollectionError('UNKNOWN_FIXTURE_PAGE');
  const filename=token?'page-2.json':'page-1.json';
  const body=await readFile(new URL(`../../tests/fixtures/amazon-promotions/${filename}`,import.meta.url),'utf8');
  return {status:200,headers:{'content-type':'application/json'},body};
};
