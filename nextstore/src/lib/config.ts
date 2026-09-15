import Medusa from "@medusajs/js-sdk"
import { getMedusaBackendUrl, getMedusaPublishableKey } from "./util/env"

export const sdk = new Medusa({
  baseUrl: getMedusaBackendUrl(),
  debug: process.env.NODE_ENV === "development",
  publishableKey: getMedusaPublishableKey(),
})
