# Production Readiness — GlobalHumanStack / AYA WORLD CONNECT

## Current repository assessment

The existing repository is a useful engineering foundation, but it is **not production-ready**. Its README and configuration describe mock-by-default adapters. The current API includes simulated World ID fallbacks, a permissive CORS setup, in-memory/demo-oriented flows and no demonstrated durable account/session database or production operations stack.

Do not present the current main-branch application as a live identity service. Do not accept real user identity data or use it for consequential decisions.

## Blockers before real public users

- [ ] Replace simulated World ID acceptance with World IdP OIDC; validate ID tokens and issuer/audience/nonce using maintained OIDC libraries.
- [ ] Register separate World IdP sandbox and production clients; configure exact HTTPS callbacks and production credentials outside Git.
- [ ] Remove all `simulate: true` fallbacks from production paths and add a fail-closed production startup check.
- [ ] Implement durable accounts, session storage, account linking, recovery, consent, export and deletion.
- [ ] Replace wildcard CORS with an explicit origin allowlist; add CSRF protection, request validation, body limits and distributed rate limiting.
- [ ] Add tenant isolation, object-level authorization and audit events for every sensitive operation.
- [ ] Add credential issuer trust configuration, status/revocation checks and key rotation; no production signing keys in source control.
- [ ] Add MCP OAuth authorization, per-tool scopes, user consent, explicit approval for write actions, replay protection and revocation.
- [ ] Add privacy notice, terms, controller/processor mapping, retention schedule, DPIA where required, DPA/vendor review and incident process.
- [ ] Add managed database, encrypted backups, tested restore, observability, alerts, SLOs and dependency/security scanning.
- [ ] Complete independent threat model, code review, penetration test and remediation of critical/high findings.
- [ ] Load test the target release and document capacity, cost ceilings, abuse controls and disaster recovery.

## Release gates

### Gate A — Engineering preview
Synthetic accounts only; sandbox World IdP; no real identity or financial data. Automated tests and security checks must pass.

### Gate B — Limited real-user pilot
Production OIDC client, durable storage, privacy/legal documents, support channel, incident response, monitoring, backups and security review. Small, invited cohort with explicit feedback and rollback plan.

### Gate C — General availability
Independent penetration test; no unresolved critical/high vulnerabilities; tested recovery; documented SLOs; accessibility and localization review; operational on-call; capacity and cost tests.

### Gate D — International scale
Jurisdiction-by-jurisdiction privacy and regulatory assessment, regional data controls, localization, multi-region reliability, external audits, abuse response and sustainable support. “Billions” is a long-term scale objective, not a launch claim.

## Secrets and external prerequisites

Never send secrets in this repository or in chat. Configure them directly in the relevant provider's secret manager.

Required to activate the first live identity environment:
- World Developer Portal organization/app registration and production OIDC client.
- Exact production callback URL and approved redirect URIs.
- Vercel project ownership, connected Git repository and production domain.
- Managed PostgreSQL and session/rate-limit storage.
- Production OpenAI API or AI Gateway credentials and explicit budget limits if AI chat is enabled.
- Privacy/legal owner and support/incident contact.

Use the sandbox environment until World confirms production registration and the app has passed the launch gates.

## Definition of “working”

A feature is not considered live merely because a page loads. It must pass an end-to-end test against the real provider, persist data safely, enforce permissions, recover from failure, emit operational telemetry, and have a documented support and rollback path.
