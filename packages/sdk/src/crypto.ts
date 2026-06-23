import { createHash } from "node:crypto";
import { calculateJwkThumbprint, exportJWK, generateKeyPair, type JWK } from "jose";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export interface Ed25519KeyPair {
  publicKeyJwk: JWK;
  privateKeyJwk: JWK;
  /** Stable, hash-based identifier derived from the public key thumbprint. */
  fingerprint: string;
}

/** Generates a fresh Ed25519 (EdDSA) key pair and a public-key fingerprint. */
export async function generateEd25519KeyPair(): Promise<Ed25519KeyPair> {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", {
    crv: "Ed25519",
    extractable: true
  });
  const publicKeyJwk = await exportJWK(publicKey);
  const privateKeyJwk = await exportJWK(privateKey);
  publicKeyJwk.alg = "EdDSA";
  privateKeyJwk.alg = "EdDSA";
  const thumbprint = await calculateJwkThumbprint(publicKeyJwk, "sha256");
  return {
    publicKeyJwk,
    privateKeyJwk,
    fingerprint: sha256Hex(thumbprint)
  };
}
