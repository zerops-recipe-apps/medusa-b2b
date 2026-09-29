# Medusa B2B (backend)

<!-- #ZEROPS_EXTRACT_START:intro# -->
Medusa v2.21 B2B backend and admin on [Zerops](https://zerops.io). Optional Next.js storefront: [medusa-b2b-nextstore](https://github.com/zerops-recipe-apps/medusa-b2b-nextstore). PostgreSQL, Valkey, Meilisearch, MinIO, and Mailpit (dev envs). Omit nextstore services in the recipe for backend-only.
<!-- #ZEROPS_EXTRACT_END:intro# -->

## Repos

| Repo | Role |
| --- | --- |
| **This repo** | Medusa API + admin (`backend/`, `zerops.yml` → `dev` / `prod`) |
| [medusa-b2b-nextstore](https://github.com/zerops-recipe-apps/medusa-b2b-nextstore) | Next.js 15 B2B storefront (separate Zerops service) |

[`nextstore/`](nextstore/) in this monorepo is for **local development** only (run against `API_URL`). Zerops never deploys it from here — that avoids git-connected `dev` workspaces dropping sibling folders.

Recipe imports: [`.zerops-recipe/`](.zerops-recipe/) and [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b).

## Local dev

```bash
cd backend && yarn dev    # :9000, admin /app
cd nextstore && yarn dev  # :8000 (optional)
```

## Why not Nx / Turbo?

Yarn 1 backend + Yarn 3 storefront, no shared packages — workspace tooling adds cost without cache wins.

## Setups vs services

Only **`dev`** and **`prod`** in `zerops.yml`. Hostnames like `medusastage` use **`zeropsSetup: prod`**.

<!-- #ZEROPS_EXTRACT_START:faq# -->
## FAQ

**Mate / ZCP — Medusa only** — deploy `medusa` / `medusadev` / `medusastage`; skip `nextstore*`.

**Publishable key** — backend init runs `yarn reloadNextstoreEnv` when `RELOAD_SECRET` and split nextstore are deployed.

**Vault** — project `vault:` in import YAML; no `KEY: ${KEY}` passthrough in `zerops.yml`.
<!-- #ZEROPS_EXTRACT_END:faq# -->
