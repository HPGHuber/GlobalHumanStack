# WORLD PASS × electronica 2026

Standalone showcase app in the GlobalHumanStack monorepo.

## Local preview
Serve this directory as static files and route `/api/world/*` to Vercel Functions (or deploy this directory as the Vercel project root).

## World ID production configuration
Register a confidential OIDC client in https://developer.world.org and configure the exact callback URL:
`https://<deployment-domain>/api/world/callback`

Set these Vercel environment variables (Production and Preview as appropriate):
- `WORLD_CLIENT_ID` — World IdP client ID
- `WORLD_CLIENT_SECRET` — secret for the registered client authentication method
- `WORLD_CLIENT_AUTH_METHOD` — `client_secret_basic` (default) or `client_secret_post`, matching the World registration
- `WORLD_REDIRECT_URI` — exact callback URL above
- `WORLD_SESSION_SECRET` — random secret of at least 32 bytes
- `WORLD_ISSUER` — optional; defaults to `https://auth.world.org`

The authorization request asks for `openid` and Orb assurance via `acr_values=https://world.org/oidc/acr/orb`. The callback validates state, nonce, PKCE, issuer, audience, expiry, RS256 signature/JWKS, and the Orb `acr` before issuing a short-lived HttpOnly session cookie.

## Important integration boundaries
- No live credentials are committed. Until the World client is configured, the UI reports that live authentication is unavailable.
- The existing electronica ticket shop remains the checkout authority. The public ticket prices and shop link are displayed, but no ticket API or order linking is claimed. Automated ticket issuance/linking requires Messe München's written technical approval, API documentation, and test credentials.
- The foyer Orb is a proposed physical setup only. Orb hardware, operator, placement, network/power, safety, accessibility, privacy signage and venue approval must be agreed with World and Messe München.
- World ID proves a unique human/credential class, not civil identity, name, nationality or age. The app does not collect or store biometric data.
- This is an independent showcase concept, not an announced partnership or an operational Messe deployment.

## ORB ENERGY ROUTER — TechNovator × FUNKSTROM

The showcase now presents the Orb as a proposed modular energy node:
- Inputs: grid power, optional PV and optional battery storage
- Power core: AC/DC or DC/DC conversion, protected DC bus, metering, thermal monitoring and load management
- Outputs: wired USB-C/DC and a wireless transmitter with a compatible receiver
- Network: node status and energy telemetry exposed through an authenticated device API; no real-time telemetry is claimed in the static showcase
- Identity: World ID can authenticate a human session; device authorization and energy permissions are separate credentials, not inferred from proof-of-humanity

TechNovator's wireless-power technology is a candidate transmitter/receiver subsystem. Vendor performance claims (including up to 95% efficiency) are not treated as independently verified. The exact FUNKSTROM implementation, receiver compatibility, power level, range, efficiency and safety envelope require joint engineering validation. The Orb is an energy router, not an energy source; it routes energy from grid/PV/storage.

### Required engineering gates
1. Bench-test transmitter/receiver compatibility and measure end-to-end wall-to-load efficiency at defined distance, alignment, orientation and simultaneous receiver count.
2. Measure thermal rise, EMC emissions/immunity, human exposure, foreign-object response, fault behavior and emergency shutdown.
3. Define certified power envelopes and receiver authentication/handshake; wireless output remains disabled by default until the approved receiver is detected.
4. Complete electrical safety, CE/RED/EMC and applicable product compliance assessments with competent test labs before public operation.
5. Integrate energy metering, device authorization, consent, audit logs and role-based control via WODA:ONCE APIs.

The electronica 2026 fair ran November 10–13, 2026 and closed at 15:00 on November 13. The Orb Energy Router is therefore a digital showcase / follow-on demonstrator concept, not a claim that hardware was installed or operated at the 2026 fair.
