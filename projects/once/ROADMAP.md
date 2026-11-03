# ONCE Roadmap

**Status:** Proposed sequence · Dates are not commitments.

## Phase 0 — Foundation and design
- [x] Publish initial project vision and scope.
- [x] Define HeavenKey as the entry experience.
- [x] Document security boundaries and non-goals.
- [ ] Select protocol governance and maintainers.
- [ ] Confirm repository licensing and contributor policy.
- [ ] Open public architecture discussion.

## Phase 1 — HeavenKey proof of concept
- [ ] WebAuthn passkey registration and sign-in.
- [ ] Local ONCE identity and device-key creation.
- [ ] Device list, verification and revocation.
- [ ] Recovery UX prototype.
- [ ] Privacy review of onboarding and telemetry.

## Phase 2 — Secure ONCE-to-ONCE messaging
- [ ] Evaluate Matrix-native implementation versus a minimal ONCE profile.
- [ ] Select E2EE profile (including suitability of MLS for groups).
- [ ] Two clients exchange encrypted direct messages.
- [ ] Offline delivery, acknowledgements and multi-device sync.
- [ ] Conformance tests and interoperability fixtures.

## Phase 3 — Federation and portability
- [ ] Two independently operated test homeservers.
- [ ] Server authentication and federation policy.
- [ ] User export, provider migration and identity continuity.
- [ ] Abuse controls and privacy-preserving discovery.

## Phase 4 — External interoperability
- [ ] Email gateway prototype with clear security boundaries.
- [ ] Matrix interoperability profile.
- [ ] Evaluate XMPP and other open networks.
- [ ] Investigate official partner/API pathways for proprietary networks.
- [ ] Publish a bridge-by-bridge capability and security matrix.

## Phase 5 — Everyday communication
- [ ] Android and iOS clients.
- [ ] Web and desktop clients.
- [ ] Groups, channels, encrypted files and calls.
- [ ] Accessibility, localisation and low-bandwidth optimisation.

## Phase 6 — Web4 extensions (optional)
- [ ] WODA identity integration as an optional credential provider.
- [ ] Verifiable credentials and tickets.
- [ ] NECO payment requests through optional wallet integrations.
- [ ] AYA community and service integrations.

Web4 features must remain optional and must not compromise core messaging privacy or make a token, blockchain or external identity provider mandatory.

## Release criteria

A milestone is complete only when its code, documentation, tests, security review and known limitations are published. A demo is not a production service; a bridge is not universal interoperability; a protocol draft is not a ratified global standard.
