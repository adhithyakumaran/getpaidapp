import type { z } from 'zod';
import { SourceInput } from '../domain/schemas';
import type { SourceAdapter } from './contracts';
import type { Requester, RequestPolicy } from './http';
import { AmazonPromotionsAdapter, amazonPolicy } from './amazon-promotions';

export interface SourceRegistration {
  source: z.infer<typeof SourceInput>;
  blocker: string | null;
  fixture: boolean;
  requestPolicy: RequestPolicy;
  createAdapter(options:{requester:Requester;asins:unknown;accessToken?:string}):SourceAdapter;
}
const source=SourceInput.parse({id:'amazon-in-promotions',name:'Amazon India seller Promotions API (unapproved)',
  enabled:false,permission:'UNREVIEWED',permissionEvidence:null,reviewedAt:null,accessMethod:'API',
  allowedHosts:['sellingpartnerapi-eu.amazon.com'],attribution:null,requestBudget:10,timeoutMs:10000});
function registration(metadata:z.infer<typeof SourceInput>,fixture:boolean,blocker:string|null):SourceRegistration {
  return {source:metadata,fixture,blocker,requestPolicy:amazonPolicy,
    createAdapter:({requester,asins,accessToken})=>new AmazonPromotionsAdapter(metadata.id,requester,asins,fixture,accessToken)};
}
export const registry:ReadonlyMap<string,SourceRegistration>=new Map([
  [source.id,registration(source,false,'SOURCE_NOT_APPROVED: seller-authorized app/token, reviewed electronics ASIN scope and retention/republication permission are required; see docs/SOURCES.md')],
]);
export function fixtureRegistration(id:string):SourceRegistration {
  const entry=registry.get(id);
  if(!entry) throw new Error('Unknown source');
  return registration({...entry.source,id:`${id}-fixture`,name:'SYNTHETIC Amazon Promotions fixture; not live inventory'},true,null);
}
