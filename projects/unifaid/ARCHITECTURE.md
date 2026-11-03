# UNIFAID Architecture Draft

## 1. Logical components

1. **Client:** user interface for conversations, provider selection, consent and export.
2. **Orchestrator:** routes authorized requests to selected adapters; records provenance and errors.
3. **Protocol core:** validates event envelopes and capability negotiation.
4. **Provider adapters:** translate to documented provider APIs.
5. **Context store:** stores only user-authorized conversation data, with configurable retention.
6. **Identity and access:** authenticates users, agents and servers; authorizes each action.
7. **Federation gateway:** future component for exchanging permitted events between independent homeservers.
8. **Observability:** privacy-aware logs, metrics and traces.

## 2. MVP topology

The first prototype should use a single user-controlled orchestration service. Federation is deliberately deferred until event semantics, authentication and authorization are reviewed.

Client → UNIFAID API → Policy check → Provider adapter(s) → Provider API  
                                             ↘ Event store and export

Parallel provider calls are optional. The user must explicitly choose which providers receive the prompt and context.

## 3. Provider connectors

Initial connector targets:
- OpenAI documented API
- Google Gemini documented API
- Anthropic Messages API
- Mistral documented API

Provider APIs change. Each connector must pin supported API versions where possible, use secrets from a secure secret manager, document model availability and include contract tests. The project is independent and is not endorsed by these vendors.

## 4. Federation direction

Matrix demonstrates that decentralized rooms and event federation can work at scale. UNIFAID may reuse Matrix transport or provide a bridge, but should not copy Matrix semantics without analysis. A federation profile must define:
- server discovery and identity;
- event signing and verification;
- authorization and room membership;
- replay protection and event ordering;
- redaction, deletion and retention behaviour;
- abuse reporting, rate limits and server reputation;
- cross-server data disclosure and consent.

## 5. Identity

Identity is modular. Users may authenticate with conventional accounts, passkeys, OpenID Connect, or compatible decentralized identifiers. A DID or proof-of-personhood credential is optional and must never be required for basic access. World ID, W3C credentials or IOTA identity can be explored as optional integrations, not protocol dependencies.

## 6. Agent interoperability

MCP can provide a tool integration boundary; agent-to-agent protocols can be bridged where appropriate. UNIFAID remains responsible for the conversation envelope, consent and provenance. Tool access is opt-in, scoped, logged and revocable.

## 7. Data flow and trust boundaries

The orchestrator, storage provider, each AI provider and each federated server are distinct trust domains. The UI must show recipients before sending sensitive content. Do not describe a system as end-to-end encrypted if the orchestrator or provider can read plaintext.

## 8. Deployment profiles

- **Local:** single-user, local model and local storage.
- **Private:** organization-operated server with policy controls.
- **Hosted:** managed service with transparent data handling.
- **Federated:** independent servers exchanging authorized events, after the federation profile is standardized.

## 9. Security review gate

No public federation launch until an independent threat model, security review, abuse model and interoperability test suite are complete.
