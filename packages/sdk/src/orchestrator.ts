import { randomUUID } from "node:crypto";
import { describeMode, loadConfig, type StackConfig } from "./config.js";
import { sha256Hex } from "./crypto.js";
import { LocalIotaDidAdapter, type DidAdapter } from "./did/iota.js";
import { StatusRegistry } from "./credentials/status.js";
import {
  LocalIssuerAdapter,
  WaltIdIssuerAdapter,
  type IssuerAdapter
} from "./credentials/issuer.js";
import { verifyCredential } from "./credentials/verifier.js";
import { NullifierStore, verifyWorldId } from "./worldid/verifier.js";
import {
  LiveFifaCollectAdapter,
  MockFifaCollectAdapter,
  type FifaCollectAdapter,
  type MatchFixture,
  type MatchPlayer
} from "./fifa/collect.js";
import type {
  DidKeyPair,
  IssuedCredential,
  Kingdom,
  LivingBeingSubject,
  Presentation,
  Taxon,
  UniquenessProof,
  VerifiableCredential,
  VerificationResult,
  WorldIdProof
} from "./types.js";

const CONTEXT = [
  "https://www.w3.org/ns/credentials/v2",
  "https://aya.one/contexts/living-being/v1"
];

export interface HumanProfile {
  name?: string;
  jurisdiction?: string;
  ageOver?: number;
}

export interface OnboardHumanInput {
  worldId: WorldIdProof;
  profile?: HumanProfile;
}

export interface OnboardBeingInput {
  kingdom: Exclude<Kingdom, "human">;
  taxon: Taxon;
  guardianDid: string;
  uniqueness?: UniquenessProof;
  attributes?: Record<string, string | number | boolean>;
}

export interface OnboardFanInput {
  worldId: WorldIdProof;
  /** FIFA Collect handle to link, plus optional overrides. */
  fan: { handle: string; favoriteTeam?: string; displayName?: string };
  /** Competition the WorldPass is scoped to (defaults to config). */
  competition?: string;
}

export interface BeingRecord {
  did: string;
  kingdom: Kingdom;
  credentialId: string;
  subject: LivingBeingSubject;
  createdAt: string;
  revoked: boolean;
}

export interface OnboardResult {
  record: BeingRecord;
  credential: IssuedCredential;
}

export interface CastVoteInput {
  /** The voter's WorldPass credential id — voting is gated to WorldPass holders. */
  worldPassCredentialId: string;
  matchId: string;
  /** Roster player id the fan is voting for. */
  playerId: string;
}

export interface PlayerTally extends MatchPlayer {
  votes: number;
}

/** A read-only view of a match plus its live Player-of-the-Match tally. */
export interface MatchView {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  label: string;
  kickoff: string;
  status: MatchFixture["status"];
  roster: MatchPlayer[];
  totalVotes: number;
  results: PlayerTally[];
  winnerPlayerId?: string;
  awardedCredentialId?: string;
}

interface MatchState {
  fixture: MatchFixture;
  status: MatchFixture["status"];
  votes: Map<string, number>;
  voters: Set<string>;
  winnerPlayerId?: string;
  awardedCredentialId?: string;
}

/** The AYA Identity Orchestrator — wires DID, credential, status and World ID. */
export class IdentityStack {
  private readonly beings = new Map<string, BeingRecord>();
  private readonly credentials = new Map<string, IssuedCredential>();
  private readonly nullifiers = new NullifierStore();
  private readonly trustedIssuers = new Set<string>();
  /** Lazily loaded from the FIFA Collect adapter on first access. */
  private matches: Map<string, MatchState> | null = null;

  private constructor(
    readonly config: StackConfig,
    private readonly did: DidAdapter,
    private readonly status: StatusRegistry,
    private readonly issuer: IssuerAdapter,
    private readonly fifa: FifaCollectAdapter,
    private readonly issuerKey: DidKeyPair
  ) {
    this.trustedIssuers.add(issuerKey.did);
  }

