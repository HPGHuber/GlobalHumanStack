# ONCE Open Payments — Platform Pilot
**Version 1.0 | 5 November 2026 | Proposal, not an existing partnership or live integration**

## 1. Executive proposal

ONCE Open Payments is an open platform integration layer for digital services that want to offer bank-based payments, recurring direct debit and regulated wallet payments through one consistent API. The first pilot is a reusable platform adapter, initially tested with one platform and one EEA-authorised PSP.

**Decisions:** platform-first pilot; dual payment infrastructure (SEPA plus regulated wallet/stored-value); NECO integrated into the customer experience.

The goal is to reduce total cost per successful payment and card-network dependency while preserving customer choice. This is not a promise of zero-cost payments. Cards remain an optional fallback.

ONCE orchestrates payment intents, customer consent, status, routing and reconciliation. A licensed PSP, bank or e-money institution executes payments, safeguards funds where required, performs regulated checks and settles merchants. ONCE does not hold customer funds or issue e-money.

NECO appears as a separately accounted-for common-good benefit and funding layer. It must not be mixed with PSP settlement funds, e-money balances or customer deposits. Only funded, legally reviewed benefits may be shown as spendable value.

## 2. Product boundaries

| Layer | Responsibility |
|---|---|
| Platform | Customer relationship, order, fulfilment, pricing, merchant refund policy |
| ONCE | Payment intents, API orchestration, connector routing, consent references, status normalisation, webhooks and reconciliation |
| Licensed PSP / bank | Payment execution, SCA, AML/KYC allocation, sanctions, scheme participation, settlement and regulated reporting |
| Wallet / e-money issuer | Issuance, safeguarding, redemption and authoritative wallet balance |
| NECO Commons | Funded benefit allocation, eligibility, merchant redemption and impact reporting |
| Customer | Chooses payment method, approves payment and manages mandates and consents |

ONCE must not hold or pool customer money, initiate regulated payment services or issue stored value unless the operating entity is authorised for the activity or the model is explicitly approved by counsel and the competent regulator. Contract labels alone do not determine regulatory status.

## 3. API architecture

### 3.1 Components

1. Platform SDK and hosted checkout for web, iOS and Android.
2. ONCE API Gateway: OAuth 2.1/OIDC, tenant isolation, rate limits, schema validation and idempotency.
3. Payment Intent Service: immutable payment requests and validated state transitions.
4. Routing and Policy Engine: eligible rails based on market, currency, amount, merchant configuration, customer choice, risk and availability.
5. PSP Connector Layer: SEPA Instant, SEPA Direct Debit Core, regulated wallet/e-money and card fallback.
6. Mandate and Consent Service: mandate terms, evidence reference, status and cancellation.
7. Wallet Connector: issuer-authoritative balance and wallet payment requests.
8. NECO Entitlement Service: funded allocations, eligibility, expiry and redemption rules.
9. NECO Commons Ledger: double-entry accounting separate from payment and e-money ledgers.
10. Webhook and Event Service: signed, retryable events.
11. Reconciliation and Reporting: PSP settlement files, transaction matching, fees, refunds and exceptions.
12. Risk and Compliance Adapter: PSP-approved fraud, sanctions and compliance controls.

### 3.2 Flow

Customer App → Platform Backend → ONCE API Gateway → Payment Intent Service → Routing Engine → PSP Connector → licensed PSP/bank → SEPA or wallet rail.

The platform receives signed status events from ONCE and fulfils the order according to the confirmed payment state and method-specific risk policy. NECO entitlements are checked and journalled through a separate service.

### 3.3 Rail policy

- **SEPA Instant / bank payment:** suitable for customer-approved one-off payments where the PSP can confirm receipt quickly. A pending transfer is not proof of payment.
- **SEPA Direct Debit Core:** suitable for subscriptions, passes and recurring top-ups, subject to mandate, notice, return and dispute handling. A submitted debit is not the same as irrevocably settled funds.
- **Regulated wallet:** suitable for fast, frequent purchases such as scooter unlocks and small transactions. Wallet funds and balances must remain with the regulated issuer.
- **Card fallback:** retained for customers, markets and situations where bank or wallet rails are not suitable.
- **Open banking PIS:** optional where the PSP provides authorised payment initiation and the user completes the required bank authentication.

