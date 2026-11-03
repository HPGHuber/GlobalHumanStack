# UNIFAID
## The Universal Open Standard for AI Communication

> **In service of a peaceful, loving, connected and abundant humanity and Planet Earth.**

**One humanity. Many intelligences. Open communication. Shared responsibility.**

UNIFAID is a proposed open, provider-neutral protocol and community initiative for interoperable AI messages, conversations, agents and services. It aims to let people use different AI systems in one coherent conversation while retaining control over identity, context, consent and data.

UNIFAID is inspired by the interoperability and federation principles of projects such as Matrix. It is not a chatbot, a single AI model, a religion, or a claim of endorsement by any AI provider or faith community.

## Why UNIFAID?

AI systems are developing in separate platforms with different APIs, message formats, tools and memory models. People should not have to surrender portability or control simply to collaborate across providers.

UNIFAID proposes a common communication layer:
- **Interoperability:** a shared envelope for messages, events, attachments, tool calls and responses.
- **Federation:** independent servers can exchange authorized conversation events.
- **Human agency:** people decide which providers receive which content.
- **Portability:** conversations can be exported in documented, machine-readable formats.
- **Pluralism:** competing models and open-source systems can participate without one provider controlling the protocol.
- **Transparency:** participants, model identifiers, tool activity and provenance are represented explicitly.

## Ethical north star

UNIFAID is guided by a simple commitment:

> **In service of a peaceful, loving, connected and abundant humanity and Planet Earth.**

The project draws inspiration from universal ethical ideals found across many philosophical, spiritual and humanist traditions, including unity of humanity, unity in diversity, independent investigation of truth, harmony between science and ethics, education, and service.

The comparison to a “Bahá’í spirit for code and AI” is an aspiration for universal ethical purpose—not a claim that UNIFAID is a religion, speaks for the Bahá’í Faith, or has its endorsement. Participation is open regardless of belief, identity, nationality or worldview.

## Initial protocol modules

| Module | Scope |
|---|---|
| UNIFAID-CORE | Protocol versioning, capabilities, common terminology |
| UNIFAID-ID | Optional identifiers for people, services and agents |
| UNIFAID-MSG | Provider-neutral message and event envelope |
| UNIFAID-ROOM | Conversation membership, threads and event ordering |
| UNIFAID-CONTEXT | User-controlled context exchange and portability |
| UNIFAID-FED | Server discovery and server-to-server federation |
| UNIFAID-POLICY | Consent, permissions, retention and data-sharing declarations |
| UNIFAID-TOOLS | Tool invocation, results and agent hand-offs |

These are proposed modules, not finalized or ratified standards.

## Architecture principles

1. **Protocol before product:** define interoperable semantics before building a proprietary platform.
2. **Adapters, not forced uniformity:** provider-specific features remain explicit extensions; the common layer must not erase meaningful differences.
3. **No implied provider endorsement:** integrations use documented, authorized APIs and user-approved credentials.
4. **Least privilege:** only the minimum authorized context is sent to each recipient.
5. **Security by design:** authentication, authorization, replay protection, provenance and threat modelling are mandatory design work.
6. **Federation is optional:** private deployments and centralized MVP deployments remain possible.
7. **Open governance:** specifications, change history and conformance tests are public.

## Repository map

- [Charter](CHARTER.md) — ethical purpose and commitments.
- [Protocol draft](SPEC.md) — initial message and event model.
- [Architecture](ARCHITECTURE.md) — components, federation and provider adapters.
- [Governance](GOVERNANCE.md) — proposed community process.
- [Roadmap](ROADMAP.md) — staged development plan.
- [JSON Schema](schemas/message.schema.json) — illustrative v0.1 message envelope.

## Current status

**Exploratory draft / pre-standardization.** This repository is a starting point for public discussion. It is not production-ready, security-audited, ratified, or endorsed by OpenAI, Google, Anthropic, Mistral, Matrix.org, the Bahá’í community, or any standards body.

## How to contribute

Please open an issue for design proposals, interoperability requirements, threat models, use cases or implementation ideas. Pull requests should explain compatibility impact and include tests or examples where applicable. See [Governance](GOVERNANCE.md).

## License

The specification and documentation are intended to be published under **CC BY 4.0**. The reference software, when added, should use a permissive OSI-approved software license such as Apache-2.0. See [LICENSE-DOCS](LICENSE-DOCS.md).

---
*UNIFAID — One humanity. Many intelligences. In service of life.*


## Working prototype

A first single-user demonstrator is now available in [prototype/](prototype/README.md). It supports provider selection, explicit data-sharing consent, parallel requests, provider/model attribution, mock mode and JSON export. It is designed to run locally with Node.js 20+ and no npm dependencies.

- [Run the prototype](prototype/README.md)
- [Web Summit founder speech](WEBSUMMIT-SPEECH.md)
- [Web Summit speaker brief and demo plan](WEBSUMMIT-BRIEF.md)

The demonstrator is an early development build, not a hosted or production service. Live API use requires the user's own provider credentials. Federation, multi-user rooms and production security remain future milestones.
