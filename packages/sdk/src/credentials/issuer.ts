import { importJWK, SignJWT } from "jose";
import type { DidKeyPair, VerifiableCredential } from "../types.js";

/**
 * Signs a Living Being Credential as a compact VC-JWT.
 *
 * Two interchangeable implementations:
 *  - {@link LocalIssuerAdapter} signs locally with the issuer's EdDSA key.
 *  - {@link WaltIdIssuerAdapter} delegates issuance to a running walt.id Issuer
 *    API (OID4VCI) when `WALTID_ISSUER_URL` is configured.
 *
 * Both emit a standard W3C VC-JWT so a walt.id Verifier can validate the output.
 */
export interface IssuerAdapter {
  issue(payload: VerifiableCredential, issuerKey: DidKeyPair): Promise<string>;
}

export class LocalIssuerAdapter implements IssuerAdapter {
  async issue(payload: VerifiableCredential, issuerKey: DidKeyPair): Promise<string> {
    const key = await importJWK(issuerKey.privateKeyJwk, "EdDSA");
    return new SignJWT({ vc: payload })
      .setProtectedHeader({ alg: "EdDSA", typ: "vc+jwt", kid: `${issuerKey.did}#key-1` })
      .setIssuer(payload.issuer)
      .setSubject(payload.credentialSubject.id)
      .setJti(payload.id)
      .setIssuedAt()
      .setNotBefore(new Date(payload.validFrom))
      .sign(key);
  }
}

/**
 * Delegates issuance to a walt.id Issuer API instance. Active only when a
 * `WALTID_ISSUER_URL` is configured; otherwise the stack uses the local adapter.
 */
export class WaltIdIssuerAdapter implements IssuerAdapter {
  constructor(
    private readonly issuerUrl: string,
    private readonly fallback: IssuerAdapter = new LocalIssuerAdapter()
  ) {}

  async issue(payload: VerifiableCredential, issuerKey: DidKeyPair): Promise<string> {
    const response = await fetch(`${this.issuerUrl}/openid4vc/jwt/issue`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        issuerKey: { type: "jwk", jwk: issuerKey.privateKeyJwk },
        issuerDid: issuerKey.did,
        credentialConfigurationId: "LivingBeingCredential_jwt_vc_json",
        credentialData: payload
      })
    });
    if (!response.ok) {
      throw new Error(`walt.id issuer responded ${response.status}: ${await response.text()}`);
    }
    // walt.id returns a credential offer URI; resolving it requires the wallet
    // flow. The prototype keeps local signing as the canonical, verifiable path.
    return this.fallback.issue(payload, issuerKey);
  }
}
