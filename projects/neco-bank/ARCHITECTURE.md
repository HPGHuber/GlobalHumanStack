# NECO.BANK — Architecture

## System context

NECO.BANK is an application and service layer intended to run on WODA. It is not a replacement for Linux, a banking core, or a regulated financial institution. WODA is treated as the host runtime and policy boundary; the concrete integration must be mapped to the real WODA Kernel SDK before claiming compatibility.

```text
AYA / NECO Web + Mobile clients
             |
       NECO API Gateway
             |
       WODA service runtime
             |
  +----------+-----------+----------------+
  |                      |                |
Identity service     Finance service   NECO grants service
  |                      |                |
walt.id / IOTA       Swan adapter      Rules + approvals
  |                      |                |
Credential store     Swan GraphQL      NECO ledger interface
                         |
                Licensed provider rails

IOTA trust anchoring receives hashes / public proofs only.
No personal data, IBANs, balances, transaction details, or credentials are written to public ledgers.
```

## Service boundaries

### Identity service
- Authenticate users with passkeys/OIDC.
- Request and verify Verifiable Credentials through walt.id-compatible interfaces.
- Use IOTA Identity only where an explicit DID/credential use case exists.
- Treat proof-of-personhood as an optional, purpose-limited signal, not a universal identity or creditworthiness score.
- Store only references and minimum claims in the NECO application database.

### Finance service
- Owns the provider adapter, never the bank's ledger.
- Calls Swan only from a protected server environment.
- Uses provider-issued identifiers and idempotency controls.
- Separates read operations from mutations.
- Requires explicit user confirmation and provider-required SCA/consent for sensitive actions.
- Never stores card PAN, CVV, online-banking passwords or provider secrets.

### NECO grants service
- Computes eligibility and proposed allocations from published programme rules.
- Separates eligibility decisions, funding availability, approvals and actual payment execution.
- Maintains an auditable decision record and appeal route.
- Does not mint, promise, or distribute redeemable NECO value unless a legally reviewed issuer, reserve/funding model, redemption policy and technical design exist.

### Trust service
- Can anchor cryptographic hashes of public programme reports or batch proofs.
- Does not publish personal data or linkable transaction metadata.
- Anchoring is optional; the canonical financial record remains with the regulated provider and the programme's controlled records.

## Data classification

| Data | Storage | Public chain |
|---|---|---|
| Public programme rules | Version-controlled repository | May anchor content hash |
| User identity documents | Regulated provider / approved encrypted vault | Never |
| IBAN, balances, transactions | Provider systems; minimum references in app | Never |
| Credential payloads | User wallet / approved credential service | Never |
| Aggregate distribution totals | Audited reporting store | Hash or aggregate only, after privacy review |
| Secrets and signing keys | Secret manager / HSM | Never |

## Resilience and operational controls

- Provider outage must not create synthetic balances or duplicate payments.
- Webhooks must be authenticated, replay-protected and idempotent.
- Financial state transitions must be reconciled against provider records.
- All privileged operations require least-privilege service identities.
- Audit logs must avoid secrets and unnecessary personal data.
- Use immutable, versioned programme rules for each grant cycle.
