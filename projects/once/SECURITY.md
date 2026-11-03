# ONCE Security Model

**Status:** Initial threat-model outline · Not a security audit

## Security objectives

- Confidentiality of private message content.
- Authentication of users and authorised devices.
- Integrity and replay resistance of protocol events.
- Forward secrecy and post-compromise recovery where supported by the chosen protocol.
- Safe membership changes in group conversations.
- User control over device enrolment, recovery and bridges.
- Minimise server-visible metadata and retention.

## Threat actors and assumptions

Consider malicious or compromised providers, malicious group members, stolen devices, network attackers, malicious bridges, phishing, spam and denial-of-service. A compromised endpoint can expose plaintext while messages are displayed; E2EE cannot protect a device already controlled by an attacker.

## Required controls

1. Use established cryptographic protocols and maintained libraries; no custom cipher.
2. Publish a precise cryptographic profile, protocol version and test vectors.
3. Verify device keys and membership changes; make safety-number or equivalent verification available.
4. Separate WebAuthn authentication from E2EE key material.
5. Encrypt attachments client-side before upload.
6. Keep plaintext out of logs, analytics, crash reports and push payloads.
7. Use secure transport, authenticated federation and replay protection.
8. Apply rate limits, spam controls and account/device abuse reporting without scanning private message content.
9. Support rapid device revocation and key rotation.
10. Conduct independent audits and a public vulnerability disclosure process before production launch.

## Bridge security labels

Every bridge must clearly display one of:
- **End-to-end encrypted across the connection:** only when independently verified by the protocol design.
- **Encrypted to the bridge:** bridge operator can access plaintext.
- **Transport encrypted only:** content may be visible to service operators.

A bridge must never inherit ONCE's E2EE badge merely because one side of the connection is encrypted.

## Metadata

E2EE does not hide all metadata. Servers may observe account identifiers, IP addresses, timing, message sizes, delivery patterns, room membership or push activity. ONCE should document each field, minimise retention, and evaluate privacy-preserving discovery and relay designs.

## Launch gate

No production launch until:
- threat model is reviewed publicly;
- cryptographic profile is fixed and implemented with reviewed libraries;
- external security audit is completed;
- recovery and multi-device flows are tested;
- federation and bridge boundaries are documented;
- incident response and vulnerability disclosure processes exist.

## Reporting

Do not publish exploitable vulnerabilities in public issues. A dedicated private security reporting channel and coordinated disclosure policy must be established before public beta.
