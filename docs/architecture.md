# AYA.ONE — A Universal Identity Stack for Every Living Being

> **All is Sacred. All is Unique. All is Connected.**
>
> AYA.ONE is a self-sovereign identity (SSI) layer that gives every Human, Plant,
> and Animal a verifiable, privacy-preserving, interoperable digital identity —
> built on open standards (W3C DID + Verifiable Credentials) and three
> complementary open ecosystems: **IOTA Identity**, **walt.id**, and **World ID**.

---

## 1. Why these three, and what each one is for

The three projects are not competitors — they solve different layers of the same
problem. AYA.ONE composes them.

| Layer | System | Role in AYA.ONE | Key primitives |
|-------|--------|-----------------|----------------|
| **Anchor / Ledger of trust** | **IOTA Identity** (`did:iota`) | Decentralized, feeless registry for DIDs and revocation lists. Anchors identities of People, Organizations, **and Things/Objects** (devices, sensors, biotopes). | `did:iota` DID method on the IOTA ledger, DID Documents as Move objects, revocation lists, W3C VCs. |
| **Issuance / Holding / Verification** | **walt.id** (open-source identity & wallet toolkit) | The credential machinery: Issuer API, Verifier API, and Wallet API speaking OID4VCI / OID4VP. Produces and checks W3C VCs, SD-JWT-VCs and mDLs. White-label wallet apps. | Issuer API, Verifier API 2 (OID4VP 1.0 + DCQL), Wallet API, SD-JWT selective disclosure. |
| **Proof of Personhood (Humans only)** | **World ID** (`@worldcoin/idkit`) | Sybil-resistance gate: proves *"a unique human"* via zero-knowledge proof, **without** revealing personal data. Used to bootstrap a Human's root identity exactly once. | IDKit (request proof), World App (ZK proof generation), `POST /api/v4/verify/{rp_id}` (proof verification), per-action **nullifier**. |

**Mental model:**

```
World ID  ──►  proves "this is ONE unique human"        (uniqueness gate)
IOTA      ──►  anchors a permanent did:iota for the being (the unique key)
walt.id   ──►  issues / stores / verifies credentials     (what is true about it)
```

---

## 2. Design principles (mapped from the manifesto)

- **All is Unique → one being, one root DID.** Each entity gets exactly one
  cryptographically unique `did:iota`. For humans, uniqueness is enforced by a
  World ID nullifier so nobody can mint two root identities.
- **All is Sacred → privacy & dignity by default.** No raw biometrics, no
  PII on-chain. Only DIDs, public keys, and revocation status are anchored.
  Personal attributes live in the holder's wallet and are shared via
  **selective disclosure** (SD-JWT). World ID returns *proof of human*, never
  identity data.
- **All is Connected → relationships are first-class.** Beings can hold
  credentials *about each other*: a guardian↔ward link, a tree↔forest membership,
  an animal↔caretaker attestation. Edges form a verifiable "web of life" graph.

---

## 3. The identity model: a "Living Being Identity" (LBI)

Every entity — regardless of kingdom — is modeled identically as a **DID subject**
that holds a **Living Being Credential (LBC)**. What differs is *who controls the
keys* and *how the root identity is bootstrapped*.

| Kingdom | DID subject | Key custody / controller | Bootstrap / uniqueness anchor | Example attributes |
|---------|-------------|--------------------------|-------------------------------|--------------------|
| **Human** 🧍 | `did:iota:…` | Self-custodied in a walt.id wallet (the person). | **World ID proof of human** → nullifier ensures one root DID per person. | given name, jurisdiction, age-over-N (disclosed selectively) |
| **Animal** 🐾 | `did:iota:…` | **Guardian model** — a human/organization DID is the controller; optional device (collar/ear-tag/microchip) DID co-signs. | Issuer attestation + optional biometric hash (muzzle/iris) or microchip ID as a uniqueness signal. | species, taxon, birth date, microchip ID, guardian DID |
| **Plant** 🌱 | `did:iota:…` | **Steward model** — a steward/organization DID controls; optional IoT sensor (an IOTA "Identity of Things" device) co-signs telemetry. | Issuer attestation + geo-anchor (planted location) + optional genetic/spectral fingerprint. | species, taxon, geolocation, planted date, biotope/forest DID |

