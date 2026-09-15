# Medusa B2B

<!-- #ZEROPS_EXTRACT_START:intro# -->
Medusa v2.21 B2B commerce backend, admin, and Next.js 15 App Router storefront in one monorepo for [Zerops](https://zerops.io). PostgreSQL, Valkey, and MinIO ship with the project; first deploy migrates, seeds a company with admin + employee spend limits, and writes a publishable key the storefront reads at runtime.
<!-- #ZEROPS_EXTRACT_END:intro# -->

⬇️ **Deploy on Zerops**

Import YAMLs for all six environments live in [`.zerops-recipe/`](.zerops-recipe/). Open a folder and paste `import.yaml` in the Zerops GUI, or sync this folder to `zeropsio/recipes` later for one-click catalog buttons.

## Repository layout

| Path | Service | Port | Package manager |
| --- | --- | --- | --- |
| [`backend/`](backend/) | Medusa API + admin (`zeropsSetup: medusa`) | `9000` | Yarn 1 |
| [`nextstore/`](nextstore/) | Next.js SSR B2B storefront (`zeropsSetup: nextstore`) | `8000` | Yarn 3 (Berry) |

Root [`zerops.yml`](zerops.yml) defines both setups. Each Zerops service clones this repo and runs the matching setup (`buildCommands` use `cd backend` / `cd nextstore`).

Based on the official [Medusa B2B starter](https://github.com/medusajs/b2b-starter) (company, quote, and approval modules).

## Requirements

- Node.js **24+** on Zerops (`nodejs@24`)
- **Backend:** Node `^20.19.0 || >=22.12.0`, Yarn 1.22, PostgreSQL, Valkey
- **Storefront:** Node `>=24.0.0`, Yarn 3.2.3 via Corepack

## Local development

### Backend

```bash
cd backend
cp .env.template .env
yarn
yarn dev
```

Admin: [http://localhost:9000/app](http://localhost:9000/app) — default `admin@example.com` / `supersecret` from `.env.template`.

### Storefront

```bash
cd nextstore
cp .env.template .env.local
yarn
yarn dev
```

Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000` and a publishable key from Admin → Settings → API Key Management.

Storefront: [http://localhost:8000](http://localhost:8000)

## Admin login (Zerops)

| Where | URL |
| --- | --- |
| Admin UI | `{API_URL}/app` on the **medusa** service (port 9000); `{API_URL}/` redirects there |
| Storefront | `{APP_URL}` on **nextstore** (port 8000) |

Credentials: **medusa** service secrets `SUPERADMIN_EMAIL` (default `admin@example.com`) and `SUPERADMIN_PASSWORD` (generated on import). Use those only on `{API_URL}/app` — they are not storefront customer logins.

Demo B2B actors from seed: company admin `company.admin@example.com` and buyer `company.buyer@example.com` (register those emails on the storefront to attach auth).

## Publishable key boot order

Deploy **medusa** before **nextstore** on first import (medusa has higher `priority`). Medusa init writes `CHANNEL_PUBLISHABLE_KEY`, then POSTs nextstore `/api/internal/reload-env` using project `RELOAD_SECRET` so the storefront process respawns with a resolved `pk_` key.

Need help? Join the [Zerops Discord](https://discord.gg/zeropsio).

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->
## Integration Guide

### 1. Monorepo `zerops.yml`

[`zerops.yml`](zerops.yml) at the repo root defines two setups:

- **`medusa`** — builds in `backend/`, deploys `.medusa/server` flattened to `/var/www`, port 9000, init migrate/seed/publishable key/reload nextstore
- **`nextstore`** — builds in `nextstore/` with Corepack + Yarn Berry, port 8000, readiness `/api/health`

Both services use `buildFromGit: https://github.com/zerops-recipe-apps/medusa-b2b`; Zerops selects the setup via `zeropsSetup` in [`.zerops-recipe/`](.zerops-recipe/).

Map project value store keys in each setup (`APP_URL`, `API_URL`) — never put framework keys on import **service** blocks.

### 2. Key configuration points

- Medusa: Redis modules when `REDIS_URL` is set, MinIO file module when `MINIO_*` is set, B2B company/quote/approval modules
- Nextstore: `NEXT_PUBLIC_*` baked at build time; instrumentation respawns until publishable key is `pk_*`
- Do not switch nextstore to `type: static` / `output: 'export'`
- Keep `admin.path` at `/app`
<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