  /** Builds a stack and provisions the AYA Trust Anchor issuer identity. */
  static async create(env: NodeJS.ProcessEnv = process.env): Promise<IdentityStack> {
    const config = loadConfig(env);
    const did = new LocalIotaDidAdapter(config.iota.network);
    const issuer: IssuerAdapter = config.waltid.enabled
      ? new WaltIdIssuerAdapter(config.waltid.issuerUrl!)
      : new LocalIssuerAdapter();
    const fifa: FifaCollectAdapter = config.fifa.enabled
      ? new LiveFifaCollectAdapter(config.fifa.apiUrl!)
      : new MockFifaCollectAdapter();
    const issuerKey = await did.create();
    return new IdentityStack(config, did, new StatusRegistry(), issuer, fifa, issuerKey);
  }

  get trustAnchorDid(): string {
    return this.issuerKey.did;
  }

  mode(): Record<string, "live" | "mock"> {
    return describeMode(this.config);
  }

  /** Bootstraps a human's root identity, gated by a World ID proof of personhood. */
  async onboardHuman(input: OnboardHumanInput): Promise<OnboardResult> {
    const world = await verifyWorldId(input.worldId, this.config.worldid);
    if (!world.success) {
      throw new Error(world.error ?? "World ID verification failed");
    }
    if (this.nullifiers.has(world.nullifier)) {
      throw new Error("This human already has an AYA identity (nullifier already used)");
    }
    this.nullifiers.add(world.nullifier);

    const keyPair = await this.did.create();
    const subject: LivingBeingSubject = {
      id: keyPair.did,
      kingdom: "human",
      uniqueness: { method: "worldid-nullifier", proofRef: `sha256:${sha256Hex(world.nullifier)}` },
      attributes: pruneAttributes({
        name: input.profile?.name,
        jurisdiction: input.profile?.jurisdiction,
        ...(input.profile?.ageOver !== undefined
          ? { [`ageOver${input.profile.ageOver}`]: true }
          : {})
      })
    };
    return this.issueFor(subject);
  }

  /** Registers a plant or animal under a guardian/steward human identity. */
  async onboardBeing(input: OnboardBeingInput): Promise<OnboardResult> {
    const guardian = this.beings.get(input.guardianDid);
    if (!guardian) {
      throw new Error(`Unknown guardian DID: ${input.guardianDid}`);
    }
    if (guardian.kingdom !== "human") {
      throw new Error("A guardian must be a registered human identity");
    }

    const keyPair = await this.did.create();
    const subject: LivingBeingSubject = {
      id: keyPair.did,
      kingdom: input.kingdom,
      taxon: input.taxon,
      guardian: input.guardianDid,
      uniqueness: input.uniqueness,
      connectedTo: [{ rel: "wardOf", id: input.guardianDid }],
      attributes: input.attributes
    };
    return this.issueFor(subject);
  }

  /**
   * Onboards a football fan: a single flow that proves personhood via World ID,
   * links a FIFA Collect profile, and issues a WorldPass credential — a
   * FREEDENTITY for every fan. Enforces one human = one WorldPass per competition.
   */
  async onboardFan(input: OnboardFanInput): Promise<OnboardResult> {
    const competition = input.competition ?? this.config.fifa.competition;
    const proof: WorldIdProof = {
      ...input.worldId,
      signal: input.worldId.signal ?? `worldpass:${input.fan.handle}`
    };
    const world = await verifyWorldId(proof, this.config.worldid);
    if (!world.success) {
      throw new Error(world.error ?? "World ID verification failed");
    }
    const passKey = `${world.nullifier}:${competition}`;
    if (this.nullifiers.has(passKey)) {
      throw new Error("This fan already holds a WorldPass for this competition");
    }
    this.nullifiers.add(passKey);

    const profile = await this.fifa.getFanProfile(input.fan.handle);
    const keyPair = await this.did.create();
    const subject: LivingBeingSubject = {
      id: keyPair.did,
      kingdom: "human",
      uniqueness: { method: "worldid-nullifier", proofRef: `sha256:${sha256Hex(world.nullifier)}` },
      fan: {
        fifaCollectHandle: profile.handle,
        worldPassId: `WP-${sha256Hex(passKey).slice(0, 12).toUpperCase()}`,
        displayName: input.fan.displayName ?? profile.displayName,
        favoriteTeam: input.fan.favoriteTeam ?? profile.favoriteTeam,
        competition,
        memberSince: profile.memberSince,
        collectiblesCount: profile.collectiblesCount,
        tier: profile.tier
      },
      attributes: pruneAttributes({ name: input.fan.displayName ?? profile.displayName })
    };
    return this.issueFor(subject, ["WorldPassCredential"]);
  }