All three share the same credential envelope so verifiers handle them uniformly.

### 3.1 Living Being Credential (W3C VC) — schema sketch

```jsonc
{
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    "https://aya.one/contexts/living-being/v1"
  ],
  "type": ["VerifiableCredential", "LivingBeingCredential"],
  "issuer": "did:iota:aya:0x…issuer",          // a recognized AYA Trust Anchor
  "validFrom": "2026-06-15T00:00:00Z",
  "credentialStatus": {                          // IOTA / walt.id revocation list
    "type": "BitstringStatusListEntry",
    "statusListCredential": "https://aya.one/status/1"
  },
  "credentialSubject": {
    "id": "did:iota:aya:0x…subject",            // the being's root DID
    "kingdom": "animalia",                       // animalia | plantae | human
    "taxon": { "scientificName": "Panthera leo", "rank": "species" },
    "uniqueness": {
      "method": "worldid-nullifier | microchip | geo-genetic-hash",
      "proofRef": "sha256:…"                     // hash only — never raw biometrics
    },
    "guardian": "did:iota:aya:0x…guardian",     // for animals/plants (optional for humans)
    "connectedTo": [                              // "All is Connected" — the web of life
      { "rel": "memberOf", "id": "did:iota:aya:0x…forest" }
    ]
  }
}
```

Sensitive fields (exact birth date, precise geolocation, guardian PII) are issued
as **SD-JWT** disclosures so the holder reveals only what a verifier needs (e.g.
"is endangered species: yes" without exposing GPS coordinates of the last rhino).

---

## 4. Architecture (logical)

```
                         ┌─────────────────────────────────────────────┐
                         │                AYA.ONE App                   │
                         │  (web/mobile: onboarding, wallet, verify UI)  │
                         └───────────────┬───────────────┬──────────────┘
                                         │               │
                ┌────────────────────────▼──┐        ┌───▼───────────────────────┐
   Humans only  │   World ID (IDKit)         │        │  walt.id Wallet API        │
   ┌──────────► │   proof of unique human    │        │  (hold LBCs, present VPs)  │
   │            └────────────┬───────────────┘        └───┬───────────────────────┘
   │                         │ proof                       │ OID4VCI / OID4VP
   │            ┌────────────▼───────────────┐   issue  ┌──▼───────────────────────┐
   │  AYA       │ AYA Identity Orchestrator   ├─────────►│  walt.id Issuer API       │
   │  backend   │ (this prototype's core)     │  verify  │  walt.id Verifier API     │
   │            └────────────┬───────────────┘◄─────────┴───────────────────────────┘
   │                         │ anchor DID + revocation
   │            ┌────────────▼───────────────┐
   └────────────┤   IOTA Identity (did:iota) │  ◄── IoT device DIDs (collars, sensors)
                │   DID registry + status     │      "Identity of Things"
                └────────────────────────────┘
```

### 4.1 Core flows

**A. Human onboarding (bootstrapping a root identity)**
1. User opens AYA.ONE → IDKit requests a *Proof of Human* (`proofOfHuman`).
2. World App returns a ZK proof; AYA backend forwards it to
   `POST https://developer.world.org/api/v4/verify/{rp_id}`.
3. On success, backend stores the **nullifier** (per-app/per-action) → guarantees
   one human = one AYA root identity (Sybil resistance).
