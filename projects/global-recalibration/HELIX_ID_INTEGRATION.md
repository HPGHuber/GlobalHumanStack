# Helix ID Integration — ONCE × NECO × Global Recalibration

**Status:** Proposed integration specification; vendor discovery required  
**Date:** 5 November 2026

## 1. Scope and product identification

This document concerns the consumer identity wallet at https://helixid.io/ (helix id), described on its public website as a digital wallet for Web2/Web3 services and digital credentials.

It does **not** refer to the separate open-source AI-agent identity project at https://github.com/helixid/helixid or docs.helixid.dev. That is a different product and must not be treated as the helixid.io app SDK.

Public website material describes a smartphone Smart ID Wallet, one-time verification of personal details, management and presentation of digital credentials, passwordless access to services, and user control, consent, minimisation, portability and interoperability as stated design principles.

Publicly accessible material reviewed for this proposal does not establish a current public developer API, SDK, credential exchange profile, wallet deep-link specification, OpenID4VC support, or commercial integration terms. These must be confirmed directly with the helix id team before implementing against the production app.

## 2. Proposed role in Global Recalibration

Helix ID is a candidate credential wallet / identity provider adapter.

- **HeavenKey:** common ONCE account entry and passkey authentication.
- **Helix ID:** optional user-held digital credential wallet and presentation experience.
- **World ID:** optional proof-of-human / uniqueness proof.
- **ONCE:** messaging, user directory, consent-aware credential request and payment-intent transport.
- **NECO:** payment ecosystem and common-good programmes.
- **IBAN / SEPA / regulated PSPs:** bank-payment rails.

These components are complementary, not interchangeable. A wallet credential is not necessarily a login credential; a DID is not automatically a verified legal identity; proof-of-human is not proof of a person's name, address or bank-account ownership.

## 3. Integration principles

1. User consent and selective disclosure: request only claims required for a specific service.
2. No central identity database in ONCE: store account references and consent receipts, not copies of identity documents.
3. Do not assume Helix ID credentials are W3C VC, SD-JWT VC, mdoc, EUDI-compatible or OpenID4VC-compatible until the vendor confirms exact formats and profiles.
4. Do not scrape or reverse engineer private mobile APIs.
5. Do not collect biometrics or raw identity documents in ONCE.
6. Offer HeavenKey/passkey and alternative identity routes; Helix ID must not be a universal gate.
7. Separate identity verification from payment execution. Only regulated PSPs and banks verify bank-account ownership and execute transfers.
8. For payment alias resolution, use consented provider APIs and Verification of Payee where applicable; never expose IBANs in public identity directories.

## 4. User journeys

### A. Sign in to ONCE
- User creates or accesses an ONCE account using HeavenKey passkey.
- If the user chooses, ONCE offers “Present a credential with Helix ID”.
- Helix ID opens through a vendor-supported deep link, QR handoff or standard protocol (to be confirmed).
- User reviews requested claims and approves presentation.
- ONCE validates the presentation using vendor-supported verification and trust configuration.
- ONCE stores a minimal verification result and consent/audit record, not the underlying document.

### B. Verified organisation / community membership
- An authorised issuer issues a credential under an agreed trust framework.
- User stores it in Helix ID.
- ONCE requests only the required attribute, such as “member of organisation X” or “over 18”, if the credential format supports selective disclosure.
- ONCE verifies issuer, signature, validity, status/revocation and audience/purpose.
- User can revoke consent or stop sharing future presentations; this does not imply deletion of records a service is legally required to retain.

### C. NECO payment onboarding
- HeavenKey signs the user into the NECO experience.
- Helix ID may present required KYC-related identity attributes only through an authorised regulated partner's approved workflow.
- The bank, EMI or payment institution performs its own customer due diligence and risk decision.
- A credential presentation is not, by itself, proof that a regulated institution has completed its AML/KYC obligations.
- IBAN beneficiary verification and payment initiation remain with the PSP/bank.

