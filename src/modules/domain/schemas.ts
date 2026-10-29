import { z } from "zod";

export const Id = z.string().trim().min(1).max(200);
export const Instant = z.iso.datetime({ offset: true });
export const Paise = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const Evidence = z.record(z.string(), z.json());
export const Lifecycle = z.enum(["ACTIVE", "EXPIRED", "INACTIVE", "UNKNOWN"]);
export const Publication = z.enum(["DRAFT", "REVIEW_REQUIRED", "PUBLISHED", "WITHHELD"]);
export const VerificationStatus = z.enum(["UNVERIFIED", "SOURCE_REPORTED", "MANUALLY_VERIFIED", "CHECKOUT_VERIFIED", "FAILED"]);
export const OfferInput = z.object({
  retailerId: Id, title: z.string().trim().min(1), description: z.string().nullable(),
  kind: z.enum(["CODE", "AUTOMATIC", "BANK", "CASHBACK"]),
  code: z.string().trim().min(1).nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING", "OTHER"]).nullable(),
  discountBps: z.number().int().min(0).max(10000).nullable(),
  discountPaise: Paise.nullable(), minSpendPaise: Paise.nullable(), maxDiscountPaise: Paise.nullable(),
  currency: z.literal("INR").nullable(), eligibility: Evidence,
  validFrom: Instant.nullable(), validUntil: Instant.nullable(),
}).strict().superRefine((offer, ctx) => {
  if (offer.kind === "CODE" && offer.code === null)
    ctx.addIssue({ code: "custom", path: ["code"], message: "A code offer needs a code" });
  if (offer.validFrom && offer.validUntil && Date.parse(offer.validFrom) > Date.parse(offer.validUntil))
    ctx.addIssue({ code: "custom", path: ["validUntil"], message: "Validity ends before it starts" });
});
export type OfferInput = z.infer<typeof OfferInput>;

export const SourceInput = z.object({
  id: Id, name: Id, enabled: z.boolean(),
  permission: z.enum(["UNREVIEWED", "APPROVED", "DENIED"]),
  permissionEvidence: z.string().trim().min(1).nullable(), reviewedAt: Instant.nullable(),
  accessMethod: z.enum(["API", "FEED", "HTML", "BROWSER"]).nullable(),
  allowedHosts: z.array(z.string().regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/)),
  attribution: z.string().nullable(), requestBudget: z.number().int().positive(),
  timeoutMs: z.number().int().positive(),
}).strict().superRefine((source, ctx) => {
  if ((source.enabled || source.permission === "APPROVED") &&
      (source.permission !== "APPROVED" || !source.permissionEvidence || !source.reviewedAt || !source.accessMethod || !source.allowedHosts.length))
    ctx.addIssue({ code: "custom", message: "Approval needs dated permission evidence and access scope" });
});

export const ObservationInput = z.object({
  id: Id, sourceId: Id, runId: Id, listingId: Id, offerId: Id.nullable(),
  observedAt: Instant, originalUrl: z.url({ protocol: /^https$/ }),
  rawEvidence: Evidence, normalized: OfferInput, normalizationVersion: Id,
  rawDateText: z.string().nullable(), interpretedTimezone: z.string().nullable(),
  sourceReportedVerification: z.string().nullable(), fieldProvenance: Evidence,
}).strict();
export const VerificationInput = z.object({
  id: Id, offerId: Id, method: z.enum(["SOURCE", "MANUAL", "CHECKOUT"]),
  status: VerificationStatus, attemptedAt: Instant, actor: Id,
  evidence: Evidence, failureReason: z.string().nullable(), verifierVersion: Id,
}).strict().superRefine((v, ctx) => {
  if ((v.method === "SOURCE" && !["SOURCE_REPORTED", "UNVERIFIED"].includes(v.status)) ||
      (v.status === "MANUALLY_VERIFIED" && v.method !== "MANUAL") ||
      (v.status === "CHECKOUT_VERIFIED" && v.method !== "CHECKOUT") ||
      (v.status === "FAILED" && !v.failureReason))
    ctx.addIssue({ code: "custom", message: "Verification method, status and evidence must agree" });
});

export const RunInput = z.object({
  id: Id, sourceId: Id, scheduledSlot: Instant, startedAt: Instant,
  finishedAt: Instant.nullable(), status: z.enum(['RUNNING','SUCCESS','PARTIAL_SUCCESS','FAILED']),
  recordsDiscovered: z.number().int().nonnegative(), recordsExtracted: z.number().int().nonnegative(),
  recordsNormalised: z.number().int().nonnegative(), duplicatesDetected: z.number().int().nonnegative(),
  recordsRejected: z.number().int().nonnegative(), errors: z.array(Evidence),
  completeness: z.enum(['COMPLETE','PARTIAL']).nullable(), snapshotAuthoritative: z.boolean(),
}).strict().superRefine((r,ctx) => {
  if ((r.status === 'RUNNING') !== (r.finishedAt === null) ||
      (r.finishedAt && Date.parse(r.finishedAt) < Date.parse(r.startedAt)))
    ctx.addIssue({code:'custom',message:'Run completion and timestamps must agree'});
});
export const OfferRecord = z.object({
  id: Id, publicSlug: Id, terms: OfferInput, lifecycle: Lifecycle, publicationState: Publication,
  contentVersion: z.number().int().positive(), contentUpdatedAt: Instant, createdAt: Instant,
}).strict();
export const SourceListingInput = z.object({
  id: Id, sourceId: Id, sourceListingKey: Id, currentOfferId: Id.nullable(),
  originalUrl: z.url({protocol:/^https$/}), firstSeenAt: Instant, lastSeenAt: Instant,
}).strict().superRefine((l,ctx) => {
  if (Date.parse(l.lastSeenAt)<Date.parse(l.firstSeenAt))
    ctx.addIssue({code:'custom',message:'Last seen precedes first seen'});
});
