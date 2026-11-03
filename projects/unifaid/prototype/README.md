# UNIFAID Prototype 0.1

A runnable, single-user demonstrator for one shared conversation with multiple AI providers.

## What works

- Select OpenAI, Anthropic, Gemini and/or Mistral independently.
- Send one prompt and conversation history to selected providers in parallel.
- Explicit consent before any provider receives content.
- Server-side API keys; no keys are sent to the browser.
- Mock responses when a provider key is not configured.
- Provider/model attribution and per-provider error reporting.
- Export the conversation as JSON.
- No account, database, analytics or persistent server-side conversation storage.

## Run locally

Requires Node.js 20 or newer. No npm dependencies are required.

    cd projects/unifaid/prototype
    cp .env.example .env
    set -a; source .env; set +a
    npm start

Open http://127.0.0.1:8787. The shell commands above are for macOS/Linux. On Windows, set the environment variables manually in PowerShell.

Without API keys, the demo uses clearly labelled mock responses. With keys, it calls documented provider HTTPS APIs directly. API usage may incur charges. Model names are configurable because availability changes.

## Important limitations

This is a development demonstrator, not a hosted service or production-ready product. It has no user accounts, multi-user rooms, database, federation, attachments, streaming, end-to-end encryption, formal consent receipts, abuse controls, or independent security audit. Do not expose it to the public internet or submit confidential or sensitive information. Bind to localhost by default. Keep .env out of Git.

The prototype sends only to providers selected by the user, but selected providers process data under their own terms. The consent checkbox is an interface safeguard, not a legal guarantee or proof of downstream deletion.

## Architecture

Browser UI → local Node HTTP server → consent and input validation → selected provider adapters → provider APIs. Conversation history remains in browser memory until export or tab closure. Federation is intentionally deferred.

## Next engineering gates

1. Automated tests for schema validation, routing and provider error cases.
2. Provider-specific contract tests and API/model compatibility notes.
3. Authentication, rate limiting, secure secret storage and deployment hardening.
4. Threat model, privacy review and independent security assessment.
5. Formal event signing, retention/deletion semantics and federation profile.
