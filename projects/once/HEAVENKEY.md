# HeavenKey — ONCE Entry and Identity Experience

**Positioning:** One calm, secure entry point to the open communication network.  
**Status:** Product and security design draft.

## Product promise

**One key to enter. Your identity remains yours.**

HeavenKey is the onboarding and account-management experience for ONCE. It should make secure communication approachable without making HeavenKey a central custodian of every user's identity or encryption secrets.

## Sign-in flow

1. User opens an ONCE client and selects **Create with HeavenKey** or **Sign in**.
2. User creates a passkey using the device's platform authenticator or a security key.
3. Client creates a random ONCE user identifier and a separate device identity.
4. Client generates cryptographic keys locally using a reviewed cryptographic library.
5. User verifies the new device and receives a clear recovery setup.
6. User chooses a hosted provider, community server or self-hosted endpoint.
7. User can optionally link an email, phone number, domain, DID or verifiable credential for discovery or account recovery.

## Critical cryptographic separation

A WebAuthn passkey is an authentication credential. The relying party receives a signed assertion; it does not receive the passkey's private key. Therefore:
- Do not derive message encryption keys from a passkey assertion.
- Do not claim a passkey alone can recover all E2EE history.
- Generate messaging identity and device keys separately on the user's device.
- Protect local keys with OS secure storage and a reviewed key-management design.
- Design multi-device enrolment and recovery as separate cryptographic protocols.
- Never implement custom cryptography or home-grown key wrapping.

## Recovery options

Offer multiple user-understandable choices, with clear trade-offs:
- add a second passkey/security key;
- authorise another trusted device;
- create an offline recovery kit protected by a user-chosen secret;
- optionally use a threshold-based recovery design after independent review.

No default operator escrow. No hidden master key. Recovery must not silently weaken forward secrecy or allow a provider to impersonate the user.

## Identity model

- ONCE ID is a stable communication identifier, not proof of legal identity.
- DID or Verifiable Credentials are optional and purpose-limited.
- World ID, EUDI Wallet or other external identity systems must never be mandatory for ordinary messaging.
- Users control profile visibility and contact-discovery attributes.
- Changing email or phone must not change the ONCE ID.
- Provider migration must preserve identity through a documented key-transfer or identity-continuity procedure.

## UX requirements

- Explain passkey, device key and recovery in plain language.
- Show what each provider can see.
- Show exactly which devices are authorised.
- Make device revocation and bridge disconnection easy.
- Provide a safe path for lost-device recovery.
- Avoid dark patterns, forced contact uploads and public-by-default profiles.

## Proposed first demo

A browser demo using WebAuthn in a secure origin:
- passkey registration and authentication;
- local key generation through a vetted library;
- device registration;
- encrypted local test message;
- add/revoke a second test device;
- recovery-flow usability prototype.

This demo is not production-ready until reviewed and tested by security specialists.