Never unlock a scooter or release an irreversible service merely because a bank transfer was initiated. Require PSP-confirmed payment, a pre-funded balance or a formally approved merchant risk arrangement. Do not silently switch a customer's selected rail.

## 4. API contract

Base path: /v1. JSON over HTTPS. Amounts are integer minor units; currencies use ISO 4217. Every mutating request requires an idempotency key.

| Endpoint | Purpose |
|---|---|
| POST /payment-intents | Create payment request for a platform order |
| GET /payment-intents/{id} | Retrieve status and next actions |
| POST /payment-intents/{id}/confirm | Confirm customer-approved method |
| POST /payment-intents/{id}/cancel | Cancel eligible pending/authorised intent |
| POST /mandates | Create a direct-debit mandate through PSP flow |
| GET /mandates/{id} | Retrieve mandate status and terms version |
| POST /mandates/{id}/cancel | Revoke/cancel mandate as supported |
| GET /wallets/{customer_ref}/balance | Read issuer-authoritative spendable balance |
| POST /wallet-transactions | Request wallet payment through issuer |
| GET /wallet-transactions/{id} | Retrieve wallet transaction state |
| GET /neco/entitlements | Retrieve funded customer entitlements |
| POST /neco/redemptions | Reserve/redeem eligible benefit |
| POST /refunds | Request full or partial refund |
| GET /settlements/{id} | Retrieve settlement batch status |
| GET /reports/reconciliation | Retrieve matched/unmatched settlement records |

Example payment intent:

    {
      "merchant_id": "merchant_demo",
      "customer_ref": "opaque_customer_123",
      "order_ref": "order_456",
      "amount": 1299,
      "currency": "EUR",
      "purpose": "mobility_ride",
      "allowed_methods": ["sepa_instant", "wallet", "card"],
      "neco": {
        "apply_eligible_benefit": true,
        "max_amount": 300,
        "programme_id": "neco_pilot"
      },
      "expires_at": "2026-11-05T15:05:00Z"
    }

Response returns intent ID, state, available customer actions, expiry, PSP reference where appropriate, and a short-lived client action token. Never return bank credentials, PSP secrets or unrestricted bearer tokens to a browser.

### 4.1 Normalised states

created; requires_customer_action; processing; authorised; confirmed; settled; partially_refunded; refunded; cancelled; failed; expired; disputed.

The platform must define fulfilment rules per rail. For asynchronous bank flows, remain processing until the PSP confirms receipt. Direct debit returns and disputes must be handled after initial submission.

### 4.2 Webhook events

payment_intent.created; payment_intent.requires_action; payment_intent.processing; payment_intent.confirmed; payment_intent.settled; payment_intent.failed; payment_intent.cancelled; mandate.activated; mandate.cancelled; wallet.balance_changed; refund.created; refund.succeeded; refund.failed; neco.entitlement.issued; neco.redemption.completed; settlement.reconciled.

Each event includes event_id, event_type, created_at, resource_id, resource_version, tenant_id and signature. Consumers must verify signatures, tolerate duplicates and out-of-order delivery, and retrieve the resource to resolve ambiguity.

## 5. Data models

