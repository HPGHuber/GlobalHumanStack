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