4. Backend creates a `did:iota` for the human (controlled by the user's wallet key)
   and issues a `LivingBeingCredential{kingdom: human}` via walt.id Issuer API.
5. Credential lands in the user's walt.id wallet.

**B. Plant / Animal onboarding (guardian model)**
1. A verified human/organization (the **guardian/steward**, itself an AYA identity)
   registers the being.
2. AYA backend mints a `did:iota` for the being; guardian DID is recorded as
   controller; optional device DID (microchip / IoT sensor) is linked.
3. Issuer API issues a `LivingBeingCredential` with taxon, uniqueness signal
   (microchip / geo-genetic hash), and `guardian` edge.

**C. Verification (presentation)**
1. A verifier (vet, conservation registry, marketplace, border control) requests a
   presentation via the walt.id Verifier API (OID4VP + DCQL query).
2. Holder's wallet responds with a Verifiable Presentation, disclosing only the
   requested fields (SD-JWT selective disclosure).
3. Verifier checks signature, issuer trust, and **revocation status** against the
   IOTA-anchored status list.

---

## 5. Trust, governance & ethics

- **Trust Anchors:** a registry of recognized issuers (conservation orgs,
  veterinary authorities, governments, the AYA Foundation). Verifiers decide which
  anchors they trust — federated, not a single root of control.
- **Revocation & lifecycle:** death, transfer of guardianship, or correction →
  status-list update anchored via IOTA. DIDs are never silently deleted; history is
  auditable.
- **Privacy:** zero raw biometrics on-chain; World ID never exposes identity;
  SD-JWT minimizes disclosure; precise locations of endangered beings are
  protected behind predicate proofs ("in-protected-area: true").
- **Consent & dignity:** non-human beings cannot consent, so guardianship is
  explicit, time-bounded, and revocable; misuse is auditable.

---

## 6. Prototype scope (what we'll build next)

A small, **runnable** TypeScript monorepo, `aya-one`, that demonstrates the full
loop end-to-end and degrades gracefully when external services aren't configured:

- **`packages/core`** — the Identity Orchestrator:
  - `did:iota`-style DID creation + Ed25519 keys (real `@iota/identity-wasm` when
    `IOTA_NETWORK` is set; deterministic local DIDs otherwise).
  - Issue / verify **LivingBeingCredential** as W3C VC-JWT (walt.id-compatible
    envelope; can target a live walt.id Issuer/Verifier API via env, or sign
    locally for offline/CI runs).
  - World ID verification module → calls `/api/v4/verify/{rp_id}` when `WORLD_APP_ID`
    is set; uses a mock proof in dev so the demo runs offline.
  - Nullifier store (one-human-one-identity enforcement).
- **`apps/api`** — a small Express/Fastify API exposing `/onboard/human`,
  `/onboard/being`, `/verify`, `/status`.
- **`apps/web`** — a minimal UI: World ID button (humans), a "register a
  plant/animal" form (guardians), and a verifier panel showing selective disclosure.
- **Tests** for the issue→verify→revoke loop, runnable in CI with zero external
  credentials (mock adapters).

**Why mock-by-default:** live IOTA networks, a hosted walt.id stack, and a real
World ID app all require credentials/network that don't exist in CI. The prototype
is built around **adapters** so the exact same code talks to real services once
`.env` is filled in — proving the architecture without blocking on secrets.

### Open choices for the prototype (please confirm)
1. **Stack:** TypeScript monorepo (recommended — all three SDKs have first-class
   JS/TS support) vs. Kotlin (walt.id native) vs. Python.
2. **Surface:** API + minimal web UI (recommended) vs. CLI-only vs. API-only.
3. **External services:** mock-by-default with real-service adapters (recommended)
   vs. wire up a live walt.id Docker stack now.

---

## 7. Roadmap beyond the prototype

1. Real `did:iota` anchoring on IOTA testnet + revocation status lists.
2. Deploy walt.id Issuer/Verifier/Wallet via Docker compose; OID4VCI/OID4VP flows.
3. World ID 4.0 RP registration + production proof verification.
4. "Identity of Things" — bind IoT sensors/collars/microchips as co-signing device DIDs.
5. The "web of life" graph: relationship credentials and ecosystem/biotope memberships.
6. Mobile wallet (walt.id white-label) + offline verification.
```
