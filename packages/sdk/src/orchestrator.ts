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

/** The AYA Identity Orchestrator — wires DID, credential, status and World ID. */
export class IdentityStack {
  private readonly beings = new Map<string, BeingRecord>();
  private readonly credentials = new Map<string, IssuedCredential>();
  private readonly nullifiers = new NullifierStore();
  private readonly trustedIssuers = new Set<string>();

  private constructor(
    readonly config: StackConfig,
    private readonly did: DidAdapter,
    private readonly status: StatusRegistry,
    private readonly issuer: IssuerAdapter,
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
    const issuerKey = await did.create();
    return new IdentityStack(config, did, new StatusRegistry(), issuer, issuerKey);
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

  private async issueFor(subject: LivingBeingSubject): Promise<OnboardResult> {
    const id = `urn:uuid:${randomUUID()}`;
    const payload: VerifiableCredential = {
      "@context": CONTEXT,
      id,
      type: ["VerifiableCredential", "LivingBeingCredential"],
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

function pruneAttributes(
  attrs: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}
