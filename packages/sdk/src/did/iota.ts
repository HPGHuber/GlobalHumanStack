import type { DidDocument, DidKeyPair } from "../types.js";
import { generateEd25519KeyPair } from "../crypto.js";

/**
 * Creates and resolves `did:iota` identifiers.
 *
 * The DID *format* produced here is the real `did:iota:<network>:0x<hex>` shape.
 * In this prototype the DID document is held in an in-memory registry rather
 * than anchored on the IOTA ledger; swapping in `@iota/identity-wasm` to anchor
 * the document as a Move object on the configured network is the production step
 * (see packages/contracts).
 */
export interface DidAdapter {
  create(): Promise<DidKeyPair>;
  register(keyPair: DidKeyPair): void;
  resolve(did: string): DidDocument | undefined;
}

export class LocalIotaDidAdapter implements DidAdapter {
  private readonly registry = new Map<string, DidDocument>();

  constructor(private readonly network: string = "local") {}

  async create(): Promise<DidKeyPair> {
    const { publicKeyJwk, privateKeyJwk, fingerprint } = await generateEd25519KeyPair();
    const did = `did:iota:${this.network}:0x${fingerprint}`;
    const keyPair: DidKeyPair = { did, publicKeyJwk, privateKeyJwk };
    this.register(keyPair);
    return keyPair;
  }

  register(keyPair: DidKeyPair): void {
    this.registry.set(keyPair.did, {
      id: keyPair.did,
      verificationMethod: [
        {
          id: `${keyPair.did}#key-1`,
          controller: keyPair.did,
          type: "JsonWebKey2020",
          publicKeyJwk: keyPair.publicKeyJwk
        }
      ]
    });
  }

  resolve(did: string): DidDocument | undefined {
    return this.registry.get(did);
  }
}
