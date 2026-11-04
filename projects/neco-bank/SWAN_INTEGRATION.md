# Swan integration boundary

## Official integration model

Swan exposes a partner GraphQL API. The documented environments are:

- Sandbox: `https://api.swan.io/sandbox-partner/graphql`
- Live: `https://api.swan.io/live-partner/graphql`
- OAuth server: `https://oauth.swan.io/oauth2`

Swan explicitly states that its API is backend-only; browser-originated API calls are not allowed. Sandbox and Live environments are separate and their credentials/tokens are not interchangeable.

References:
- API overview: https://docs.swan.io/api/overview/
- Partnership: https://docs.swan.io/partnership/
- Rules and regulations: https://docs.swan.io/partnership/overview/rules-regulations/
- Accounts: https://docs.swan.io/topics/accounts/

## Legal / operating boundary

Swan states that it is the licensed e-money institution and that EEA partners outside France generally operate as Commercial Agents. Swan retains responsibility for specified regulated operations and sensitive actions. Its rules also restrict partners from presenting themselves as banks/neobanks or selling payment services in their own right.

Before any public launch:
1. Obtain Swan's written partner approval and product scope.
2. Agree the contracting entity, commercial-agent status, disclosures and permitted product wording.
3. Confirm the exact GraphQL schema, OAuth grants, scopes, consent/SCA flows, webhook signing and test fixtures.
4. Have counsel review PSD2/PSD3, EMD2/EMD3 transition, AML, GDPR, consumer protection, outsourcing and safeguarding implications as applicable.
5. Complete Swan sandbox certification and operational readiness before Live access.

## Implementation rules

- All Swan calls run in a server-side service.
- Never put access tokens or client secrets in frontend bundles.
- Never log Authorization headers, raw credentials, full IBANs or card data.
- Validate GraphQL operations against the current Swan schema; do not guess mutation names or fields.
- Treat all provider responses as untrusted input and validate at the boundary.
- Sensitive operations require the provider's consent and SCA flow.
- Implement webhook signature verification, replay protection, deduplication and reconciliation before enabling asynchronous events.
- Use separate secret stores and deployments for Sandbox and Live.

## Current code

`src/swan-graphql.ts` is a minimal server-side HTTP transport. It is not an OAuth implementation, SDK, banking ledger, or complete Swan adapter. It intentionally exposes no generic public endpoint and does not define unverified GraphQL operations.

## Environment variables

`SWAN_ENV=sandbox` selects the Sandbox endpoint. `SWAN_ENV=live` selects Live and must be blocked in non-production environments. `SWAN_ACCESS_TOKEN` is a server-side short-lived token supplied through a secret manager. The current scaffold does not acquire tokens.