- **Merchant:** merchant ID, legal entity, country, currencies, PSP accounts, settlement configuration, fee plan and webhook endpoints.
- **Customer reference:** opaque platform customer ID, PSP token, country and consent references. Avoid centralising identity profiles.
- **Payment intent:** amount, currency, order reference, purpose, allowed methods, selected rail, PSP reference, state, expiry, idempotency key and timestamps.
- **Payment attempt:** intent ID, connector, rail, provider reference, attempt number, status, failure code, fees and timestamps.
- **Mandate:** creditor ID, debtor token/reference, mandate ID, scheme, consent evidence reference, terms version, status and cancellation date.
- **Wallet reference:** issuer, external wallet token, currency, balance timestamp and spendable balance. The issuer remains authoritative.
- **NECO entitlement:** programme ID, pseudonymous recipient reference, nominal NECO units, committed funding source/value, eligibility, expiry, restrictions and status.
- **NECO journal:** double-entry debit/credit lines, programme, account, unit/currency, transaction reference, timestamp, approval and reversal links.
- **Refund:** original transaction, amount, reason, PSP reference and status.
- **Settlement batch:** PSP batch ID, gross, fees, net, currency, value date and matched/unmatched items.
- **Audit event:** actor, tenant, action, object, timestamp, correlation ID and before/after hashes.

Keep bank account details with the PSP wherever possible. Use tokens and masked display values. Do not place sensitive personal data in free-form metadata.

### 5.1 NECO integrated checkout model

Example: an order costs EUR 12.99. The customer pays EUR 9.99 through their selected method and applies EUR 3.00 of an eligible, funded NECO merchant benefit. ONCE reserves the entitlement; the PSP confirms the EUR 9.99 payment; the NECO programme records the EUR 3.00 redemption payable to the merchant. Merchant reimbursement is made by the agreed PSP and/or programme sponsor.

Each spendable benefit requires committed funding, named programme owner, eligibility rules, explicit unit and EUR valuation methodology, expiry, merchant acceptance terms, liability treatment and a reconcilable double-entry ledger. No unfunded NECO balance may be presented as money or a guaranteed euro claim.

If funding or legal treatment is not ready, the first release may show a clearly labelled non-cash eligibility preview while checkout remains entirely EUR.

## 6. PSP requirements

Select an EEA-authorised PSP or bank with a documented regulatory status and clear contracting model. Due diligence must cover:

1. **Authorisation and geography:** licence/register entry, permitted activities, passporting, supported countries, safeguarding and subcontractors.
2. **Rails:** SEPA Instant, SEPA Credit Transfer, SEPA Direct Debit Core, e-mandates, open-banking PIS, wallet/e-money and card acquiring.
3. **Platform capabilities:** marketplace onboarding, sub-merchants, split settlement, recurring payments, refunds, payouts and webhooks.
4. **Compliance:** SCA, AML/KYC allocation, sanctions, fraud, transaction monitoring, disputes and data protection.
5. **Technology:** sandbox, API documentation, idempotency, signed webhooks, status APIs, reconciliation files, latency, uptime, versioning and incident response.
6. **Economics:** setup, per-transaction and monthly fees, FX, returns, refunds, instant transfer, wallet issuance, safeguarding, payout and reserve costs.
7. **Operations:** support SLA, escalation, settlement calendar, resilience, business continuity and migration.
8. **Contract:** DPA, controller/processor roles, liability, indemnity, audit rights, security schedule, subcontractors, termination and data portability.

The PSP must confirm who is creditor for each direct debit, who owns the mandate, the platform's payee/agent role, and the legal funds flow. Do not assume a platform may pool or redistribute customer funds.

## 7. Security and privacy

- TLS 1.2+ in transit; encryption at rest using managed KMS/HSM-backed keys.
- OAuth 2.1/OIDC, short-lived scoped tokens, tenant isolation and least privilege.
- mTLS or signed requests for server-to-server calls.
- Idempotency, replay protection, request signing, timestamp windows and nonce handling.
- Signed webhooks, retries, dead-letter queue and replay-safe consumers.
- Secrets in a managed vault, never in browser/mobile bundles, logs or source control.
- Immutable audit logs and tamper-evident financial journals.
- SAST/DAST, dependency and container scanning, SBOM, code review, penetration test and independent security review before production.
- Incident response, breach notification, tested backups and disaster recovery.
- Separate payment, identity and NECO data; pseudonymous references; retention limits and data minimisation.
- Define controller/processor roles, DPA, DPIA where required, data-subject processes and international transfer controls.
- Never sell payment or behavioural data or use it for advertising.
- Biometrics and proof-of-human credentials are not required for ordinary access or payment. Provide accessible alternatives.

