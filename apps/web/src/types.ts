export type Adapter = "live" | "mock";

export interface StackMode {
  iota: Adapter;
  waltid: Adapter;
  worldid: Adapter;
  fifa: Adapter;
}

export interface AppConfig {
  mode: StackMode;
  trustAnchorDid: string;
  worldId: { appId?: string; action: string };
  fifa: { competition: string };
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

export interface FanClaims {
  fifaCollectHandle: string;
  worldPassId: string;
  displayName?: string;
  favoriteTeam?: string;
  competition?: string;
  memberSince?: string;
  collectiblesCount?: number;
  tier?: string;
}

export interface PlayerOfTheMatchAward {
  title: string;
  matchId: string;
  match: string;
  competition: string;
  playerName: string;
  team: string;
  votes: number;
  totalVotes: number;
  awardedAt: string;
}

export interface LivingBeingSubject {
  id: string;
  kingdom: Kingdom;
  taxon?: Taxon;
  uniqueness?: UniquenessProof;
  guardian?: string;
  connectedTo?: Connection[];
  fan?: FanClaims;
  award?: PlayerOfTheMatchAward;
  attributes?: Record<string, string | number | boolean>;
}

export interface MatchPlayer {
  id: string;
  name: string;
  team: string;
  position?: string;
}

export interface PlayerTally extends MatchPlayer {
  votes: number;
}

export interface MatchView {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  label: string;
  kickoff: string;
  status: "scheduled" | "voting_open" | "voting_closed";
  roster: MatchPlayer[];
  totalVotes: number;
  results: PlayerTally[];
  winnerPlayerId?: string;
  awardedCredentialId?: string;
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
