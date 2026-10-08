# Medusa B2B Recipe App

<!-- #ZEROPS_EXTRACT_START:intro# -->
[Medusa](https://medusajs.com) v2.21 B2B commerce API and admin at the repository root — companies, quotes, approvals, and B2B cart flows. Pairs with the optional Next.js storefront in [medusa-b2b-frontend](https://github.com/zerops-recipe-apps/medusa-b2b-frontend). PostgreSQL, Valkey, Meilisearch, and MinIO are wired in the [Medusa B2B recipe](https://app.zerops.io/recipes/medusa-b2b) on [Zerops](https://zerops.io).
<!-- #ZEROPS_EXTRACT_END:intro# -->

Used within [Medusa B2B recipe](https://app.zerops.io/recipes/medusa-b2b) for the Zerops platform.

⬇️ **Full recipe page and deploy with one-click**

[![Deploy on Zerops](https://github.com/zeropsio/recipe-shared-assets/blob/main/deploy-button/light/deploy-button.svg)](https://app.zerops.io/recipes/medusa-b2b?environment=small-production)

![cover](https://github.com/zeropsio/recipe-shared-assets/blob/main/covers/svg/cover-nextjs.svg)

## Repositories

| Repo | Role |
| --- | --- |
| [medusa-b2b](https://github.com/zerops-recipe-apps/medusa-b2b) (this repo) | Medusa backend + admin (`/app`) |
| [medusa-b2b-frontend](https://github.com/zerops-recipe-apps/medusa-b2b-frontend) | Optional Next.js 15 storefront |

Import only `medusa*` services from the recipe when you want **backend-only** (Mate / headless). Zerops hostnames for the storefront stay `nextstore*`; Git repo names use `-frontend`.

Canonical recipe imports: [`zeropsio/recipes/medusa-b2b`](https://github.com/zeropsio/recipes/tree/main/medusa-b2b) and the copy in [`.zerops-recipe/`](.zerops-recipe/).

## Local development

```bash
yarn install
cp .env.template .env   # edit DATABASE_URL, Redis, optional MinIO / Meilisearch / SMTP
yarn dev                # http://localhost:9000 — admin at /app
```

Optional storefront (separate clone):

```bash
cd ../medusa-b2b-frontend
cp .env.template .env.local
yarn install && yarn dev   # http://localhost:8000
```

Use a publishable API key from **Admin → Settings → API Key Management** in `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

## Integration Guide

<!-- #ZEROPS_EXTRACT_START:integration-guide# -->

### 1. Adding `zerops.yml`

Place at the repository root. Only **`dev`** and **`prod`** setups — stage hostnames such as `medusastage` use `zeropsSetup: prod`.

```yaml
# Medusa at repo root. Storefront is a separate Git repo (medusa-b2b-frontend).
zerops:
  - setup: prod
    build:
      base: nodejs@24
      envVariables:
        BACKEND_URL: ${API_URL}
      buildCommands:
        - yarn
        - yarn build
        - cp -f package.json tsconfig.json .medusa/server/
      deployFiles:
        - .medusa/server/~
        - ~node_modules
      cache:
        - node_modules
    deploy:
      readinessCheck:
        httpGet:
          port: 9000
          path: /health
    run:
      base: nodejs@24
      initCommands:
        - zsc execOnce ${appVersionId}_migration -- yarn migrate
        - zsc execOnce ${appVersionId}_links -- yarn syncLinks
        - zsc execOnce createInitialSuperadmin_v2 -- yarn createInitialSuperadmin
        - zsc execOnce seedInitialData -- yarn seedInitialData
        - yarn setInitialPublishableKey
        - yarn reloadNextstoreEnv
        - zsc execOnce addInitialSearchDocuments -- yarn addInitialSearchDocuments
      ports:
        - port: 9000
          httpSupport: true
      start: yarn start
      healthCheck:
        httpGet:
          port: 9000
          path: /health
      # DATABASE_URL, Redis, MinIO, Meilisearch — composed from sibling services.
      # Secrets (Stripe, SMTP, …) belong in the project vault, not KEY: ${KEY} here.

  - setup: dev
    build:
      base: nodejs@24
      buildCommands:
        - yarn
      deployFiles: ./
      cache:
        - node_modules
    run:
      base: nodejs@24
      ports:
        - port: 9000
          httpSupport: true
      # Full repo deploy so git-connected workspaces keep sources; SSH in and yarn dev.
```

See [zerops.yml](zerops.yml) for the full `envVariables` block.

<!-- #ZEROPS_EXTRACT_END:integration-guide# -->
