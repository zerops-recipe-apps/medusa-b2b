# medusa-b2b

Medusa v2.21 B2B **backend** on Zerops (`nodejs@24`). Storefront: [medusa-b2b-nextstore](https://github.com/zerops-recipe-apps/medusa-b2b-nextstore).

## Layout

| Path | Zerops | Port |
| --- | --- | --- |
| `backend/` | `dev` / `prod` | 9000 |
| `nextstore/` | local compose only | 8000 |

Root [`zerops.yml`](zerops.yml) — only `dev` and `prod`. Imports: [`.zerops-recipe/`](.zerops-recipe/) and [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b).

## Notes

- Pin `@medusajs/*` to **2.21.0**.
- Project **vault**; no identity env passthrough in `zerops.yml`.
- No Turbo/Nx — two package managers, no shared graph.
- `dev` deploys `./`; `prod` flattens `backend/.medusa/server`.
