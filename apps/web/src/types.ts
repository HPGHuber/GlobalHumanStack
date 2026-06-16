export type Adapter = "live" | "mock";

export interface StackMode {
  iota: Adapter;
  waltid: Adapter;
  worldid: Adapter;
}

export interface AppConfig {
  mode: StackMode;
  trustAnchorDid: string;
  worldId: { appId?: string; action: string };
}

export type Kingdom = "human" | "animalia" | "plantae";

export interface Taxon {
  scientificName: string;
  rank: string;
  commonName?: string;
}

export interface UniquenessProof {
  method: string;
  proofRef: string;
}

export interface Connection {
  rel: string;
  id: string;
}

export interface LivingBeingSubject {
  id: string;
  kingdom: Kingdom;
  taxon?: Taxon;
  uniqueness?: UniquenessProof;
  guardian?: string;
  connectedTo?: Connection[];
  attributes?: Record<string, string | number | boolean>;
}

export interface BeingRecord {
  did: string;
  kingdom: Kingdom;
  credentialId: string;
  subject: LivingBeingSubject;
  createdAt: string;
  revoked: boolean;
}

export interface IssuedCredential {
  id: string;
  jwt: string;
  subjectDid: string;
  issuerDid: string;
}

export interface OnboardResult {
  record: BeingRecord;
  credential: IssuedCredential;
}

export interface VerificationResult {
  valid: boolean;
  checks: { signatureValid: boolean; issuerTrusted: boolean; notRevoked: boolean };
  disclosed?: Partial<LivingBeingSubject>;
  subjectDid?: string;
  issuerDid?: string;
  errors: string[];
}

export interface Presentation {
  credentialId: string;
  jwt: string;
  disclosed: Partial<LivingBeingSubject>;
}
