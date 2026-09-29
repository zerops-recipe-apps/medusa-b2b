# backend (Medusa B2B)

Medusa v2.21 API + admin (Yarn **1.22**). Part of [medusa-b2b](../) — see root [`AGENTS.md`](../AGENTS.md).

- Hostnames: `medusa` / `medusastage` use `zeropsSetup: prod`; `medusadev` uses `dev`
- Port `9000`, admin at `/app`
- `prod` flattens `.medusa/server` to `/var/www`. `dev` deploys the repo root.
- Dev: `yarn dev` from this directory
