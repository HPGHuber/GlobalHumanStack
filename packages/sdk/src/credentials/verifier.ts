import { importJWK, jwtVerify } from "jose";
import type { DidAdapter } from "../did/iota.js";
import type { StatusRegistry } from "./status.js";
import type { VerifiableCredential, VerificationResult } from "../types.js";

export interface VerifierDeps {
  did: DidAdapter;
  status: StatusRegistry;
  trustedIssuers: Set<string>;
}

/**
 * Verifies a Living Being Credential VC-JWT: signature (via the issuer's
 * IOTA-anchored DID document), issuer trust, and revocation status.
 */
export async function verifyCredential(
  jwt: string,
  deps: VerifierDeps
): Promise<VerificationResult> {
  const errors: string[] = [];
  const checks = { signatureValid: false, issuerTrusted: false, notRevoked: false };
  let payload: VerifiableCredential | undefined;
  let issuerDid: string | undefined;
  let subjectDid: string | undefined;

  try {
    const unverifiedIssuer = decodeIssuer(jwt);
    const doc = unverifiedIssuer ? deps.did.resolve(unverifiedIssuer) : undefined;
    if (!doc) {
      errors.push(`Unable to resolve issuer DID: ${unverifiedIssuer ?? "<unknown>"}`);
      return { valid: false, checks, errors };
    }
    const publicKey = await importJWK(doc.verificationMethod[0].publicKeyJwk, "EdDSA");
    const { payload: claims } = await jwtVerify(jwt, publicKey);
    checks.signatureValid = true;

    payload = claims.vc as VerifiableCredential;
    issuerDid = payload.issuer;
    subjectDid = payload.credentialSubject.id;

    checks.issuerTrusted = deps.trustedIssuers.has(issuerDid);
    if (!checks.issuerTrusted) errors.push(`Issuer not in trust registry: ${issuerDid}`);

    checks.notRevoked = !deps.status.isRevoked(payload.credentialStatus.statusListIndex);
    if (!checks.notRevoked) errors.push("Credential has been revoked");
  } catch (err) {
    errors.push(`Signature verification failed: ${(err as Error).message}`);
    return { valid: false, checks, errors };
  }

  return {
    valid: checks.signatureValid && checks.issuerTrusted && checks.notRevoked,
    checks,
    subjectDid,
    issuerDid,
    errors
  };
}

/** Reads the `iss` claim without verifying — used only to locate the DID doc. */
function decodeIssuer(jwt: string): string | undefined {
  const parts = jwt.split(".");
  if (parts.length !== 3) return undefined;
  try {
    const body = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      iss?: string;
    };
    return body.iss;
  } catch {
    return undefined;
  }
}
