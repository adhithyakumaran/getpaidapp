import { z } from 'zod';
import { Evidence, Id, Instant, OfferInput } from '../domain/schemas';

export const ExtractedListing = z.object({
  sourceId: Id, sourceListingKey: Id, originalUrl: z.url({protocol:/^https$/}),
  observedAt: Instant, terms: OfferInput, rawEvidenceRef: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  rawEvidence: Evidence, normalizationVersion: Id, rawDateText: z.string().nullable(),
  interpretedTimezone: z.string().nullable(), sourceReportedVerification: z.string().nullable(),
}).strict();
export type ExtractedListing = z.infer<typeof ExtractedListing>;
export const CollectionResult = z.object({
  listings: z.array(ExtractedListing), completeness: z.enum(['COMPLETE','PARTIAL']),
  snapshotAuthoritative: z.literal(false),
  errors: z.array(z.object({code: Id, location: Id}).strict()),
  statistics: z.object({requests:z.number().int().nonnegative(),discovered:z.number().int().nonnegative(),rejected:z.number().int().nonnegative()}).strict(),
}).strict();
export type CollectionResult = z.infer<typeof CollectionResult>;
export interface CollectionContext { runId: string; signal: AbortSignal; now: () => Date }
export interface SourceAdapter {
  readonly sourceId: string;
  collect(context: CollectionContext): Promise<CollectionResult>;
}
export class CollectionError extends Error {
  constructor(readonly code: string) { super(code); this.name='CollectionError'; }
}
export function errorCode(error: unknown): string {
  return error instanceof CollectionError ? error.code : 'COLLECTION_FAILED';
}