## 5. Adapter architecture

Create a provider-neutral IdentityCredentialProvider interface in the Global Commons stack:

- beginPresentation(request) — start a user-consented wallet handoff.
- completePresentation(response) — accept a wallet response.
- verifyPresentation(response, policy) — verify cryptographic proof and issuer trust.
- getClaims(presentation) — return only disclosed claims.
- checkStatus(credential) — validate expiry, suspension or revocation where supported.
- recordConsent(receipt) — retain minimal purpose, timestamp, verifier and disclosed-claim metadata.
- revokeSession(sessionId) — terminate the ONCE-side session.

The helix id adapter must be implemented only after its supported protocol, SDK, endpoints, keys, metadata, test credentials and terms are confirmed. No endpoint names or API behaviour are assumed in this specification.

## 6. Security and privacy requirements

- Validate signatures, issuer trust, audience, nonce, expiry and status.
- Bind presentations to a fresh ONCE request and prevent replay.
- Protect against verifier impersonation and credential substitution.
- Encrypt sensitive data in transit and at rest.
- Keep identity claims out of message content, public profiles and analytics by default.
- Do not use credential data for advertising or profiling.
- Provide a clear disclosure screen showing requester, purpose and exact claims.
- Conduct a GDPR data-protection impact assessment where required.
- Establish incident response, key rotation and vendor offboarding procedures.
- Independent security and privacy review before production.

## 7. Vendor discovery checklist

Request from helix id:
1. Current developer integration documentation and supported SDKs.
2. Supported credential formats and standards (W3C VC, SD-JWT VC, ISO mdoc, OpenID4VCI / OpenID4VP, EUDI Wallet interfaces, if any).
3. Wallet-to-service presentation flow: deep links, QR codes, universal links, redirect and callback semantics.
4. Issuer trust framework, metadata discovery, signing keys and revocation/status mechanisms.
5. Selective disclosure and holder binding capabilities.
6. Test environment, sample credentials and conformance suite.
7. Data-controller/processor roles, subprocessors, data locations, retention and deletion.
8. Security assurance, penetration-test summaries and vulnerability disclosure process.
9. Commercial, licensing, support and service-level terms.
10. Permission to list helix id as a partner; no public partnership claim before written agreement.

## 8. Phased implementation

### Phase 0 — partner discovery
Confirm the correct product, product owner, supported standards, technical contact and sandbox access.

### Phase 1 — standards-based prototype
Build the provider-neutral interface and a mock wallet adapter. Demonstrate a user-approved credential request and verifier-side validation using test credentials.

### Phase 2 — Helix ID sandbox
Implement the actual adapter only against documented, vendor-approved APIs or standard protocol support. Test invalid signatures, expired and revoked credentials, wrong audience, replay and user cancellation.

### Phase 3 — ONCE / NECO pilot
Use verified attributes only where necessary for a specific ONCE or regulated PSP workflow. Keep payment KYC and transaction controls with the authorised provider.

### Phase 4 — production review
Complete DPIA, security review, legal review, support procedures, accessibility testing and contractual approval.

## 9. Acceptance criteria

- User can decline credential presentation and still use basic ONCE messaging.
- No raw identity document or biometric is sent to ONCE.
- Only explicitly requested claims are disclosed.
- Invalid, expired, revoked, replayed or misdirected presentations are rejected.
- ONCE can use more than one credential wallet provider.
- No production API integration is claimed until tested against an authorised Helix ID sandbox.
- NECO payments remain under the control of the relevant regulated PSP/issuer.

## 10. Public positioning

**Helix ID could become one of the credential-wallet bridges in Global Recalibration.** HeavenKey remains the universal entry experience; ONCE remains the open communication layer; NECO remains the common-good economic project.

This is an integration proposal, not a claim of an existing relationship, endorsement or completed technical integration.
