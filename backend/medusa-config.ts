import { QUOTE_MODULE } from "./src/modules/quote"
import { APPROVAL_MODULE } from "./src/modules/approval"
import { COMPANY_MODULE } from "./src/modules/company"
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

/** Empty or whitespace-only secrets stay off — Zerops may inject "". */
const envEnabled = (value: string | undefined) => Boolean(value?.trim())

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
const CACHE_REDIS_URL = process.env.CACHE_REDIS_URL || REDIS_URL
const EVENTS_REDIS_URL = process.env.EVENTS_REDIS_URL || REDIS_URL
const WE_REDIS_URL = process.env.WE_REDIS_URL || REDIS_URL
const LOCKING_REDIS_URL = process.env.LOCKING_REDIS_URL || REDIS_URL
const BACKEND_URL = process.env.BACKEND_URL || ""
const STOREFRONT_URL = process.env.STOREFRONT_URL || ""

const modules: Record<string, unknown> = {
  [COMPANY_MODULE]: {
    resolve: "./modules/company",
  },
  [QUOTE_MODULE]: {
    resolve: "./modules/quote",
  },
  [APPROVAL_MODULE]: {
    resolve: "./modules/approval",
  },
}

if (envEnabled(process.env.REDIS_URL)) {
  modules[Modules.CACHE] = {
    resolve: "@medusajs/medusa/caching",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/caching-redis",
          id: "caching-redis",
          is_default: true,
          options: {
            redisUrl: CACHE_REDIS_URL,
          },
        },
      ],
    },
  }
  modules[Modules.EVENT_BUS] = {
    resolve: "@medusajs/medusa/event-bus-redis",
    options: {
      redisUrl: EVENTS_REDIS_URL,
    },
  }
  modules[Modules.WORKFLOW_ENGINE] = {
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: {
        redisUrl: WE_REDIS_URL,
      },
    },
  }
  modules[Modules.LOCKING] = {
    resolve: "@medusajs/medusa/locking",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/locking-redis",
          id: "locking-redis",
          is_default: true,
          options: {
            redisUrl: LOCKING_REDIS_URL,
          },
        },
      ],
    },
  }
}

if (
  envEnabled(process.env.MINIO_ENDPOINT) &&
  envEnabled(process.env.MINIO_BUCKET)
) {
  modules[Modules.FILE] = {
    resolve: "@medusajs/medusa/file",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/file-s3",
          id: "s3",
          options: {
            file_url:
              process.env.MINIO_ENDPOINT + "/" + process.env.MINIO_BUCKET,
            access_key_id: process.env.MINIO_ACCESS_KEY,
            secret_access_key: process.env.MINIO_SECRET_KEY,
            region: "us-east-1",
            bucket: process.env.MINIO_BUCKET,
            endpoint: process.env.MINIO_ENDPOINT,
            additional_client_config: {
              forcePathStyle: true,
            },
          },
        },
      ],
    },
  }
}

if (envEnabled(process.env.STRIPE_API_KEY)) {
  modules[Modules.PAYMENT] = {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          },
        },
      ],
    },
  }
}

module.exports = defineConfig({
  admin: {
    backendUrl: BACKEND_URL,
    storefrontUrl: STOREFRONT_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    ...(envEnabled(process.env.REDIS_URL) ? { redisUrl: REDIS_URL } : {}),
  },
  modules,
})
