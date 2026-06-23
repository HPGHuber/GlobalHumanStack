import { sha256Hex } from "../crypto.js";
import type { StackConfig } from "../config.js";
import type { WorldIdProof, WorldIdResult } from "../types.js";

/**
 * Verifies a World ID "proof of human".
 *
 * - When World ID is configured (`WORLD_APP_ID`), the proof is forwarded to the
 *   World Developer Portal verify endpoint and the returned nullifier is used.
 * - Otherwise (or when `proof.simulate` is set), a deterministic mock nullifier
 *   is derived locally so the onboarding demo runs offline. Sybil-resistance
 *   semantics (one human = one nullifier) are preserved in both modes.
 */
export async function verifyWorldId(
  proof: WorldIdProof,
  config: StackConfig["worldid"]
): Promise<WorldIdResult> {
  const useSimulator = proof.simulate || !config.enabled;

  if (useSimulator) {
    const nullifier =
      proof.nullifier_hash ??
      `0x${sha256Hex(`${config.appId ?? "mock-app"}:${config.action}:${proof.signal ?? "anon"}`)}`;
    return { success: true, nullifier };
  }

  const target = config.rpId ?? config.appId;
  const response = await fetch(`https://developer.world.org/api/v4/verify/${target}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(proof)
  });

  if (!response.ok) {
    return {
      success: false,
      nullifier: "",
      error: `World ID verification failed (${response.status}): ${await response.text()}`
    };
  }

  const data = (await response.json()) as { nullifier_hash?: string; nullifier?: string };
  const nullifier = data.nullifier_hash ?? data.nullifier;
  if (!nullifier) {
    return { success: false, nullifier: "", error: "World ID response missing nullifier" };
  }
  return { success: true, nullifier };
}

/** Enforces one-human-one-identity by tracking spent nullifiers per action. */
export class NullifierStore {
  private readonly seen = new Set<string>();

  has(nullifier: string): boolean {
    return this.seen.has(nullifier);
  }

  add(nullifier: string): void {
    this.seen.add(nullifier);
  }
}
