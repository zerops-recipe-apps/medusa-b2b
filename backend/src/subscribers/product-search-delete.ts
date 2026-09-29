import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { MEILISEARCH_MODULE } from "../modules/meilisearch"
import MeilisearchModuleService from "../modules/meilisearch/service"

export default async function productSearchDeleteHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  let meilisearch: MeilisearchModuleService
  try {
    meilisearch = container.resolve(MEILISEARCH_MODULE)
  } catch {
    return
  }

  await meilisearch.deleteFromIndex([data.id])
}

export const config: SubscriberConfig = {
  event: "product.deleted",
}
