# NECO × ONCE — Unified Money & Messaging Standard
## IBAN interoperability, payment intents and encrypted communication

**Status:** Architecture proposal / discussion draft  
**Date:** 3 November 2026  
**Parent programme:** Global Recalibration

## 1. Vision

Make sending a message and sending money two actions available from one trusted conversation and one human-readable address.

- ONCE is the open communication and payment-intent coordination protocol.
- NECO is the proposed global common-good currency and payment ecosystem.
- IBAN remains a widely used bank-account identifier and SEPA payment rail.
- ISO 20022 supplies structured financial message semantics.
- SEPA Instant Credit Transfer enables near-real-time euro transfers through participating payment service providers.
- Verification of Payee helps check that the beneficiary name matches the IBAN before payment.
- AllUnity / EURAU is a candidate regulated euro-token integration, subject to a formal agreement and issuer/distribution rules.

The goal is not to replace IBAN. The goal is to make IBAN, account-to-account payments, regulated digital money and ONCE conversations interoperable through an open user experience.

## 2. One user address, multiple routes

Define an optional portable ONCE address, for example @alice.once or once://alice.

It resolves through a privacy-preserving directory to services the user has chosen to expose:
- ONCE messaging endpoint and public-key discovery.
- Payment aliases registered by the user, such as an IBAN or supported wallet address.
- Preferred payment currency and permitted payment methods.
- Optional public profile and verified organisation credentials.

The public ONCE address must not reveal the user's IBAN. The directory should return a payment-request capability or provider-mediated alias resolution, not an unrestricted bank-account lookup. Users can disable discovery, rotate aliases and choose who can request payment details.

A user can also send a payment to an IBAN directly, without requiring the recipient to have an ONCE account.

## 3. Two distinct message types

### A. ONCE chat message
An end-to-end encrypted human communication message. The service provider should not be able to read message content.

### B. ONCE Payment Intent
A structured, signed request to pay. It is not itself a payment, money transfer, bank instruction or guarantee of settlement.

Proposed fields:
- protocol version and unique intent ID
- payer and payee ONCE identifiers (optional)
- payee display name
- payment destination type: IBAN / regulated wallet / card payment request / local rail
- destination token or provider-mediated alias (never publish raw IBAN in public directory)
- amount, currency and optional exchange-rate quote
- structured remittance/reference data
- expiry timestamp and one-time nonce
- issuer/provider identifier and signature
- payment status callback reference

Sensitive fields should be disclosed only to the payer and authorised payment provider. Payment intents should be authenticated and protected against replay, substitution and tampering.

## 4. User experience

### Send money inside a conversation
1. Alice opens Bob's ONCE conversation.
2. Alice selects Send money.
3. Alice enters amount and currency, or opens a payment request Bob sent.
4. ONCE resolves Bob's selected payment route with his consent.
5. The selected PSP performs beneficiary verification where required.
6. Alice sees recipient, amount, currency, fees, route, exchange rate and provider before authorising.
7. Alice authenticates with her bank/payment provider using its approved strong customer authentication flow.
8. The PSP executes the payment.
9. A signed receipt/status event returns to ONCE and appears in the conversation.
10. Bob receives the money through the selected bank or wallet route.

ONCE must never collect bank login credentials, card security codes or private keys. Payment authorisation happens with the regulated provider.

### Send a message from a bank payment
A bank transfer can include a payment reference or structured remittance data that lets the recipient reconcile it with an ONCE invoice or request. The sender can optionally choose to notify the recipient through ONCE, subject to consent and data protection. The bank transfer itself must remain possible without ONCE.

## 5. Payment rails and adapters

### European starting point
- IBAN as the account identifier for SEPA credit transfers.
- SCT Inst for eligible instant euro transfers.
- ISO 20022 data structures for payment and remittance information.
- EPC Verification of Payee scheme for IBAN/name checks.
- Open-banking / payment-initiation APIs only through authorised account-servicing and payment service providers, under applicable law and user consent.

### NECO global routing layer
NECO should not pretend one rail works everywhere. It should route through a directory of regulated or otherwise legally permitted providers:
- SEPA / SEPA Instant
- domestic instant-payment systems
- bank transfer and open-banking payment initiation
- regulated e-money tokens and stablecoins
- card networks and approved card programmes
- permitted local wallet and mobile-money rails

The route engine should compare availability, settlement time, fees, currency, limits, reversibility, user protection and regulatory status. It must show the selected route and provider to the user.

## 6. Relationship between NECO and IBAN

IBAN identifies a bank account; it is not a currency and does not itself move money. A euro-denominated IBAN transfer is a payment instruction through a bank or payment institution. NECO is the proposed ecosystem layer coordinating access, routing, common-good services and potentially future currency instruments.

