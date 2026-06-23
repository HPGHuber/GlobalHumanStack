/**
 * Anchoring interface for AYA.ONE identities on the IOTA ledger.
 *
 * In the IOTA DID method (`did:iota`), a DID Document is published as a shared
 * Move object on the network. This package defines the TypeScript-side interface
 * the SDK targets; the production implementation binds it to `@iota/identity-wasm`
 * (see `identity.move` for the on-chain object shape).
 */

export interface AnchorRef {
  /** The `did:iota:<network>:0x<objectId>` identifier of the anchored document. */
  did: string;
  /** The IOTA network the document is published on (e.g. "testnet", "mainnet"). */
  network: string;
  /** Object id of the shared Move `Identity` object holding the DID document. */
  objectId: string;
}

export interface AnchoredDocument {
  did: string;
  /** The published DID document, encoded per the IOTA DID Method Specification. */
  document: Record<string, unknown>;
  meta: { created: string; updated: string };
}

/**
 * Publishes, resolves and updates DID documents on IOTA. Implemented in the SDK
 * by a local adapter (prototype) or an `@iota/identity-wasm`-backed adapter that
 * anchors documents as Move objects on the configured network (production).
 */
export interface IdentityAnchor {
  publish(document: Record<string, unknown>, network: string): Promise<AnchorRef>;
  resolve(did: string): Promise<AnchoredDocument | undefined>;
  /** Updates the revocation status list anchored alongside the issuer identity. */
  setRevoked(did: string, statusListIndex: number, revoked: boolean): Promise<void>;
}
