# BioID BWS 3 Adapter — implementation scaffold

**Status:** Backend integration scaffold; live BioID calls disabled pending tenant credentials and end-to-end verification.

## Why BWS 3
Use BioID Web Services 3. BioID documents BWS 3 REST and gRPC APIs, JWT authentication, and liveness scores. Classic BWS reaches end of life on 31 December 2026. Official documentation: https://developer.bioid.com/

## Security boundary
- Browser obtains explicit, purpose-specific consent and captures only the required liveness material.
- Browser sends capture material to our own authenticated backend over TLS.
- Backend creates short-lived BioID JWTs using the BWS client ID and signing key stored in a secret manager.
- Backend calls only the documented BWS 3 endpoint and validates the response.
- Browser receives a minimal outcome and correlation ID, not provider secrets or raw biometric templates.
- Never log images, video, secrets, JWTs, biometric templates or full provider payloads.
- Retention is disabled by default in our application; vendor-side retention and processing must be confirmed contractually.
- Provide an equally usable non-biometric alternative.

## Configuration
Required server-only environment variables (names are placeholders until a BioID tenant is provisioned):
- BIOID_BWS_HOST
- BIOID_BWS_CLIENT_ID
- BIOID_BWS_SIGNING_KEY
- BIOID_BWS_API_MODE (rest or grpc)

Do not place any of these values in Vite/Next public variables, browser code, repository secrets committed to source, or client-side bundles. Use the deployment platform's secret manager.

## API contract for our application
- POST /api/biometrics/bioid/session — authenticated user creates a purpose-bound, expiring session and receives a random session ID.
- POST /api/biometrics/bioid/liveness — backend accepts a session-bound capture payload, calls BWS 3, and returns {status: "passed"|"failed"|"review"|"unavailable", transactionId}.
- DELETE /api/biometrics/bioid/session/:id — revoke session and delete locally held capture material.
- GET /api/biometrics/bioid/status — reports configuration readiness only; never reveals secrets.

## Important implementation gate
The exact REST request/response schema, JWT claims, signing procedure, endpoint, image/video requirements and retention behaviour must be taken from the current BioID BWS 3 reference and a provisioned test tenant. Do not infer these from Classic BWS or invent endpoint paths. Until this is verified, the adapter returns unavailable and the UI must not claim a successful biometric verification.

## Test plan
- no consent -> no capture;
- missing/invalid session -> reject;
- expired session -> reject;
- invalid JWT / unavailable provider -> fail closed and offer non-biometric alternative;
- spoof / replay / low-quality / timeout -> no pass;
- secrets absent from browser bundle, logs and error messages;
- raw capture not retained after request completion;
- accessibility and non-biometric fallback tested;
- independent security and privacy review before production.

## Official references
- BWS 3 developer docs: https://developer.bioid.com/
- BWS 3 intro / trial credentials: https://developer.bioid.com/bws/intro
- BWS 3 gRPC reference: https://developer.bioid.com/bws/grpc
- BioID BWS 3 scripts: https://github.com/BioID-GmbH/BWSScripting
- BioID REST/gRPC forwarder sample: https://github.com/BioID-GmbH/BWSClient-RestGrpc-CSharp
