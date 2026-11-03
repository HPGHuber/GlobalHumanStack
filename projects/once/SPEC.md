# ONCE Protocol — Scope and Initial Specification

**Document status:** Draft 0.1 · 2026-11-03  
**Project:** ONCE — Open Global Communication  
**Entry experience:** HeavenKey

## 1. Purpose

ONCE defines an open, vendor-neutral communication layer so independently operated applications and services can exchange messages with user consent. It is an interoperability protocol and ecosystem, not a requirement that the world use one app.

The initial goal is secure person-to-person messaging across ONCE-compatible clients and servers. Email interoperability, group messaging, calls, files, public channels and third-party bridges are later capabilities.

## 2. Non-goals

- Replacing every existing messenger in one release.
- Claiming access to closed networks without their official APIs or permission.
- Circumventing platform security, encryption or terms.
- Inventing new cryptographic primitives.
- Making a blockchain mandatory for chat delivery.
- Putting private message content or personal contact graphs on a public ledger.
- Treating a global directory as a public phonebook.

## 3. Design principles

- Open specifications and interoperable implementations.
- Federation and provider portability.
- End-to-end encryption for private conversations by default.
- User-controlled identifiers and device membership.
- Explicit consent for contact discovery and bridging.
- Data minimisation and metadata transparency.
- Accessibility, localisation and low-bandwidth operation.
- Backward-compatible evolution and public security review.

## 4. Core entities

- **Person:** human user represented by one or more identifiers.
- **ONCE ID:** stable, user-controlled identifier; not inherently a legal identity.
- **Device:** cryptographic endpoint authorised by the user.
- **Provider / homeserver:** stores and routes encrypted events for its users.
- **Conversation:** direct or group context with membership and cryptographic state.
- **Event:** typed, versioned, authenticated protocol object.
- **Bridge:** optional gateway to a separate network; trust boundary is always disclosed.
- **HeavenKey:** passkey-first account-entry and identity-management experience.

An ONCE ID must not require a phone number. A phone number or email may be a discoverability/recovery attribute only if the user explicitly chooses to link it.

## 5. Protocol layers

1. **Entry and authentication:** WebAuthn/passkeys through HeavenKey.
2. **Identity and device keys:** local key generation, device authorisation, recovery and revocation.
3. **Discovery:** privacy-preserving lookup with explicit opt-in; no global scrapeable address book.
4. **Messaging:** versioned events, delivery acknowledgements, edits, deletes and receipts.
5. **Cryptography:** established E2EE protocols and reviewed libraries. Evaluate Matrix Olm/Megolm and/or MLS (RFC 9420) for appropriate conversation types; select one coherent interoperable profile before implementation.
6. **Federation and sync:** authenticated server-to-server exchange, replay protection, event ordering and offline queues.
7. **Media:** encrypted attachments with expiring, access-controlled references.
8. **Real-time:** WebRTC signalling through ONCE; media encryption and metadata handling specified separately.
9. **Bridges:** opt-in adapters with explicit security labels and least-privilege credentials.

## 6. Message lifecycle

1. Sender composes content in a client.
2. Client validates the event and encrypts it for the conversation's authorised devices.
3. Client submits ciphertext to its selected provider.
4. Provider routes and stores only what is needed for delivery and sync.
5. Recipient clients verify sender/device authenticity and decrypt locally.
6. Delivery/read receipts are optional and user-configurable.
7. Device removal or membership changes trigger the selected E2EE protocol's key update procedure.

Servers must not receive plaintext private message bodies as part of normal ONCE delivery.

## 7. Interoperability model

ONCE uses adapters, not claims of universal access. Every bridge must document:
- supported operations and limitations;
- whether E2EE remains end-to-end across the bridge;
- which metadata the bridge operator can see;
- data retention and deletion behaviour;
- rate limits and provider/API dependencies;
- consent, revocation and incident handling.

A bridge that decrypts and re-encrypts content is a separate trusted endpoint. It must never be described as preserving end-to-end encryption between the original users unless the cryptographic design actually proves that property.

## 8. Compatibility strategy

Prefer standards and existing ecosystems:
- Matrix Client-Server and Server-Server APIs for federation evaluation;
- MLS (IETF RFC 9420) for standardised group key establishment where suitable;
- WebAuthn / FIDO2 for passkey authentication;
- WebRTC for calls;
- SMTP/IMAP for email gateways;
- W3C DID and Verifiable Credentials only for optional portable identity/claims.

The ONCE working group must publish an interoperability profile and test vectors before declaring conformance.

## 9. Governance and versioning

- Public RFC-style proposals and issue discussion.
- Semantic versioning for implementation releases; independent protocol versioning for wire formats.
- Published change log, deprecation policy and conformance tests.
- Security review before cryptographic or identity changes.
- No single vendor has unilateral protocol control.
- Trademark and certification policy must not restrict independent compatible implementations.

## 10. Open questions before protocol freeze

- Matrix-native extension versus a distinct wire protocol.
- Direct-message cryptographic profile and group profile.
- Cross-server identity resolution and portability guarantees.
- Recovery design that does not turn HeavenKey into a universal key escrow.
- Metadata minimisation and abuse prevention.
- Legal and technical feasibility of each external bridge.
- Email gateway semantics and secure downgrade warnings.
