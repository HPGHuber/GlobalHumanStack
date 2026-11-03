# UNIFAID Roadmap

This roadmap is directional, not a promise of dates or completed integrations.

## Stage 0 — Public draft
- Publish charter, architecture and protocol draft.
- Invite technical, ethical, accessibility and security review.
- Confirm project name, licensing and governance.

## Stage 1 — Message interoperability
- Finalize event envelope and JSON Schema.
- Define capability negotiation and error model.
- Build validation libraries and test vectors.
- Demonstrate import/export of a multi-provider conversation.

## Stage 2 — Provider adapter prototype
- Implement adapters for OpenAI, Gemini, Claude and Mistral using authorized documented APIs.
- Add secure credential handling.
- Add user-visible recipient consent and provider attribution.
- Test text, tool calls, streaming and error handling.

## Stage 3 — Multi-agent conversation
- Add parallel responses, explicit hand-offs and attributed synthesis.
- Preserve disagreement and source provenance.
- Add cost and usage transparency.

## Stage 4 — Privacy and security hardening
- Complete threat model and independent review.
- Add signed event integrity, key management and abuse controls.
- Verify export, deletion and retention behaviour.
- Publish conformance and security test suites.

## Stage 5 — Federation research
- Evaluate Matrix bridging/reuse and alternative federation designs.
- Specify server identity, authorization, event ordering and redaction.
- Run a limited test federation only after security review.

## Stage 6 — Open ecosystem
- SDKs, reference client and reference server.
- Community governance and stable protocol release.
- Accessibility, localization and low-bandwidth profiles.

## Success measures
- Independent implementations pass the same conformance tests.
- Users can export conversations without losing authorship and provenance.
- Provider data-sharing is visible and consent-driven.
- No provider or organization controls the protocol.
- Security issues are handled transparently and responsibly.
