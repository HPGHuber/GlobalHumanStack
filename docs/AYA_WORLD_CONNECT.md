# AYA WORLD CONNECT — Production Architecture

**Product:** AYA WORLD CONNECT  
**Parent workspace:** GlobalHumanStack / AYA.ONE  
**Purpose:** A human-centred, open and interoperable identity + AI access layer.

## Product promise

A person can create and control an account, authenticate using a choice of supported methods, connect verifiable credentials when useful, and explicitly authorize AI agents or services to access narrowly scoped capabilities.

World ID is an optional proof/identity provider, not the universal identity of a person. A World ID result is not proof of legal name, age, residence, citizenship, or eligibility unless the exact verified claim and assurance level support that purpose.

## Architecture

- **Web application:** accessible, mobile-first PWA; localization; low-bandwidth mode.
- **Account and session service:** application-owned accounts, secure server-side sessions, recovery, consent, account deletion and audit history.
- **Authentication adapters:** World IdP OIDC (Authorization Code + PKCE), passkeys/WebAuthn, and other standards-based providers. No single-provider lock-in.
- **Identity wallet boundary:** walt.id / EUDI-compatible credential issuance, presentation and verification. Credentials remain under user control wherever technically possible.
- **Trust and DID adapters:** IOTA Identity and other DID methods behind replaceable interfaces. Do not write personal data to public ledgers.
- **AI gateway:** OpenAI API / other model providers behind a provider-neutral policy and budget layer. User data is minimized before model calls.
- **MCP gateway:** remote Streamable HTTP MCP with OAuth authorization, per-tool scopes, explicit approval for sensitive actions, audit logs, rate limits and revocation.
- **WODA:ONCE integration:** policy, connector registry, tenant boundaries and service orchestration. WODA is an adapter boundary, not a hidden superuser.
- **Data layer:** managed PostgreSQL for durable records, Redis-compatible store for ephemeral state/rate limits, object storage for encrypted files. Region and retention policies are configurable.
- **Operations:** centralized structured logs without tokens/PII, metrics, traces, alerting, backups, restore drills, incident response and vulnerability management.

## Security model

1. OIDC Authorization Code Flow with S256 PKCE, state, nonce, exact issuer/audience/redirect validation and maintained JWKS rotation.
2. World IdP issuer and discovery: `https://auth.world.org`; use its discovery document and registered client configuration. Sandbox and production credentials must never be mixed.
3. Server-side sessions use Secure, HttpOnly, SameSite cookies, rotation after authentication, CSRF protection and bounded lifetime.
4. Secrets exist only in managed secret storage / deployment environment. Never in browser bundles, Git, logs, prompts or issue trackers.
5. Every API route has authentication, authorization, schema validation, abuse controls and audit policy. Deny by default.
6. MCP tools are least-privilege. Read, write, payment, identity-linking and credential-issuance permissions are separate. Sensitive actions require explicit user approval.
7. No biometric templates, World ID proofs, raw tokens or credential contents in analytics or model context unless strictly necessary and explicitly consented.
8. Account export, correction, deletion, consent withdrawal and credential revocation have documented workflows.
9. Independent security review, penetration testing, threat modelling and privacy impact assessment are launch gates.
10. Multi-region scale is not assumed: load tests, capacity modelling, SLOs and failover tests are required before increasing traffic.

## Product boundaries

- World ID verifies only the claims supported by its current protocol and configured assurance class.
- A DID is an identifier, not proof that a legal identity is genuine.
- A verifiable credential is only as trustworthy as its issuer, schema, status mechanism and verification policy.
- AI output is not identity proof, legal advice, financial authorization or a substitute for human approval.
- NECO, bank accounts, payments, e-money, investment products and token issuance require separate licensed-provider and jurisdiction-specific legal structures. They are not activated by an identity login.

## Deployment environments

- **Local:** isolated development with synthetic fixtures only.
- **Preview:** sandbox identity clients and non-production data.
- **Production:** production credentials, approved privacy/security review, managed database, backups, monitoring, domain and operational owner.
- Never enable mock identity verification in production. Production startup must fail closed if any required adapter is in mock mode.

## First production release

The first real release is deliberately narrow:
1. Public landing page and account creation.
2. Real World IdP OIDC sign-in in a registered production environment, plus an alternative sign-in path.
3. Persistent account/session store and account deletion.
4. Read-only identity and connection dashboard.
5. Read-only MCP resource access for the account owner.
6. No payments, token issuance, legal voting, or autonomous high-impact actions in v1.

Expand only after reliability, security and user research gates pass.
