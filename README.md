# GlobalHumanStack

GlobalHumanStack is an early-stage monorepo for building a "proof you are alive" stack combining decentralized identity, economic coordination, and API integrations.

## Current repo status

This repository now includes a minimal Turbo monorepo scaffold so each core domain can evolve independently:

- `packages/contracts` – smart-contract layer.
- `packages/sdk` – developer-facing TypeScript SDK.
- `packages/api` – backend integration/API layer.

## Quick start

```bash
npm install
npm run build
npm test
```

## Why this structure

The repository originally declared workspaces but had no workspace folders configured. The scaffold added here makes the workspace graph executable and gives each domain a clear ownership boundary.

## Next improvement candidates

1. Replace placeholder scripts with real build/test tooling per package.
2. Add shared TypeScript config and linting conventions.
3. Define end-to-end integration tests across contracts, API, and SDK.
4. Add CI (GitHub Actions) to run `build` + `test` on each PR.
