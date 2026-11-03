# ONCE — Open Global Communication

> **One protocol. Many apps. One connected world.**
>
> Free to use. Free to build. Free to connect.

ONCE is an open interoperability initiative for human communication across messaging apps, email, devices and services. It aims to make people reachable without forcing everyone onto one vendor's app.

**HeavenKey is the proposed entry point:** a passkey-first, user-controlled identity and account-recovery experience. HeavenKey is not a central identity provider and must never become a mandatory single point of failure.

## Status

**Stage: public concept and architecture draft — not a production messaging service.**

This repository currently defines goals, boundaries, security requirements, an initial event envelope and a phased implementation plan. It does not yet provide a deployed server, audited cryptographic implementation, working bridges, or a production-ready mobile app. No compatibility with WhatsApp, Telegram, iMessage, WeChat or other proprietary networks is implied.

## Principles

1. **Open protocol, multiple clients.** Anyone can implement a compatible client or server.
2. **User choice.** Users may choose a provider, self-host, migrate, or use multiple clients.
3. **Private by default.** Private message content is end-to-end encrypted; servers route ciphertext and necessary metadata.
4. **No invented cryptography.** Use reviewed standards and maintained implementations; never design a cipher in ONCE.
5. **Interoperability with consent.** Bridges are explicit, visible, revocable and honest about security downgrades.
6. **No advertising surveillance.** No ads in private conversations, sale of message content, or cross-service behavioural profiling.
7. **Accessible and global.** Internationalisation, low-bandwidth support, assistive technology and open documentation are first-class.
8. **Open governance.** Protocol decisions are public, reviewable and independent of any one app vendor.

## Try the browser prototype

A zero-build local browser demo is available in [`demo/`](demo/README.md). It includes the ONCE interface, HeavenKey demo onboarding, and browser-local AES-GCM encrypted message storage. It is **not** a network messenger: WebAuthn is not server-verified, messages stay in this browser, and no federation or external bridges are active. Run it on localhost or HTTPS; see the [demo instructions](demo/README.md).

## Project documents

- [Protocol and scope](SPEC.md)
- [System architecture](ARCHITECTURE.md)
- [HeavenKey entry and identity model](HEAVENKEY.md)
- [Security model and threat assumptions](SECURITY.md)
- [Roadmap](ROADMAP.md)
- [Initial message envelope schema](schemas/message-envelope.schema.json)

## Proposed architecture at a glance

`HeavenKey` (passkey sign-in + locally controlled identity keys)
→ `ONCE Client` (chat, groups, mail view, calls)
→ `ONCE Protocol` (identity discovery, encrypted events, sync and federation)
→ `ONCE Homeservers / providers` (user-selectable, federated)
→ optional `Bridges` (external networks, subject to provider APIs and consent).

The initial implementation should evaluate and reuse existing open standards and implementations, especially Matrix for federation and room/event semantics, MLS (RFC 9420) for group key establishment, WebRTC for calls, SMTP/IMAP for email interoperability, and W3C DID/Verifiable Credentials where they add real value. ONCE must not fork these standards casually.

## HeavenKey: entry, not ownership

HeavenKey should make joining simple: create or use a passkey, create a local ONCE identity, verify devices, and optionally link recovery methods or external credentials. A passkey authenticates the user to a service; it does **not** automatically provide an exportable encryption key. Messaging keys must be generated and protected separately on the user's device, with a carefully designed recovery and multi-device protocol.

## First milestone

A small, auditable vertical slice:
- HeavenKey passkey sign-in demo (WebAuthn)
- local identity and device-key creation
- one-to-one ONCE test conversation using a reviewed E2EE implementation
- encrypted event sync between two self-hosted test homeservers
- transparent device verification and recovery UX
- no external proprietary bridges until the security model is independently reviewed.

## Contributing

Start with issues and design discussions. Security-sensitive changes require threat-model review and independent cryptographic review. See [ROADMAP.md](ROADMAP.md) for sequencing.

## License

The protocol and documentation are intended to be published under **Apache-2.0**. Implementations may use compatible open-source dependencies under their own licenses. This project is an initiative and does not claim endorsement by Matrix, IETF, W3C, or any messaging provider.
