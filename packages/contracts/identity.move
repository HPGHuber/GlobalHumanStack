// Illustrative on-chain shape for an AYA.ONE / IOTA Identity object.
//
// Per the IOTA DID Method Specification, a DID Document is stored as a shared
// Move object. A DID that uses this method begins with the prefix `did:iota`.
// This file documents the object the production `@iota/identity-wasm`-backed
// adapter would create/update; it is not compiled by the prototype.

module aya::identity {
    use std::string::String;

    /// Shared object holding a DID Document plus metadata.
    public struct Identity has key, store {
        id: UID,
        /// JSON-encoded DID Document (see IOTA DID Method Specification).
        document: vector<u8>,
        /// Controllers authorised to update this document (guardian/steward model).
        controllers: vector<address>,
        created_ms: u64,
        updated_ms: u64,
    }

    /// Bitstring status list anchored alongside an issuer for credential revocation.
    public struct StatusList has key, store {
        id: UID,
        issuer: address,
        /// Packed bitstring; bit[i] == 1 means credential index i is revoked.
        bits: vector<u8>,
    }

    /// Create (publish) a new identity document object.
    public fun create(document: vector<u8>, controllers: vector<address>, now_ms: u64, ctx: &mut TxContext): Identity {
        Identity {
            id: object::new(ctx),
            document,
            controllers,
            created_ms: now_ms,
            updated_ms: now_ms,
        }
    }

    /// Flip the revocation bit for a credential index (issuer-controlled).
    public fun set_revoked(list: &mut StatusList, index: u64, revoked: bool) {
        // Implementation elided — packs/unpacks `list.bits` at `index`.
        let _ = (list, index, revoked);
    }
}