Recommended stages:
1. Stage 1: NECO uses existing bank accounts and IBANs as a payment destination. No new NECO currency issuance is needed.
2. Stage 2: Integrate regulated EUR token rails, such as EURAU, as a separate payment option if the issuer approves.
3. Stage 3: Add non-euro local currencies and regulated payment partners.
4. Stage 4: Assess whether a distinct NECO-denominated instrument is necessary and legally viable. Do not issue a purported global currency until there is a clear issuer, legal classification, reserve/redemption model, governance, consumer protection and financial sustainability.

Never imply that an IBAN balance is NECO or that a stablecoin is a bank deposit.

## 7. Protocol components

- ONCE Identity Directory: user-controlled handles and public-key discovery.
- Payment Alias Resolver: consent-based lookup of IBAN or wallet routes via a participating PSP; no public IBAN directory.
- Payment Intent Schema: signed, expiring, replay-protected payment requests.
- PSP Connector API: initiate/redirect to authorised payment providers and receive status events.
- VoP Connector: invoke the payer's PSP beneficiary-verification flow; ONCE does not impersonate the bank's verification service.
- ISO 20022 Mapper: map supported structured payment and remittance data without losing required fields.
- Receipt Event: signed confirmation from the PSP, distinguishing pending, accepted, settled, rejected, returned and refunded states.
- NECO Routing Engine: transparent route selection and quote presentation.
- Commons Ledger: separate accounting for grants and public-good programmes; never commingle with payment-token reserves.

## 8. Security, privacy and user protection

- End-to-end encryption for chat content.
- Data minimisation and purpose limitation for payment data.
- No public exposure of IBANs, account balances or transaction histories.
- Explicit consent before resolving a payment alias or sharing a payment request.
- Strong authentication and authorisation at the PSP.
- Recipient verification and clear warnings for mismatches.
- Signed payment intents, one-time nonces, expiry and idempotency.
- Independent cryptographic and application security review.
- Clear dispute, refund, chargeback and mistaken-payment processes according to the chosen rail.
- Do not promise that bank transfers are reversible or free.
- Accessible alternatives to World ID and biometric verification.

## 9. Governance and compliance boundaries

ONCE is a protocol and messaging software layer; NECO is an ecosystem proposal. Neither should perform regulated payment services unless the responsible legal entity is appropriately authorised.

Before production:
- obtain German/EU legal advice on PSD2, the evolving PSD3/PSR framework, ZAG, MiCA, AML/CFT, sanctions, GDPR, consumer protection and DORA where applicable;
- identify the regulated payment service provider, issuer, distributor, custodian and any card-programme manager;
- complete data-protection impact and security assessments;
- define liability and operational responsibilities contractually;
- publish fees, limits, execution times, FX rates, issuer and redemption details.

## 10. MVP proposal (90 days after partner access)

### Demo 1 — message + IBAN payment request
- ONCE web client with two demo identities.
- Chat with encrypted messages.
- Bob creates a EUR payment request addressed to Alice.
- Request includes amount, payee name, reference and an IBAN held only in the protected demo vault or resolved through a mock PSP.
- Alice reviews details and is redirected to a mock bank authorisation page.
- A simulated signed payment receipt returns to the chat.

### Demo 2 — real sandbox PSP integration
- Replace mock payment provider with an authorised partner sandbox.
- Demonstrate consent-based account/beneficiary resolution and payment initiation.
- Integrate the partner's VoP and status APIs where available.
- No live money until legal, compliance, partner and security approvals.

### Demo 3 — NECO multi-rail wallet
- Show IBAN / SEPA Instant as one route.
- Show EURAU as a separate regulated-token route if AllUnity approves sandbox access.
- Display route, provider, fees, execution estimate, currency and risks.
- No token issuance or public sale.

### MVP success criteria
- A user can send a secure message and create a payment request in one conversation.
- The receiver can pay through a participating PSP without ONCE custodying funds.
- Recipient verification is performed by the appropriate PSP.
- Payment status is reliably reconciled and shown accurately.
- Raw IBANs are not exposed in public discovery.
- A user can use IBAN payment without World ID or ONCE membership.
- Clear separation between chat delivery, payment initiation and final settlement.

## 11. Partnership targets

- AllUnity: explore EURAU as one regulated euro-token route and request sandbox/API and distribution requirements.
- Banks / payment institutions: provide SEPA Instant, VoP, account alias resolution and authorised payment initiation.
- European Payments Council ecosystem: align with published SEPA and Verification of Payee specifications; do not imply EPC endorsement.
- Visa: explore an optional approved card route, not a prerequisite for IBAN payments.
- World: optional proof-of-human integration; never mandatory for basic messaging or bank payments.
- Open-source and standards organisations: review schemas, threat model and governance.

## 12. Strategic principle

NECO is the global common-good currency project; ONCE is the open communication and payment-coordination standard; IBAN is one important existing banking address and rail.

The global ambition should be pursued through interoperability, regulated providers, transparent governance and open standards—not by claiming that one new token can replace every national currency or payment system.

**Tagline:** One conversation. One payment request. Many interoperable ways to settle.  
**#NECO #ONCE #GlobalRecalibration #AdFreeWorld**
