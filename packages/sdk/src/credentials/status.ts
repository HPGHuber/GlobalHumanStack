import type { CredentialStatusRef } from "../types.js";

/**
 * A minimal stand-in for a W3C Bitstring Status List. In production this list is
 * itself a Verifiable Credential anchored via IOTA so verifiers can check
 * revocation without contacting the issuer.
 */
export class StatusRegistry {
  private readonly revoked = new Set<number>();
  private nextIndex = 0;

  constructor(private readonly statusListUrl = "https://aya.one/status/1") {}

  allocate(): CredentialStatusRef {
    const statusListIndex = this.nextIndex++;
    return {
      type: "BitstringStatusListEntry",
      statusListIndex,
      statusListCredential: this.statusListUrl
    };
  }

  revoke(index: number): void {
    this.revoked.add(index);
  }

  isRevoked(index: number): boolean {
    return this.revoked.has(index);
  }
}
