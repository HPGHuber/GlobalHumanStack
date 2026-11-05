# Global Recalibration WEB4 app

Open `index.html` in a modern browser. This is a front-end concept only. It does not provide live identity verification, payment processing, or an issued NECO balance.

## Included
- HeavenKey WebAuthn support check (not server registration or authentication).
- Helix ID consent-flow simulation (no wallet connection).
- BioID local camera preview (no upload or biometric analysis).
- ONCE demo alias.
- NECO wallet concept and a 36 NECO/day allocation simulator.

## BioID integration
See ../BIOID_BWS3_ADAPTER.md. The browser must never hold BWS credentials. Actual BWS 3 calls require a provisioned tenant, current API schema, server-side JWT signing, contract/privacy review and tests.

## NECO 36
The 36 NECO/day calculator is a design simulation, not an account balance, claim or payment promise. The unit has no fixed euro value in this prototype. See ../NECO_36_GLOBAL_BASIC_INCOME.md.
