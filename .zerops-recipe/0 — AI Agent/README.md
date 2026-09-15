# Medusa B2B — AI Agent Environment

<!-- #ZEROPS_EXTRACT_START:intro# -->
**AI agent** environment deploys the Medusa B2B backend (`medusa`) and Next.js storefront (`nextstore`) from [zerops-recipe-apps/medusa-b2b](https://github.com/zerops-recipe-apps/medusa-b2b) with hobby PostgreSQL, Valkey, and public-read object storage. Both apps use their production setups — the recipe has no idle `setup: dev` — so an agent can hit `/health` and `/app` immediately after import.
<!-- #ZEROPS_EXTRACT_END:intro# -->