  /** Lists fixtures + live Player-of-the-Match tallies for the competition. */
  async listMatches(): Promise<MatchView[]> {
    const matches = await this.ensureMatches();
    return [...matches.values()].map((m) => this.viewOf(m));
  }

  /** Returns a single match view, or throws if the id is unknown. */
  async getMatch(matchId: string): Promise<MatchView> {
    const matches = await this.ensureMatches();
    const match = matches.get(matchId);
    if (!match) throw new Error(`Unknown match: ${matchId}`);
    return this.viewOf(match);
  }

  /**
   * Casts a Player-of-the-Match vote. Gated to WorldPass holders: the voter must
   * present a valid, unrevoked WorldPass for this match's competition. Enforces
   * one fan = one vote per match (dedup key `${worldPassId}:${matchId}`).
   */
  async castVote(input: CastVoteInput): Promise<MatchView> {
    const matches = await this.ensureMatches();
    const match = matches.get(input.matchId);
    if (!match) throw new Error(`Unknown match: ${input.matchId}`);
    if (match.status !== "voting_open") {
      throw new Error("Voting is not open for this match");
    }

    const pass = this.credentials.get(input.worldPassCredentialId);
    if (!pass || !pass.payload.type.includes("WorldPassCredential")) {
      throw new Error("A valid WorldPass is required to vote (claim one first)");
    }
    if (this.status.isRevoked(pass.payload.credentialStatus.statusListIndex)) {
      throw new Error("This WorldPass has been revoked");
    }
    const fan = pass.payload.credentialSubject.fan;
    if (!fan) throw new Error("WorldPass is missing fan claims");
    if (fan.competition && fan.competition !== match.fixture.competition) {
      throw new Error(
        `This WorldPass is for ${fan.competition}, not ${match.fixture.competition}`
      );
    }

    const player = match.fixture.roster.find((p) => p.id === input.playerId);
    if (!player) throw new Error(`Unknown player for this match: ${input.playerId}`);

    const voteKey = `${fan.worldPassId}:${match.fixture.id}`;
    if (match.voters.has(voteKey)) {
      throw new Error("This WorldPass has already voted for this match");
    }
    match.voters.add(voteKey);
    match.votes.set(input.playerId, (match.votes.get(input.playerId) ?? 0) + 1);

    return this.viewOf(match);
  }

  /**
   * Closes voting and issues a `PlayerOfTheMatchCredential` to the winner's DID —
   * a verifiable award the player owns. The winner is the roster player with the
   * most votes (first by roster order on a tie).
   */
  async awardPlayerOfTheMatch(matchId: string): Promise<OnboardResult> {
    const matches = await this.ensureMatches();
    const match = matches.get(matchId);
    if (!match) throw new Error(`Unknown match: ${matchId}`);
    if (match.awardedCredentialId) {
      throw new Error("Player of the Match has already been awarded for this match");
    }
    const results = this.tallyOf(match);
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
    if (totalVotes === 0) {
      throw new Error("No votes have been cast for this match yet");
    }
    const winner = results.reduce((best, r) => (r.votes > best.votes ? r : best), results[0]);

    const network = this.config.iota.network ?? "local";
    const playerDid = `did:iota:${network}:0x${sha256Hex(
      `player:${match.fixture.competition}:${winner.id}`
    )}`;
    const subject: LivingBeingSubject = {
      id: playerDid,
      kingdom: "human",
      connectedTo: [{ rel: "memberOf", id: `did:aya:team:${slug(winner.team)}` }],
      award: {
        title: "Player of the Match",
        matchId: match.fixture.id,
        match: `${match.fixture.homeTeam} vs ${match.fixture.awayTeam}`,
        competition: match.fixture.competition,
        playerName: winner.name,
        team: winner.team,
        votes: winner.votes,
        totalVotes,
        awardedAt: new Date().toISOString()
      },
      attributes: { name: winner.name, team: winner.team }
    };
    const result = await this.issueFor(subject, ["PlayerOfTheMatchCredential"]);

    match.status = "voting_closed";
    match.winnerPlayerId = winner.id;
    match.awardedCredentialId = result.credential.id;
    return result;
  }

