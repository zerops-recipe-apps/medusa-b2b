import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { MEILISEARCH_MODULE } from "../modules/meilisearch"
import MeilisearchModuleService from "../modules/meilisearch/service"

export default async function productSearchIndexHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  let meilisearch: MeilisearchModuleService
  try {
    meilisearch = container.resolve(MEILISEARCH_MODULE)
  } catch {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [product] } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "handle", "thumbnail", "variants.sku"],
    filters: { id: data.id },
  })

  if (!product) {
    return
  }

  await meilisearch.indexData([
    {
      id: product.id,
      title: product.title,
      description: product.description,
      handle: product.handle,
      thumbnail: product.thumbnail,
      variant_sku: (product.variants ?? [])
        .map((variant: { sku?: string }) => variant.sku)
        .filter(Boolean)
        .join(" "),
    },
  ])
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
