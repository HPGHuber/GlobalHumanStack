# ONCE System Architecture

**Status:** Architecture proposal · Draft 0.1

## Components

### 1. HeavenKey entry
- Passkey-first sign-in using WebAuthn/FIDO2.
- User chooses a homeserver/provider or a hosted default.
- Local client creates a separate ONCE identity signing key and device encryption keys.
- Device authorisation, key verification, recovery and revocation are explicit flows.
- Authentication credentials and message-encryption keys are separate.

### 2. ONCE clients
- Android and iOS first; responsive web client for onboarding and desktop access.
- Local encrypted key store using platform secure storage.
- Clear device list, session list, contact permissions and bridge warnings.
- Offline outbox and bounded local message cache.
- Accessible UI, screen-reader support and localisation.

### 3. ONCE protocol services
- Identity and device directory (minimum necessary data).
- Event submission and delivery.
- Conversation membership and cryptographic state integration.
- Encrypted media references.
- Push notification relay carrying opaque wake-up hints, never plaintext message previews by default.
- Abuse controls, rate limiting and account/device recovery endpoints.

### 4. Homeservers and federation
- User-selected provider or self-hosted instance.
- Authenticated server-to-server transport.
- Encrypted event queues and retry semantics.
- Provider portability export and migration procedure.
- Federation policy and blocklists without global central control.

### 5. Bridges
- Isolated connector workers with scoped credentials.
- Per-bridge user consent and visible connection status.
- Explicit labels for end-to-end encryption boundaries.
- No scraping, unofficial account automation or credential collection.
- Disconnect and revoke controls.

## Suggested implementation path

**Do not build a new distributed protocol before validating the user experience.** Start with a Matrix-compatible prototype and a HeavenKey onboarding layer. Document ONCE-specific requirements as extensions or profiles. If the existing standards cannot meet a proven requirement, submit upstream proposals or specify a minimal interoperable extension.

## Logical flow

```text
Person
  |
  v
HeavenKey (WebAuthn passkey)
  |
  +----> Local ONCE identity + device keys
  |
  v
ONCE Client
  |
  +----> E2EE engine (reviewed implementation)
  |
  v
ONCE API / Matrix-compatible homeserver
  |
  +----> Federation ----> Other homeservers / clients
  |
  +----> Encrypted media storage
  |
  +----> Optional consent-based bridge adapters
```

## Data boundaries

| Data | Client | Home server | Bridge |
|---|---|---|---|
| Plaintext private message | Yes, while displayed | No | Only if user explicitly trusts a decrypting bridge |
| Ciphertext | Yes | Yes, as required for delivery/sync | Depends on bridge design |
| Device public keys | Yes | Yes, minimum required | Usually no |
| Device private keys | Yes, protected locally | Never | Never |
| Contact discovery attributes | User-controlled | Only with explicit opt-in | Only if explicitly authorised |
| Delivery metadata | Yes | Limited operational metadata | Bridge-specific |
| Recovery secrets | User-controlled | Never in plaintext | Never |

## Deployment profiles

- **Personal:** hosted provider with user-controlled export.
- **Community:** cooperative, club, school or local organisation homeserver.
- **Self-hosted:** individual or family-operated server.
- **Enterprise/public service:** managed deployment with policy controls and support.

Provider choice must not alter the protocol's core privacy guarantees.
