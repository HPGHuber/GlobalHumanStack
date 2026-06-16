import type { JWK } from "jose";

/**
 * The three kingdoms AYA.ONE issues identities for. Every entity — regardless of
 * kingdom — is modelled identically as a DID subject holding a Living Being
 * Credential. What differs is key custody and how uniqueness is bootstrapped.
 */
export type Kingdom = "human" | "animalia" | "plantae";

export interface Taxon {
  /** Scientific (binomial) name, e.g. "Panthera leo" or "Quercus robur". */
  scientificName: string;
  /** Taxonomic rank, e.g. "species". */
  rank: string;
  commonName?: string;
}

/**
 * How the uniqueness of a being was established. We only ever store a hash or an
 * opaque reference — never raw biometrics ("All is Sacred").
 */
export interface UniquenessProof {
  method: "worldid-nullifier" | "microchip" | "geo-genetic-hash" | "attestation";
  /** A hash / nullifier / opaque id — never personally identifying raw data. */
  proofRef: string;
}

/** A typed relationship edge in the "web of life" ("All is Connected"). */
export interface Connection {
  rel: "guardianOf" | "wardOf" | "memberOf" | "partOf" | "caretakerOf";
  id: string;
}

/**
 * Fan / supporter claims linked to a FIFA Collect account. This is the body of a
 * "WorldPass" credential — a FREEDENTITY issued to a unique human football fan.
 * Only public, low-sensitivity profile data is stored (no payment/PII).
 */
export interface FanClaims {
  /** Public FIFA Collect handle. */
  fifaCollectHandle: string;
  /** Deterministic, unique WorldPass serial (one per human per competition). */
  worldPassId: string;
  displayName?: string;
  favoriteTeam?: string;
  /** Competition / season the WorldPass is scoped to, e.g. "FIFA World Cup 2026". */
  competition?: string;
  memberSince?: string;
  collectiblesCount?: number;
  tier?: string;
}

/** The `credentialSubject` of a Living Being Credential. */
export interface LivingBeingSubject {
  id: string;
  kingdom: Kingdom;
  taxon?: Taxon;
  uniqueness?: UniquenessProof;
  /** Controlling guardian/steward DID (required for animalia/plantae). */
  guardian?: string;
  connectedTo?: Connection[];
  /** Present when the human also holds a FIFA Collect WorldPass. */
  fan?: FanClaims;
  /** Free-form, low-sensitivity attributes (selectively disclosable). */
  attributes?: Record<string, string | number | boolean>;
}

export interface DidKeyPair {
  did: string;
  publicKeyJwk: JWK;
  /** Demo-only: in production the private key never leaves the holder's wallet. */
  privateKeyJwk: JWK;
}

export interface DidDocument {
  id: string;
  verificationMethod: Array<{
    id: string;
    controller: string;
    type: "JsonWebKey2020";
    publicKeyJwk: JWK;
  }>;
}

export interface CredentialStatusRef {
  type: "BitstringStatusListEntry";
  statusListIndex: number;
  statusListCredential: string;
}

/** A W3C-style Verifiable Credential payload (the body we sign as a VC-JWT). */
export interface VerifiableCredential {
  "@context": string[];
  id: string;
  type: string[];
  issuer: string;
  validFrom: string;
  credentialStatus: CredentialStatusRef;
  credentialSubject: LivingBeingSubject;
}

export interface IssuedCredential {
  id: string;
  /** Compact VC-JWT (signed with the issuer's EdDSA key). */
  jwt: string;
  payload: VerifiableCredential;
  subjectDid: string;
  issuerDid: string;
}

export interface VerificationChecks {
  signatureValid: boolean;
  issuerTrusted: boolean;
  notRevoked: boolean;
}

export interface VerificationResult {
  valid: boolean;
  checks: VerificationChecks;
  /** Only the fields the holder chose to disclose (selective disclosure). */
  disclosed?: Partial<LivingBeingSubject>;
  subjectDid?: string;
  issuerDid?: string;
  errors: string[];
}

/** A presentation produced by a holder, disclosing a chosen subset of claims. */
export interface Presentation {
  credentialId: string;
  jwt: string;
  disclosed: Partial<LivingBeingSubject>;
}

export interface WorldIdProof {
  /** Set true to use the offline simulator (default when World ID isn't configured). */
  simulate?: boolean;
  signal?: string;
  /** Real IDKit payload fields (forwarded to the World verify endpoint). */
  proof?: string;
  merkle_root?: string;
  nullifier_hash?: string;
  verification_level?: string;
  [k: string]: unknown;
}

export interface WorldIdResult {
  success: boolean;
  /** Per-app/per-action identifier guaranteeing one human = one identity. */
  nullifier: string;
  error?: string;
}
