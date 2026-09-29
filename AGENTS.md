# medusa-b2b

Medusa v2.21 B2B API + admin at repo root. Storefront: [medusa-b2b-frontend](https://github.com/zerops-recipe-apps/medusa-b2b-frontend).

- Zerops: `dev` / `prod` in [`zerops.yml`](zerops.yml); port 9000, admin `/app`
- Imports: [`.zerops-recipe/`](.zerops-recipe/) and [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b)
- Pin `@medusajs/*` to **2.21.0**
- Project vault; no `KEY: ${KEY}` passthrough in `zerops.yml`

```bash
yarn dev   # :9000
```