Operational controls: rail-specific availability/latency SLOs; circuit breakers; no silent fallback; daily settlement reconciliation; alerts for duplicate charges, stale processing, unmatched settlement, abnormal return rates and NECO imbalance; PSP-approved velocity limits and kill switches.

## 8. MVP and 90-day plan

**Pilot scope:** one platform, one EEA PSP, Germany/EUR, limited cohort, capped values. Choose the anchor platform based on sandbox readiness and willingness to share anonymised baseline metrics. Mobility is a strong first use case for frequent small transactions; subscription is a strong second use case for direct debit.

### MVP features
1. Merchant onboarding and credentials.
2. Payment intents, status and idempotency.
3. SEPA Instant or PSP-supported bank payment connector.
4. SEPA Direct Debit mandate lifecycle.
5. Regulated wallet connector and issuer-authoritative balance.
6. Existing card acquiring fallback.
7. NECO funded entitlement, reservation, redemption and separate journal.
8. Refunds, signed webhooks and daily reconciliation.
9. Merchant dashboard for status, fees and exceptions.
10. Customer method choice, mandate cancellation and payment history.

### Delivery
- **Days 1–15:** NDA and sandbox; funds-flow mapping; legal roles; payment baseline; pilot scope and data map.
- **Days 16–30:** API contract, threat model, PSP connector interface, tenant onboarding, intent service, idempotency and webhook verification. Confirm NECO funding and legal/accounting model or keep preview-only.
- **Days 31–60:** SEPA and mandate flows, wallet connector, card fallback, refunds, reconciliation, dashboard and NECO entitlement ledger.
- **Days 61–75:** invited beta; test pending payments, timeouts, duplicates, returns, refunds, mandate cancellation and PSP outages.
- **Days 76–90:** capped pilot after legal, PSP and security sign-off; compare cost, conversion, settlement and support outcomes.

### Acceptance criteria
- No duplicate financial movement under retry/replay testing.
- Every completed pilot payment reconciles to merchant order and PSP records.
- Every NECO redemption reconciles to a funded entitlement and programme journal.
- Refunds and mandate cancellations are traceable end-to-end.
- No unresolved critical/high security findings at launch.
- Customer sees method, status, timing and terms.
- Cost comparison includes PSP, platform, operational and loss costs, not only card scheme fees.

## 9. Commercial model

- Open-source API specification, SDK interfaces, reference connectors and conformance tests under a permissive licence, subject to final licence selection.
- Hosted ONCE orchestration: transparent monthly platform fee plus low fixed fee per successful transaction, with volume tiers.
- PSP and issuer charges passed through transparently or bundled with a separately disclosed margin.
- Optional enterprise services: integration, SLA, support, compliance evidence pack and custom connectors.
- NECO programme administration charged separately from payment processing; benefits and merchant reimbursement funded by committed sponsors.

Prefer fixed fees over percentage-of-payment fees where viable. Do not promise savings until a like-for-like pilot proves lower total cost. No data sale, hidden FX margin or forced wallet lock-in.

## 10. Partner strategy

### Partner sequence
1. Anchor digital platform willing to run a controlled pilot and share anonymised baseline metrics.
2. EEA-authorised PSP/bank supporting SEPA Instant, SDD Core, wallet/e-money where applicable, card fallback, sandbox and settlement data.
3. NECO sponsors and merchant partners to fund and accept programme benefits.
4. Expand the same API to additional services.

### Platform routes
- **Voi / Dott:** propose a German mobility pilot with wallet/prepaid balance and PSP-confirmed instant payment for rides, plus optional direct debit for top-ups or passes. Existing local payment methods may already include direct debit; prove better total economics or customer experience rather than claim bank payments are absent.
- **Uber:** approach through the Uber Pay PSP/payment-partner route. Uber Pay currently describes its API as invite-only for PSPs and payment partners. Secure a qualified PSP partner first.
- **Spotify:** propose SEPA Direct Debit as an optional recurring method where local market and billing model permit. Spotify controls payment methods by country and offer; no integration is available until approved by Spotify.
- **Other platforms:** prioritise high-frequency services, subscriptions and marketplaces with measurable card costs and a clear use for bank/wallet choice.

