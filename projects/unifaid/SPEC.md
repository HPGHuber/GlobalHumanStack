# UNIFAID Protocol Draft v0.1

**Status:** exploratory draft; not a stable or ratified standard.  
**Purpose:** provider-neutral message and conversation interchange for AI systems.

## 1. Design goals

- A common event envelope for human, assistant, agent and tool messages.
- Explicit provider/model attribution and capability declarations.
- Multi-modal content represented through typed parts and external references.
- Portable conversation identifiers, threading and causality.
- Explicit policy metadata for consent and data handling.
- Extensibility without silently changing core semantics.

Non-goals for v0.1: universal model equivalence, guaranteed cross-provider memory, universal end-to-end encryption, or bypassing provider access controls.

## 2. Transport and encoding

The initial interchange format is UTF-8 JSON. Implementations SHOULD support HTTPS APIs. A future federation profile MAY define persistent streams and signed event exchange. JSON Schema is provided as an illustrative validation aid.

## 3. Event envelope

A UNIFAID event has:
- `protocol`: protocol identifier and version.
- `event_id`: globally unique event identifier.
- `conversation_id`: conversation scope.
- `created_at`: RFC 3339 timestamp.
- `sender`: participant type and stable identifier.
- `recipient`: optional participant or provider destination.
- `kind`: message, tool_call, tool_result, membership, policy or other defined event.
- `content`: ordered typed parts.
- `reply_to`: optional parent event.
- `metadata`: namespaced extension data.
- `policy`: declarations describing intended sharing and retention.

## 4. Content parts

Core content types proposed for v0.1:
- `text`
- `image`
- `audio`
- `video`
- `file`
- `json`
- `tool_call`
- `tool_result`

Binary content SHOULD be referenced through authenticated, time-limited URLs or content-addressed storage. Implementations MUST NOT assume that a URL is safe to fetch. Fetching requires allowlists, size limits, content-type checks and protection against server-side request forgery.

## 5. Provider adapters

An adapter translates between UNIFAID events and a provider's documented API. Adapters MUST:
- disclose provider and model identifiers when known;
- preserve role, ordering and tool-call semantics where possible;
- report unsupported features rather than silently dropping them;
- avoid claiming that provider-specific state is portable if it is not;
- apply user-authorized context and tool permissions;
- handle rate limits, errors and partial/streaming responses explicitly.

No adapter may bypass authentication, usage restrictions, safety controls or contractual requirements of a provider.

## 6. Conversations and rooms

A conversation is an ordered event stream with participant membership and optional threads. Implementations SHOULD preserve original event IDs and timestamps during export. Federation ordering, conflict resolution, redaction and membership semantics require a separate normative profile before interoperable production use.

## 7. Context portability

Context is user-controlled data, not a hidden universal memory. Export formats SHOULD distinguish:
- user-authored messages;
- AI-generated messages;
- tool outputs;
- system/developer instructions where export is permitted;
- summaries generated for portability;
- provenance and uncertainty.

A receiving provider must not be assumed to honour another provider's internal system prompts or memory semantics.

## 8. Permissions and privacy

A policy object expresses the sender's intended sharing and retention constraints. It is not, by itself, a technical guarantee or legal contract. Implementations MUST enforce permissions within their own control and clearly disclose when downstream providers may retain or process submitted data under their own terms.

## 9. Security requirements

Before a stable release, the project must specify:
- authenticated participants and server identities;
- authorization checks for every event and attachment;
- signed events or equivalent integrity protection;
- replay and duplicate-event handling;
- key rotation and revocation;
- rate limiting and abuse prevention;
- secure attachment handling;
- audit logging with privacy minimization;
- threat models for malicious prompts, tool misuse and federation attacks.

Encryption at rest and in transit is required for production deployments. End-to-end encryption is a separate design profile; it cannot conceal prompts from an AI provider that must process them.

## 10. Versioning and extensions

The protocol version is explicit. Unknown optional fields SHOULD be ignored safely; unknown required features MUST cause a clear compatibility error. Extensions MUST use namespaced identifiers and document security implications.

## 11. Example

See [schemas/message.schema.json](schemas/message.schema.json) for a minimal illustrative envelope. Implementations should treat this draft as unstable and expect breaking changes before v1.0.

## 12. Open questions

- Federation transport and trust model.
- Event signatures and canonical JSON.
- Room membership, moderation and redaction.
- Multi-modal streaming and chunk ordering.
- Capability negotiation.
- Consent receipts and downstream policy reporting.
- Interoperation profiles for MCP and agent-to-agent protocols.
- Conformance suite and interoperability test vectors.
