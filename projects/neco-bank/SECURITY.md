# Security and privacy baseline

## Threat model

NECO.BANK handles high-impact financial and identity workflows. Threats include account takeover, phishing, credential theft, insider misuse, provider impersonation, webhook replay, payment duplication, supply-chain compromise, privacy leakage and denial of service.

## Mandatory controls before pilot

- Passkey or equivalent phishing-resistant authentication where supported.
- Step-up authentication and provider SCA for sensitive operations.
- Server-side secret management; no secrets in source control, client code, logs or telemetry.
- Least-privilege service identities and short-lived credentials.
- TLS in transit and encryption at rest with managed key rotation.
- Signed, replay-protected webhooks and idempotent payment commands.
- Rate limits, abuse monitoring and secure session management.
- Data minimization, retention limits, export and deletion workflows.
- Dependency scanning, SBOM, reproducible builds and protected main branch.
- Independent penetration test and security review before any real-user pilot.
- Incident response plan, breach notification workflow and tested backups.

## Never do

- Never store card CVV or online-banking passwords.
- Never expose Swan tokens to a browser or mobile client.
- Never write personal data, IBANs, balances or transaction histories to IOTA or another public ledger.
- Never let a smart contract or AI agent autonomously release real funds.
- Never treat a World ID / uniqueness proof as proof of legal identity, creditworthiness or entitlement.
- Never use mock data in production or production data in development.

## Reporting

Until a dedicated security contact is published, report suspected vulnerabilities privately to the repository maintainers rather than opening a public issue with exploit details. Do not include personal or financial data in reports.
