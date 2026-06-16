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
    expect(stack.mode()).toEqual({ iota: "mock", waltid: "mock", worldid: "mock", fifa: "mock" });
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

  it("issues a WorldPass credential for a unique human football fan", async () => {
    const { record, credential } = await stack.onboardFan({
      worldId: { simulate: true, signal: "worldpass:messi_fan_10" },
      fan: { handle: "messi_fan_10", favoriteTeam: "Argentina" }
    });

    expect(record.kingdom).toBe("human");
    expect(credential.payload.type).toContain("WorldPassCredential");
    const fan = credential.payload.credentialSubject.fan;
    expect(fan?.fifaCollectHandle).toBe("messi_fan_10");
    expect(fan?.favoriteTeam).toBe("Argentina");
    expect(fan?.worldPassId).toMatch(/^WP-[0-9A-F]{12}$/);
    expect(fan?.competition).toBe("FIFA World Cup 2026");
    expect(typeof fan?.collectiblesCount).toBe("number");

    expect((await stack.verify(credential.jwt)).valid).toBe(true);
  });

  it("enforces one-human-one-WorldPass per competition", async () => {
    await stack.onboardFan({
      worldId: { simulate: true, signal: "worldpass:lena" },
      fan: { handle: "lena" }
    });
    await expect(
      stack.onboardFan({
        worldId: { simulate: true, signal: "worldpass:lena" },
        fan: { handle: "lena" }
      })
    ).rejects.toThrow(/already holds a WorldPass/);
  });

  it("discloses only the fan claim in a WorldPass presentation", async () => {
    const { credential } = await stack.onboardFan({
      worldId: { simulate: true, signal: "worldpass:omar" },
      fan: { handle: "omar", favoriteTeam: "Morocco" }
    });
    const presentation = stack.present(credential.id, ["fan"]);
    expect(presentation.disclosed.fan?.favoriteTeam).toBe("Morocco");
    expect(presentation.disclosed.uniqueness).toBeUndefined();
  });

  it("rejects a credential from an untrusted issuer", async () => {
    const other = await freshStack();
    const { credential } = await other.onboardHuman({ worldId: { simulate: true, signal: "mal" } });
    // `stack` does not trust `other`'s issuer DID, and cannot resolve its key.
    const result = await stack.verify(credential.jwt);
    expect(result.valid).toBe(false);
  });

  describe("Player of the Match voting", () => {
    const MATCH = "M-ARG-FRA";

    async function claimWorldPass(
      handle: string,
      opts: { favoriteTeam?: string; competition?: string } = {}
    ): Promise<string> {
      const { credential } = await stack.onboardFan({
        worldId: { simulate: true, signal: `worldpass:${handle}` },
        fan: { handle, favoriteTeam: opts.favoriteTeam },
        competition: opts.competition
      });
      return credential.id;
    }

    it("lists mock fixtures with rosters and zero votes", async () => {
      const matches = await stack.listMatches();
      expect(matches.length).toBeGreaterThan(0);
      const match = matches.find((m) => m.id === MATCH);
      expect(match?.status).toBe("voting_open");
      expect(match?.roster.length).toBeGreaterThan(0);
      expect(match?.totalVotes).toBe(0);
    });

    it("lets a WorldPass holder cast one vote that is tallied", async () => {
      const pass = await claimWorldPass("fan_a");
      const view = await stack.castVote({
        worldPassCredentialId: pass,
        matchId: MATCH,
        playerId: "messi"
      });
      expect(view.totalVotes).toBe(1);
      expect(view.results.find((r) => r.id === "messi")?.votes).toBe(1);
    });

    it("rejects voting without a valid WorldPass", async () => {
      const { credential } = await stack.onboardHuman({
        worldId: { simulate: true, signal: "not_a_fan" }
      });
      await expect(
        stack.castVote({ worldPassCredentialId: credential.id, matchId: MATCH, playerId: "messi" })
      ).rejects.toThrow(/valid WorldPass is required/);
      await expect(
        stack.castVote({ worldPassCredentialId: "nope", matchId: MATCH, playerId: "messi" })
      ).rejects.toThrow(/valid WorldPass is required/);
    });

    it("rejects a WorldPass issued for a different competition", async () => {
      const pass = await claimWorldPass("euro_fan", { competition: "UEFA Euro 2028" });
      await expect(
        stack.castVote({ worldPassCredentialId: pass, matchId: MATCH, playerId: "messi" })
      ).rejects.toThrow(/is for UEFA Euro 2028/);
    });

    it("rejects voting with a revoked WorldPass", async () => {
      const { credential } = await stack.onboardFan({
        worldId: { simulate: true, signal: "worldpass:revoked_fan" },
        fan: { handle: "revoked_fan" }
      });
      stack.revoke(credential.id);
      await expect(
        stack.castVote({ worldPassCredentialId: credential.id, matchId: MATCH, playerId: "messi" })
      ).rejects.toThrow(/revoked/);
    });

    it("enforces one vote per WorldPass per match but allows voting in another match", async () => {
      const pass = await claimWorldPass("fan_b");
      await stack.castVote({ worldPassCredentialId: pass, matchId: MATCH, playerId: "messi" });
      await expect(
        stack.castVote({ worldPassCredentialId: pass, matchId: MATCH, playerId: "mbappe" })
      ).rejects.toThrow(/already voted/);
      // Same fan, different match → allowed.
      const other = await stack.castVote({
        worldPassCredentialId: pass,
        matchId: "M-BRA-GER",
        playerId: "vinicius"
      });
      expect(other.totalVotes).toBe(1);
    });

    it("rejects voting for a player not on the match roster", async () => {
      const pass = await claimWorldPass("fan_c");
      await expect(
        stack.castVote({ worldPassCredentialId: pass, matchId: MATCH, playerId: "ronaldo" })
      ).rejects.toThrow(/Unknown player/);
    });

    it("awards a verifiable PlayerOfTheMatchCredential to the winner and closes voting", async () => {
      const a = await claimWorldPass("voter_1");
      const b = await claimWorldPass("voter_2");
      const c = await claimWorldPass("voter_3");
      await stack.castVote({ worldPassCredentialId: a, matchId: MATCH, playerId: "messi" });
      await stack.castVote({ worldPassCredentialId: b, matchId: MATCH, playerId: "messi" });
      await stack.castVote({ worldPassCredentialId: c, matchId: MATCH, playerId: "mbappe" });

      const { credential } = await stack.awardPlayerOfTheMatch(MATCH);
      expect(credential.payload.type).toContain("PlayerOfTheMatchCredential");
      const award = credential.payload.credentialSubject.award;
      expect(award?.playerName).toBe("Lionel Messi");
      expect(award?.votes).toBe(2);
      expect(award?.totalVotes).toBe(3);
      expect((await stack.verify(credential.jwt)).valid).toBe(true);

      const view = await stack.getMatch(MATCH);
      expect(view.status).toBe("voting_closed");
      expect(view.winnerPlayerId).toBe("messi");

      // Voting is closed and cannot be re-awarded.
      const late = await claimWorldPass("late_voter");
      await expect(
        stack.castVote({ worldPassCredentialId: late, matchId: MATCH, playerId: "messi" })
      ).rejects.toThrow(/not open/);
      await expect(stack.awardPlayerOfTheMatch(MATCH)).rejects.toThrow(/already been awarded/);
    });

    it("rejects awarding a match with no votes", async () => {
      await expect(stack.awardPlayerOfTheMatch("M-BRA-GER")).rejects.toThrow(/No votes/);
    });
  });
});
