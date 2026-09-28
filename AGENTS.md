# medusa-b2b

Medusa v2.21 B2B backend + Next.js 15 storefront monorepo on Zerops (`nodejs@24`). App repo for the in-repo [`.zerops-recipe/`](.zerops-recipe/) imports.

## Layout

| Path | `zeropsSetup` | Port | Notes |
| --- | --- | --- | --- |
| `backend/` | `medusa` / `medusa-stage` / `medusa-dev` | 9000 | Yarn 1, admin at `/app`; `*-dev` is idle (`zsc noop`) |
| `nextstore/` | `nextstore` / `nextstore-stage` / `nextstore-dev` | 8000 | Yarn 3 Berry; `*-dev` is idle |

Root [`zerops.yml`](zerops.yml) — both setups. Import YAMLs live in [`.zerops-recipe/`](.zerops-recipe/) (six environments). Canonical catalog copy can move to `zeropsio/recipes` later.

## Siblings (Zerops project)

- `db` — PostgreSQL 17 — `DATABASE_URL`
- `redis` — Valkey 7.2 — `REDIS_URL`, cache/events/workflow/locking URLs
- `storage` — MinIO — `MINIO_*` / `OBJECT_STORAGE_API_URL`
- `nextstore` — this repo, `nextstore` setup

## Dev commands

```bash
cd backend && yarn dev    # http://localhost:9000
cd nextstore && yarn dev    # http://localhost:8000
```

## Zerops ops

All platform operations go through Zerops MCP (`zcp`) tools — not raw `zcli`.

## Notes

- Pin `@medusajs/*` to **2.21.0** in `backend/`. Pin `@medusajs/js-sdk` / `@medusajs/types` to **2.21.0** in `nextstore/`.
- Project `RELOAD_SECRET` — medusa init POSTs nextstore `/api/internal/reload-env` after syncing publishable key.
- Value store: `APP_URL` / `API_URL` in import; map to framework keys in `zerops.yml` only.
- Do not commit `.env`, `.env.local`, `.medusa/`, `.next/`.
- Keep `admin.path` at `/app`. `GET /` redirects there.