  private async ensureMatches(): Promise<Map<string, MatchState>> {
    if (!this.matches) {
      const fixtures = await this.fifa.listMatches(this.config.fifa.competition);
      this.matches = new Map(
        fixtures.map((fixture) => [
          fixture.id,
          { fixture, status: fixture.status, votes: new Map(), voters: new Set() }
        ])
      );
    }
    return this.matches;
  }

  private tallyOf(match: MatchState): PlayerTally[] {
    return match.fixture.roster
      .map((p) => ({ ...p, votes: match.votes.get(p.id) ?? 0 }))
      .sort((a, b) => b.votes - a.votes);
  }

  private viewOf(match: MatchState): MatchView {
    const results = this.tallyOf(match);
    return {
      id: match.fixture.id,
      competition: match.fixture.competition,
      homeTeam: match.fixture.homeTeam,
      awayTeam: match.fixture.awayTeam,
      label: `${match.fixture.homeTeam} vs ${match.fixture.awayTeam}`,
      kickoff: match.fixture.kickoff,
      status: match.status,
      roster: match.fixture.roster,
      totalVotes: results.reduce((sum, r) => sum + r.votes, 0),
      results,
      winnerPlayerId: match.winnerPlayerId,
      awardedCredentialId: match.awardedCredentialId
    };
  }

  /** Produces a presentation disclosing only the requested subject fields. */
  present(credentialId: string, disclose: Array<keyof LivingBeingSubject>): Presentation {
    const credential = this.credentials.get(credentialId);
    if (!credential) {
      throw new Error(`Unknown credential: ${credentialId}`);
    }
    const subject = credential.payload.credentialSubject;
    const disclosed: Partial<LivingBeingSubject> = { id: subject.id };
    for (const field of disclose) {
      const value = subject[field];
      if (value !== undefined) {
        Object.assign(disclosed, { [field]: value });
      }
    }
    return { credentialId, jwt: credential.jwt, disclosed };
  }

  async verify(jwt: string): Promise<VerificationResult> {
    return verifyCredential(jwt, {
      did: this.did,
      status: this.status,
      trustedIssuers: this.trustedIssuers
    });
  }

  revoke(credentialId: string): void {
    const credential = this.credentials.get(credentialId);
    if (!credential) {
      throw new Error(`Unknown credential: ${credentialId}`);
    }
    this.status.revoke(credential.payload.credentialStatus.statusListIndex);
    const record = this.beings.get(credential.subjectDid);
    if (record) record.revoked = true;
  }

  registry(): BeingRecord[] {
    return [...this.beings.values()];
  }

  getCredential(credentialId: string): IssuedCredential | undefined {
    return this.credentials.get(credentialId);
  }

  private async issueFor(
    subject: LivingBeingSubject,
    extraTypes: string[] = []
  ): Promise<OnboardResult> {
    const id = `urn:uuid:${randomUUID()}`;
    const payload: VerifiableCredential = {
      "@context": CONTEXT,
      id,
      type: ["VerifiableCredential", "LivingBeingCredential", ...extraTypes],
      issuer: this.issuerKey.did,
      validFrom: new Date().toISOString(),
      credentialStatus: this.status.allocate(),
      credentialSubject: subject
    };
    const jwt = await this.issuer.issue(payload, this.issuerKey);
    const credential: IssuedCredential = {
      id,
      jwt,
      payload,
      subjectDid: subject.id,
      issuerDid: this.issuerKey.did
    };
    this.credentials.set(id, credential);
    const record: BeingRecord = {
      did: subject.id,
      kingdom: subject.kingdom,
      credentialId: id,
      subject,
      createdAt: payload.validFrom,
      revoked: false
    };
    this.beings.set(subject.id, record);
    return { record, credential };
  }
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pruneAttributes(
  attrs: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
