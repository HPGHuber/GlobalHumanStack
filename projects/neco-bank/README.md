# NECO.BANK — Open banking infrastructure for humanity

> Free to inspect, open to extend, designed to serve people.

NECO.BANK is an open-source reference implementation for a human-centred financial platform. It is designed to run as a domain application on the WODA Kernel and to integrate regulated financial services through licensed providers such as Swan.

**This repository is a software prototype and architecture project — not a bank, payment institution, e-money issuer, investment product, or live NECO issuance system.** No real money, customer funds, identity documents, or production credentials are handled by this initial scaffold.

## Product principles

- **Accessible:** simple, multilingual, mobile-first user journeys.
- **Open:** auditable source code, documented APIs, reproducible development.
- **Privacy-first:** collect the minimum data; never put personal or account data on a public ledger.
- **Interoperable:** standards-based identity and credentials, provider adapters, portable APIs.
- **Human-centred:** a future NECO basic-income module with transparent funding, eligibility, issuance and appeal rules.
- **Regulation-aware:** licensed providers remain responsible for regulated banking and payment services.

## Architecture at a glance

| Layer | Responsibility | Planned integration |
|---|---|---|
| WODA Kernel | Runtime, policy, identity context, permissions, service lifecycle | WODA Kernel adapter contract (to be agreed against the actual kernel SDK) |
| Identity | User authentication and verifiable claims | walt.id; IOTA Identity; optional World ID uniqueness proof |
| Banking | Payment accounts, cards, transactions, SEPA | Swan partner GraphQL API |
| NECO | Grant eligibility, allocation proposals, approvals, audit records | NECO rules engine; no token issuance in this scaffold |
| Trust | Integrity proofs and public audit commitments | IOTA anchoring adapter; hashes only, never personal data |
| Experience | Web and mobile user journeys | AYA / NECO wallet clients |

## Repository contents

- [Architecture](./ARCHITECTURE.md)
- [Swan integration boundary](./SWAN_INTEGRATION.md)
- [NECO basic-income design](./NECO_BASIC_INCOME.md)
- [Security and privacy](./SECURITY.md)
- [Roadmap](./ROADMAP.md)
- [OpenAPI draft](./openapi.yaml)
- [Swan GraphQL transport scaffold](./src/swan-graphql.ts)

## Swan integration

Swan documents a GraphQL partner API with separate Sandbox and Live endpoints. API calls must originate from a backend, not a browser. The initial transport scaffold is server-side only and deliberately does not implement onboarding, account creation, payment initiation, or card issuance until the partner schema, consent flow and approved use case are confirmed.

Set `SWAN_ENV=sandbox` and `SWAN_ACCESS_TOKEN` only in a local secret manager or untracked environment file. Never commit secrets. Sandbox and Live credentials are separate.

Official docs:
- https://docs.swan.io/api/overview/
- https://docs.swan.io/partnership/
- https://docs.swan.io/partnership/overview/rules-regulations/

## Local development

Requires Node.js 20+ and npm. From this directory:

```bash
npm install
npm run typecheck
```

The package type-checks the transport scaffold only. It does not connect to Swan or implement a complete banking service.

## Regulatory positioning

Where Swan is the regulated provider, NECO.BANK must not represent itself as the entity providing regulated payment accounts or payment services. Swan's partnership documentation states that partners in the EEA generally act as Swan Commercial Agents and that Swan retains specified regulated responsibilities. Product naming, disclosures, terms, data sharing notices, pricing and user journeys must be reviewed and approved with Swan before launch.

The public-facing product can be described as an **open-source financial access platform** or **NECO wallet experience** while the legal service provider is clearly disclosed. Do not market it as a bank until the relevant permissions and legal structure are in place.

## Status

**Prototype / design-partner stage.** No Swan partnership, WODA Kernel compatibility, IOTA deployment, walt.id production connection, NECO reserves, UBI funding, or regulatory approval is implied by this code.

## Contributing

Please open an issue before implementing provider-specific financial operations. Security-sensitive changes require review and tests. Never submit real personal data, production tokens, private keys or account information.