### Partner outreach draft

**Subject: Pilot partnership — ONCE Open Payments for open, lower-cost digital payments**

We are developing ONCE Open Payments, an open integration layer that helps digital platforms offer SEPA bank payments, recurring direct debit and regulated wallet payments through one consistent API, with card fallback where needed.

We propose a limited EEA pilot with your platform and one regulated PSP. The pilot would integrate payment intents, customer-approved bank payments, recurring mandates where relevant, wallet balance, refunds, signed status webhooks and daily reconciliation. NECO can be integrated as a separately funded customer-benefit programme, with a separate ledger and transparent merchant reimbursement.

The objective is to measure whether this approach can reduce total payment costs, improve payment choice and strengthen customer experience without compromising conversion, settlement certainty, compliance or consumer protection.

We would welcome a technical discovery session covering your current payment mix, markets, integration requirements, baseline fees, settlement and refund flows, and the conditions for a sandbox pilot. No exclusivity or production commitment is requested at this stage.

**Requested next steps:** nominate a payments/engineering contact, share integration requirements under NDA, identify a suitable PSP route and agree a capped pilot with measurable success criteria.

## 11. Governance and launch gates

Before live money movement:
- Legal review of PSD2/PSD3 and PSR transition, e-money, payment initiation, safeguarding, agent/distributor status and consumer protection.
- PSP approval of each funds flow, platform role and NECO benefit arrangement.
- DPA, DPIA where required, data retention and incident-response agreements.
- Security review, penetration test, resilience plan and reconciliation sign-off.
- NECO funding commitment, programme terms, accounting treatment and audit trail.
- Clear disclosures for bank transfers, direct debit returns, wallet balances, refunds and benefit restrictions.

## 12. Decisions for pilot board

1. Anchor platform: Voi/Dott mobility, Uber ecosystem via PSP route, subscription service or another platform.
2. One PSP for all rails versus separate bank/PSP and e-money issuer.
3. NECO mode: funded euro-denominated merchant benefit first, or separately reviewed NECO unit with documented valuation and redemption framework.
4. Merchant-of-record and creditor model for each payment flow.
5. Quantified savings, conversion, reliability and adoption thresholds.

## 13. Standards and references

- EPC 2025 SEPA Direct Debit Core Rulebook v1.2, effective 30 September 2026: https://www.europeanpaymentscouncil.eu/document-library/rulebooks/2025-sepa-direct-debit-core-rulebook-version-1-2
- EPC SDD Core e-Mandate implementation guidelines: https://www.europeanpaymentscouncil.eu/document-library/implementation-guidelines/sepa-direct-debit-core-e-mandate-service-implementation-guidelines-2025-version-1
- EPC Verification of Payee scheme rulebook v1.1: https://www.europeanpaymentscouncil.eu/document-library/rulebooks/verification-payee-scheme-rulebook-0
- European Commission Instant Payments Regulation clarifications: https://finance.ec.europa.eu/publications/clarification-requirements-instant-payments-regulation_en
- ECB overview of Instant Payments Regulation requirements and deadlines: https://www.ecb.europa.eu/paym/retail/instant_payments/html/instant_payments_regulation.lv.html
- Uber Pay partner API: https://uberpay.uber.com/

Pin rulebook versions and PSP implementation profiles per connector. The EPC published SDD Core Rulebook v1.2 on 30 September 2026; the EPC Verification of Payee rulebook v1.1 became effective 20 September 2026. Confirm the supported versions directly with each PSP.

**ONCE Open Payments principle: one open integration, multiple regulated rails, customer choice, transparent costs and a separately funded common-good layer.**
