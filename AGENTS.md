# medusa-b2b

Medusa v2.21 B2B backend + in-repo Next.js storefront (local compose only) on Zerops (`nodejs@24`). Recipe imports are Medusa-only so Mate can spin up Medusa without a frontend.

## Layout

| Path | `zeropsSetup` | Port | Notes |
| --- | --- | --- | --- |
| `backend/` | `dev` / `prod` | 9000 | Yarn 1, admin at `/app`. `dev` deploys `./`, no start. |
| `nextstore/` | — | 8000 | Not imported. Local `yarn dev` against `{API_URL}`. |

Root [`zerops.yml`](zerops.yml) — only `dev` and `prod`. Stage is a **service hostname** (`medusastage`) built with `prod`. Canonical imports: [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b). Copy: [`.zerops-recipe/`](.zerops-recipe/).

## Siblings (Zerops project)

- `db` — PostgreSQL 17
- `redis` — Valkey 7.2
- `search` — Meilisearch 1.10
- `storage` — MinIO
- `mailpit` — SMTP catcher on Agent / Remote / Local
- `medusa` / `medusastage` — this repo, `prod` setup
- `medusadev` — this repo, `dev` setup (Agent / Remote)

## Dev commands

```bash
cd backend && yarn dev    # http://localhost:9000
cd nextstore && yarn dev  # optional local storefront
```

## Zerops ops

All platform operations go through Zerops MCP (`zcp`) tools — not raw `zcli`.

## Notes

- Pin `@medusajs/*` to **2.21.0**.
- Project **vault** for secrets and URLs. Do not write `STRIPE_API_KEY: ${STRIPE_API_KEY}` in `zerops.yml`.
- Do not add Turbo / Nx — Yarn 1 + Yarn 3 Berry, no shared graph.
- Do not commit `.env`, `.env.local`, `.medusa/`, `.next/`.
- Keep `admin.path` at `/app`.
