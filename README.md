# Medusa B2B

<!-- #ZEROPS_EXTRACT_START:intro# -->
Medusa v2.21 B2B backend and admin on [Zerops](https://zerops.io). PostgreSQL, Valkey, Meilisearch, and MinIO ship with the project; Agent / Remote / Local also get Mailpit. First deploy migrates, seeds a company with admin + employee spend limits, and writes a publishable key. The Next.js storefront stays in-repo for local compose — this recipe does not deploy it, so Mate can spin up Medusa on its own.
<!-- #ZEROPS_EXTRACT_END:intro# -->

⬇️ **Deploy on Zerops**

Import YAMLs live in [`.zerops-recipe/`](.zerops-recipe/). Canonical catalog copy: [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b).

## Repository layout

| Path | Role | Port |
| --- | --- | --- |
| [`backend/`](backend/) | Medusa API + admin. Zerops setups: `dev` (workspace) and `prod`. | `9000` |
| [`nextstore/`](nextstore/) | Official B2B storefront. **Not imported.** Run locally against `{API_URL}`. | `8000` |

Root [`zerops.yml`](zerops.yml) has only those two setups. A stage **service** (`medusastage`) is built with the `prod` setup.

Based on the official [Medusa B2B starter](https://github.com/medusajs/b2b-starter) (company, quote, and approval modules).

## Requirements

- Node.js **24+** on Zerops (`nodejs@24`)
- **Backend:** Node `^20.19.0 || >=22.12.0`, Yarn 1.22, PostgreSQL, Valkey
- **Storefront (local):** Node `>=24.0.0`, Yarn 3.2.3 via Corepack

## Local development

### Backend

```bash
cd backend
cp .env.template .env
yarn
yarn dev
```

Admin: [http://localhost:9000/app](http://localhost:9000/app) — default `admin@example.com` / `supersecret` from `.env.template`.

### Storefront (optional compose)

```bash
cd nextstore
cp .env.template .env.local
yarn
yarn dev
```

Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to the Medusa origin and a publishable key from Admin → Settings → API Key Management.

## Admin login (Zerops)

Admin UI is `{API_URL}/app` on **medusa** / **medusastage** (port 9000). `{API_URL}/` redirects there.

Credentials: service vault `SUPERADMIN_EMAIL` (default `admin@example.com`) and `SUPERADMIN_PASSWORD` (generated on import).

Demo B2B actors from seed: `company.admin@example.com` and `company.buyer@example.com`.

<!-- #ZEROPS_EXTRACT_START:faq# -->
## FAQ

**Why is there no Next.js service?** This recipe is the Medusa backend Mate should find. The storefront lives in `nextstore/` for local compose. A storefront recipe can attach later.

**Why no Nx / Turbo?** Backend is Yarn 1; storefront is Yarn 3 Berry. There is no shared package graph.

**dev vs prod vs stage?** Setups are only `dev` and `prod`. `medusadev` uses `dev` (full repo, no start). `medusastage` / `medusa` use `prod`. Stage is a hostname, not a setup.

**Where is search?** `search` is Meilisearch 1.10. The backend indexes products when `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY` are set.

**Where is mail?** Agent / Remote / Local import Mailpit (`SMTP_HOST=mailpit`, port `1025`). Stage / production leave SMTP vault empty for a real relay.

**Why does `dev` deploy `./`?** A git-connected workspace that only flattened `backend/` would drop `nextstore/` on the next push.

**Do I map `STRIPE_API_KEY: ${STRIPE_API_KEY}`?** No. Project vault keys inject as-is. `zerops.yml` only remaps (`API_URL` → `BACKEND_URL`) or computes (`DATABASE_URL`, `MEILISEARCH_HOST`).

**Admin path?** Keep `admin.path` at `/app`.
<!-- #ZEROPS_EXTRACT_END:faq# -->

Need help? Join the [Zerops Discord](https://discord.gg/zeropsio). Community FAQ for Medusa-on-Zerops is still open — starter maintainers welcome.

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->
## Integration Guide

### 1. `zerops.yml` setups

- **`prod`** — compiled Medusa (`.medusa/server` flattened). Used by `medusa` and `medusastage`.
- **`dev`** — idle workspace, `deployFiles: ./`, no `start`. Used by `medusadev`. SSH in and `cd backend && yarn dev`.

Import files use **vault** (not `envVariables` / `envSecrets`).

### 2. Key configuration points

- Redis modules when `REDIS_URL` is set; MinIO when `MINIO_*` is set; Meilisearch when `MEILISEARCH_*` is set; SMTP when `SMTP_HOST` is set
- B2B company / quote / approval modules always load
- Keep `admin.path` at `/app`
<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
