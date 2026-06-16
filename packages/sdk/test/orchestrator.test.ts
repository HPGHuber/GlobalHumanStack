import { beforeEach, describe, expect, it } from "vitest";
import { IdentityStack } from "../src/orchestrator.js";

async function freshStack(): Promise<IdentityStack> {
  // Empty env → fully mock mode (no IOTA / walt.id / World ID network).
  return IdentityStack.create({});
}

describe("AYA Identity Stack", () => {
  let stack: IdentityStack;

  beforeEach(async () => {
    stack = await freshStack();
  });

  it("runs entirely in mock mode with an empty environment", () => {
    expect(stack.mode()).toEqual({ iota: "mock", waltid: "mock", worldid: "mock" });
    expect(stack.trustAnchorDid).toMatch(/^did:iota:local:0x[0-9a-f]{64}$/);
  });

  it("onboards a human gated by a World ID proof and issues a verifiable credential", async () => {
    const { record, credential } = await stack.onboardHuman({
      worldId: { simulate: true, signal: "alice" },
      profile: { name: "Alice", jurisdiction: "CH", ageOver: 18 }
    });

    expect(record.kingdom).toBe("human");
    expect(record.did).toMatch(/^did:iota:local:0x/);
    expect(credential.payload.credentialSubject.uniqueness?.method).toBe("worldid-nullifier");

    const result = await stack.verify(credential.jwt);
    expect(result.valid).toBe(true);
    expect(result.checks).toEqual({
      signatureValid: true,
      issuerTrusted: true,
      notRevoked: true
    });
  });

  it("enforces one-human-one-identity via the World ID nullifier", async () => {
    await stack.onboardHuman({ worldId: { simulate: true, signal: "bob" } });
    await expect(
      stack.onboardHuman({ worldId: { simulate: true, signal: "bob" } })
    ).rejects.toThrow(/already has an AYA identity/);
  });

  it("registers a plant and an animal under a human guardian", async () => {
    const { record: guardian } = await stack.onboardHuman({
      worldId: { simulate: true, signal: "carol" }
    });

    const { credential: tree } = await stack.onboardBeing({
      kingdom: "plantae",
      taxon: { scientificName: "Quercus robur", rank: "species", commonName: "English oak" },
      guardianDid: guardian.did,
      uniqueness: { method: "geo-genetic-hash", proofRef: "sha256:abc" }
    });
    const { credential: lion } = await stack.onboardBeing({
      kingdom: "animalia",
      taxon: { scientificName: "Panthera leo", rank: "species", commonName: "Lion" },
      guardianDid: guardian.did,
      uniqueness: { method: "microchip", proofRef: "985112345678900" }
    });

    expect(tree.payload.credentialSubject.guardian).toBe(guardian.did);
    expect(lion.payload.credentialSubject.connectedTo?.[0]).toEqual({
      rel: "wardOf",
      id: guardian.did
    });
    expect((await stack.verify(tree.jwt)).valid).toBe(true);
    expect((await stack.verify(lion.jwt)).valid).toBe(true);
    expect(stack.registry()).toHaveLength(3);
  });

  it("rejects registering a being under an unknown guardian", async () => {
    await expect(
      stack.onboardBeing({
        kingdom: "plantae",
        taxon: { scientificName: "Bellis perennis", rank: "species" },
        guardianDid: "did:iota:local:0xdeadbeef"
      })
    ).rejects.toThrow(/Unknown guardian/);
  });

  it("supports selective disclosure in a presentation", async () => {
    const { credential } = await stack.onboardHuman({
      worldId: { simulate: true, signal: "dora" },
      profile: { name: "Dora", jurisdiction: "DE", ageOver: 18 }
    });
    const presentation = stack.present(credential.id, ["kingdom"]);
    expect(presentation.disclosed.kingdom).toBe("human");
    // Name/attributes were NOT disclosed.
    expect(presentation.disclosed.attributes).toBeUndefined();
  });

  it("fails verification after a credential is revoked", async () => {
    const { credential } = await stack.onboardHuman({
      worldId: { simulate: true, signal: "evan" }
    });
    expect((await stack.verify(credential.jwt)).valid).toBe(true);

    stack.revoke(credential.id);
    const result = await stack.verify(credential.jwt);
    expect(result.valid).toBe(false);
    expect(result.checks.notRevoked).toBe(false);
    expect(result.errors).toContain("Credential has been revoked");
  });

  it("rejects a credential from an untrusted issuer", async () => {
    const other = await freshStack();
    const { credential } = await other.onboardHuman({ worldId: { simulate: true, signal: "mal" } });
    // `stack` does not trust `other`'s issuer DID, and cannot resolve its key.
    const result = await stack.verify(credential.jwt);
    expect(result.valid).toBe(false);
  });
});
