# Medusa B2B

<!-- #ZEROPS_EXTRACT_START:intro# -->
Medusa v2.21 B2B backend and admin on [Zerops](https://zerops.io), with an optional Next.js storefront in a separate app repo. PostgreSQL, Valkey, Meilisearch, MinIO, and Mailpit (dev envs) ship with the recipe. Import **medusa** services only for a pure backend; add **nextstore** services for the full shop.
<!-- #ZEROPS_EXTRACT_END:intro# -->

## App repos (split for composability)

| Repo | Role | Setups |
| --- | --- | --- |
| [medusa-b2b](https://github.com/zerops-recipe-apps/medusa-b2b) | Backend (`backend/`) | `dev`, `prod` |
| [medusa-b2b-nextstore](https://github.com/zerops-recipe-apps/medusa-b2b-nextstore) | Next.js storefront | `dev`, `prod` |

`nextstore/` in this repo is for **local compose** only. Zerops recipes use the standalone nextstore repo so git-connected `dev` workspaces deploy `./` without deleting sibling folders.

Recipe imports: [`.zerops-recipe/`](.zerops-recipe/) and [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b).

## Why not Nx / Turbo?

Backend is Yarn 1 (classic); storefront is Yarn 3 Berry. There is no shared package graph — only two deployable apps. Workspace tooling would add ceremony without build-cache or task-graph wins.

## Setups vs services

Only **`dev`** and **`prod`** exist in `zerops.yml`. A **stage** hostname (`medusastage`) is still built with **`zeropsSetup: prod`**.

## Local development

```bash
cd backend && yarn dev          # :9000, admin /app
cd nextstore && yarn dev        # :8000 (optional)
```

<!-- #ZEROPS_EXTRACT_START:faq# -->
## FAQ

**Mate / ZCP needs Medusa without a storefront** — import the recipe and remove (or do not deploy) `nextstore` / `nextstoredev` / `nextstorestage` services. Backend `buildFromGit` stays `medusa-b2b`.

**Search** — `search` is Meilisearch 1.10; backend indexes when `MEILISEARCH_*` is set.

**Mail** — Mailpit on Agent / Remote / Local (`SMTP_HOST=mailpit`). Stage / prod use your SMTP relay via vault.

**Vault** — project `vault:` in import.yaml; no `STRIPE_API_KEY: ${STRIPE_API_KEY}` passthrough in `zerops.yml`.

**Publishable key** — backend init writes `CHANNEL_PUBLISHABLE_KEY` and POSTs nextstore `/api/internal/reload-env` when `RELOAD_SECRET` is set.

**Admin** — `{API_URL}/app`. Superadmin in medusa service `vault`.

Community FAQ with Medusa maintainers is still TBD.
<!-- #ZEROPS_EXTRACT_END:faq# -->

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->
## Integration Guide

- Backend `prod`: flattened `.medusa/server`. Backend `dev`: `deployFiles: ./` (full monorepo for SSH).
- Storefront repo: root-level Next app; `dev` deploys `./`, `prod` deploys `.next` + `node_modules`.
- No `run.start` — platform default start commands.
<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
