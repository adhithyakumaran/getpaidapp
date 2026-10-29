import {expect,it} from 'vitest';
import saved from '@/src/content/public-offers.json';
import {PublicCatalogueSnapshot,readPublicSnapshot,snapshotEnabled} from '@/src/modules/catalogue/snapshot';
import {parseCatalogueQuery,offerState} from '@/src/modules/catalogue/model';
import {resolveSearchIntent} from '@/src/modules/catalogue/search-intent';
import {validatedConnectionString} from '@/src/modules/database/client';
import {catalogueFailureCode} from '@/src/modules/database/diagnostics';
const snapshot=PublicCatalogueSnapshot.parse(saved);
it('accepts only non-preview supplied public projections without private eligibility metadata',()=>{
 expect(snapshot.offers.length).toBeGreaterThan(0);
 for(const offer of snapshot.offers){expect(offer.preview).toBe(false);expect(offer.origin).toBe('supplied');expect(offer.terms.eligibility).toEqual({});}
 for(const changed of [{...saved.offers[0],preview:true},{...saved.offers[0],origin:'collected'},{...saved.offers[0],lifecycle:'INACTIVE'},{...saved.offers[0],terms:{...saved.offers[0].terms,eligibility:{rawEvidence:'private'}}}])expect(PublicCatalogueSnapshot.safeParse({...saved,offers:[changed]}).success).toBe(false);
 expect(PublicCatalogueSnapshot.safeParse({...saved,offers:[saved.offers[0],saved.offers[0]]}).success).toBe(false);
});
it('keeps production fallback explicit, labelled, and disabled in development/test or by a kill switch',()=>{
 expect(snapshotEnabled({NODE_ENV:'production'})).toBe(true);expect(snapshotEnabled({NODE_ENV:'production',PUBLIC_CATALOGUE_SNAPSHOT:'0'})).toBe(false);
 for(const env of['development','test'])expect(snapshotEnabled({NODE_ENV:env})).toBe(false);
 const result=readPublicSnapshot(snapshot,parseCatalogueQuery({}));expect(result.snapshotAt).toBe(saved.capturedAt);expect(result.offers).toHaveLength(Math.min(7,snapshot.offers.length));
});
it('retains literal code/typo search, category families, pagination and detail identity in saved mode',()=>{
 const all=readPublicSnapshot(snapshot,parseCatalogueQuery({store:'myntra'}));const next=readPublicSnapshot(snapshot,parseCatalogueQuery({store:'myntra',page:'2'}));
 expect(next.offers.map(o=>o.id).every(id=>!all.offers.some(o=>o.id===id))).toBe(true);
 expect(readPublicSnapshot(snapshot,parseCatalogueQuery({store:'myntra',page:'999'})).page).toBe(all.pages);
 const offer=snapshot.offers.find(o=>o.terms.code)!;const found=readPublicSnapshot(snapshot,parseCatalogueQuery({q:offer.terms.code!}));expect(found.offers.some(o=>o.id===offer.id)).toBe(true);
 const typo=readPublicSnapshot(snapshot,resolveSearchIntent(parseCatalogueQuery({q:'mynntra cupon'})));expect(typo.total).toBe(all.total);
 expect(readPublicSnapshot(snapshot,parseCatalogueQuery({}),offer.slug).offers[0].id).toBe(offer.id);
 expect(readPublicSnapshot(snapshot,parseCatalogueQuery({}),'missing-draft').offers).toEqual([]);
 expect(readPublicSnapshot(snapshot,parseCatalogueQuery({q:"%' OR 1=1 --"})).total).toBe(0);
 expect(readPublicSnapshot(snapshot,parseCatalogueQuery({category:'beauty'})).offers.every(o=>['beauty','personal-care','beauty-fashion'].includes(o.category))).toBe(true);
});
it('does not change source timestamps, unknown conditions or expired redemption state',()=>{
 const offer=snapshot.offers[0];const expired={...offer,terms:{...offer.terms,validUntil:'2000-01-01T00:00:00Z'}};
 const result=readPublicSnapshot({...snapshot,offers:[expired]},parseCatalogueQuery({}));expect(result.offers[0].observedAt).toBe(offer.observedAt);expect(result.offers[0].terms.minSpendPaise).toBe(offer.terms.minSpendPaise);expect(offerState(result.offers[0],new Date().toISOString())).toBe('expired');
});
it('upgrades the common hosted sslmode=require to certificate verification and rejects weakened TLS',()=>{
 const url=new URL(validatedConnectionString('postgresql://role:synthetic@project.neon.tech/catalogue?sslmode=require&channel_binding=require'));
 expect(url.searchParams.get('sslmode')).toBe('verify-full');expect(url.searchParams.get('channel_binding')).toBe('require');
 for(const mode of['disable','no-verify','prefer'])expect(()=>validatedConnectionString('postgresql://role:synthetic@project.neon.tech/catalogue?sslmode='+mode)).toThrow();
});
it('classifies failures without exposing raw messages, secrets or database identities',()=>{
 expect(catalogueFailureCode(new Error('DATABASE_URL is required'))).toBe('DATABASE_NOT_CONFIGURED');
 expect(catalogueFailureCode({code:'28P01',message:'private password and host'})).toBe('DATABASE_AUTHENTICATION');
 expect(catalogueFailureCode({code:'42P01'})).toBe('DATABASE_SCHEMA_MISSING');
 expect(catalogueFailureCode({message:'postgresql://secret:secret@private/db'})).toBe('DATABASE_READ_FAILED');
});
