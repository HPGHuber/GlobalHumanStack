# NECO.BANK roadmap

## Phase 0 — Foundation (current)
- [x] Establish project scope and system boundaries.
- [x] Document Swan's backend-only API boundary and partner constraints.
- [x] Define WODA, identity, banking, NECO and IOTA service boundaries.
- [x] Add a minimal server-side GraphQL transport scaffold.
- [ ] Confirm the actual WODA Kernel SDK and service lifecycle contract.
- [ ] Confirm legal entity and Swan partner sponsor.

## Phase 1 — Sandbox proof of concept
- [ ] Obtain Swan partner access and approved sandbox project.
- [ ] Implement OAuth token lifecycle using Swan's current official flow.
- [ ] Generate typed GraphQL operations from Swan's current schema.
- [ ] Implement onboarding and consent/SCA journey.
- [ ] Implement account/transaction read views.
- [ ] Implement payment initiation only after provider approval, idempotency and webhook handling.
- [ ] Add mocked provider contract tests and sandbox integration tests.

## Phase 2 — Identity and wallet
- [ ] Confirm walt.id deployment and supported OID4VC profile.
- [ ] Integrate IOTA Identity only for a defined DID/credential use case.
- [ ] Add user-controlled credential presentation and revocation checks.
- [ ] Complete privacy impact assessment and data-protection review.

## Phase 3 — NECO community pilot
- [ ] Select one bounded pilot community and programme sponsor.
- [ ] Publish eligibility, funding, allocation, appeals and tax treatment.
- [ ] Add grant calculation, approval, payment and reconciliation workflow.
- [ ] Independent audit and public aggregate reporting.

## Phase 4 — Production readiness
- [ ] Swan approval and Live certification.
- [ ] Legal, compliance, risk, safeguarding and outsourcing review.
- [ ] Penetration test, disaster recovery exercise and incident response rehearsal.
- [ ] Operational support, complaints handling and financial reconciliation.

## Release gates

No real customer funds or live payments until Swan approval, legal review, security sign-off, tested reconciliation and incident response are complete. No NECO token issuance until the issuer, legal classification, funding/reserve model and user disclosures are independently reviewed.
