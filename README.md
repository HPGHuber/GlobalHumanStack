# GlobalHumanStack — AYA.ONE Identity Stack

> **All is Sacred. All is Unique. All is Connected.**

A self-sovereign **Identity Stack for every Human, Plant and Animal**, composing three
open ecosystems:

| Layer | System | Role |
|-------|--------|------|
| Proof of personhood | **World ID** | Proves *"one unique human"* via ZK proof — the uniqueness gate for humans. |
| Anchor / ledger of trust | **IOTA Identity** (`did:iota`) | Feeless registry for DIDs + revocation, for People, Things **and** beings. |
| Credential machinery | **walt.id** | Issues / holds / verifies W3C Verifiable Credentials (OID4VC, SD-JWT). |
| Fan identity | **FIFA Collect** | Links a fan's public collectibles profile to mint a **WorldPass** — *a FREEDENTITY for every fan*. |

Every entity is modelled identically as a **DID subject holding a "Living Being
Credential"**. What differs is key custody and how the root identity is bootstrapped
(World ID for humans; guardian/steward attestation + uniqueness signal for plants and
animals). See [`docs/architecture.md`](docs/architecture.md) for the full design.

### WorldPass — a FREEDENTITY for every fan

The same primitives power a fan onboarding flow integrated with
[**FIFA Collect**](https://collect.fifa.com): a unique human football fan proves
personhood with World ID, links their FIFA Collect handle, and is issued a
**`WorldPassCredential`** — a verifiable, selectively-disclosable fan passport scoped to a
competition (one human = one WorldPass). The FIFA Collect adapter is mock-by-default and
targets a configurable gateway when `FIFA_COLLECT_API_URL` is set.

## Monorepo layout

```
packages/contracts  On-chain anchoring interface (IOTA MoveVM) — did:iota + status list
packages/sdk        Identity Orchestrator: DID, credentials, World ID, walt.id adapters
packages/api        Express HTTP API (onboard / present / verify / revoke)
apps/web            Minimal React UI demonstrating the full loop
docs/architecture.md  Design document
projects/neco-bank  Open-source NECO.BANK architecture and Swan adapter scaffold
```

## Mock-by-default

With an empty environment the stack runs **fully offline** — no IOTA network, no walt.id
server, no World ID app required — so the demo and CI work with zero secrets. Set the
variables in [`.env.example`](.env.example) to switch any layer to its live adapter.

## Quick start

```bash
npm install
npm run build          # builds contracts → sdk → api → web
npm start              # API on http://localhost:8787 (also serves the built web UI)
```

Or run everything in watch mode (API on :8787, Vite UI on :5173 with an `/api` proxy):

```bash
npm run dev
```

Then open the UI, **Onboard a Human** (gated by a simulated World ID proof), **Register a
Plant or Animal** under that human guardian, **Claim a WorldPass** for a football fan, then
**Verify**, **Present** (with selective disclosure) and **Revoke** credentials.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Type-check + build all packages and the web UI. |
| `npm test` | Run the SDK test suite (issue → verify → revoke → Sybil resistance). |
| `npm run lint` | ESLint across the workspace. |
| `npm start` | Start the API (serves the built web UI if present). |
| `npm run dev` | Watch mode for SDK + API + web. |

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/config` | Adapter modes (live/mock) + trust-anchor DID. |
| `POST /api/onboard/human` | Verify a World ID proof and issue a human identity. |
| `POST /api/onboard/being` | Register a plant/animal under a guardian. |
| `POST /api/onboard/fan` | Verify a fan's World ID + link FIFA Collect, issue a WorldPass. |
| `POST /api/present` | Produce a selective-disclosure presentation. |
| `POST /api/verify` | Verify a credential (signature, issuer trust, revocation). |
| `POST /api/revoke` | Revoke a credential. |
| `GET /api/registry` | List all issued identities. |

## Status

This is a **prototype**: DIDs use the real `did:iota` format and credentials are real
EdDSA-signed W3C VC-JWTs, but DID anchoring, the walt.id OID4VC flow, and live World ID
verification are wired behind adapters that activate when their env vars are set. See the
roadmap in [`docs/architecture.md`](docs/architecture.md).

## NECO.BANK — Open-source finance for humanity

NECO.BANK is the financial-services project within this stack. It is designed for the WODA
Kernel and combines a regulated-provider adapter boundary (Swan), verifiable identity
(walt.id / IOTA), privacy-preserving trust proofs and a future NECO community-grants engine.

- [NECO.BANK project overview](projects/neco-bank/README.md)
- [System architecture](projects/neco-bank/ARCHITECTURE.md)
- [Swan integration and regulatory boundary](projects/neco-bank/SWAN_INTEGRATION.md)
- [NECO basic-income programme design](projects/neco-bank/NECO_BASIC_INCOME.md)
- [Security baseline](projects/neco-bank/SECURITY.md)
- [Roadmap](projects/neco-bank/ROADMAP.md)
- [Draft OpenAPI](projects/neco-bank/openapi.yaml)

NECO.BANK is currently a prototype/specification and server-side transport scaffold. It is
not a bank or live payment service, and no Swan partnership, WODA compatibility, funding,
or regulatory approval is implied.

## ONCE — Open Global Communication

This repository also hosts the initial public ONCE protocol and HeavenKey entry design:

- [ONCE project overview](projects/once/README.md)
- [Protocol scope](projects/once/SPEC.md)
- [System architecture](projects/once/ARCHITECTURE.md)
- [HeavenKey entry model](projects/once/HEAVENKEY.md)
- [Security model](projects/once/SECURITY.md)
- [Roadmap](projects/once/ROADMAP.md)

ONCE is currently a public architecture/specification draft, not a production messaging service. Contributions and security review are welcome.

## UNIFAID — Universal AI Communication

An open, provider-neutral protocol proposal for interoperable AI messages, conversations and federation, guided by the commitment **“In service of a peaceful, loving, connected and abundant humanity and Planet Earth.”** See [`projects/unifaid/`](projects/unifaid/README.md) for the Charter, protocol draft, architecture, governance and roadmap. UNIFAID is an exploratory draft, not a ratified standard or an endorsed product of any AI provider.
