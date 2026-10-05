import {
  createApiKeysWorkflow,
  createCustomersWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createCompaniesWorkflow } from "../workflows/company/workflows/create-companies"
import { createEmployeesWorkflow } from "../workflows/employee/workflows"
import { ModuleCompanySpendingLimitResetFrequency } from "../types"

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService = container.resolve(Modules.STORE)
  const regionModuleService = container.resolve(Modules.REGION)
  const productModuleService = container.resolve(Modules.PRODUCT)

  const existingProducts = await productModuleService.listProducts(
    {},
    { take: 1 }
  )
  if (existingProducts.length > 0) {
    logger.info("Products already present; skipping seed.")
    return
  }

  const existingRegions = await regionModuleService.listRegions({})
  if (existingRegions.length > 0) {
    logger.info(
      "Regions exist without products; continuing catalog seed (may require manual cleanup if this fails)."
    )
  }

  const countries = ["gb", "de", "dk", "se", "fr", "es", "it"]

  logger.info("Seeding store data...")
  const [store] = await storeModuleService.listStores()
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    })
    defaultSalesChannel = salesChannelResult
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          { currency_code: "eur", is_default: true },
          { currency_code: "usd" },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  })

  logger.info("Seeding region data...")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  const region = regionResult[0]

  logger.info("Seeding tax regions...")
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({ country_code })),
  })

  logger.info("Seeding stock location data...")
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "European Warehouse",
          address: {
            city: "Copenhagen",
            country_code: "DK",
            address_1: "",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  })

  logger.info("Seeding fulfillment data...")
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: "Default", type: "default" }],
      },
    })
  const shippingProfile = shippingProfileResult[0]

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Europe",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  })

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          { currency_code: "usd", amount: 10 },
          { currency_code: "eur", amount: 10 },
          { region_id: region.id, amount: 10 },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  })

  logger.info("Seeding publishable API key data...")
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "B2B storefront",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })
  const publishableApiKey = publishableApiKeyResult[0]

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  })

  logger.info("Seeding product data...")
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Office", is_active: true },
        { name: "Accessories", is_active: true },
      ],
    },
  })

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Wireless Keyboard | Touch ID | Numeric Keypad",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Accessories")?.id!,
          ],
          description:
            "A wireless keyboard with a numeric keypad and Touch ID. Demo catalog item for the B2B storefront.",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/keyboard-front.png",
            },
          ],
          options: [{ title: "Color", values: ["Black", "White"] }],
          variants: [
            {
              title: "Keyboard Black",
              sku: "KEYBOARD-BLACK",
              options: { Color: "Black" },
              manage_inventory: false,
              prices: [
                { amount: 99, currency_code: "eur" },
                { amount: 99, currency_code: "usd" },
              ],
            },
            {
              title: "Keyboard White",
              sku: "KEYBOARD-WHITE",
              options: { Color: "White" },
              manage_inventory: false,
              prices: [
                { amount: 99, currency_code: "eur" },
                { amount: 99, currency_code: "usd" },
              ],
            },
          ],
          sales_channels: [{ id: defaultSalesChannel[0].id }],
        },
      ],
    },
  })

  logger.info("Seeding B2B company and employees...")
  const companyEmail =
    process.env.COMPANY_ADMIN_EMAIL || "company.admin@example.com"
  const employeeEmail =
    process.env.COMPANY_EMPLOYEE_EMAIL || "company.buyer@example.com"

  const { result: companies } = await createCompaniesWorkflow.run({
    container,
    input: [
      {
        name: "Acme GmbH",
        phone: "+49000000000",
        email: companyEmail,
        address: "Alexanderplatz 1",
        city: "Berlin",
        state: "BE",
        zip: "10178",
        country: "de",
        logo_url: null,
        currency_code: "eur",
        spending_limit_reset_frequency:
          ModuleCompanySpendingLimitResetFrequency.MONTHLY,
      },
    ],
  })
  const company = companies[0]

  const { result: customers } = await createCustomersWorkflow(container).run({
    input: {
      customersData: [
        {
          email: companyEmail,
          first_name: "Ada",
          last_name: "Admin",
          company_name: "Acme GmbH",
        },
        {
          email: employeeEmail,
          first_name: "Eli",
          last_name: "Buyer",
          company_name: "Acme GmbH",
        },
      ],
    },
  })

  await createEmployeesWorkflow.run({
    container,
    input: {
      employeeData: {
        customer_id: customers[0].id,
        company_id: company.id,
        is_admin: true,
        spending_limit: 100000,
      },
      customerId: customers[0].id,
    },
  })

  await createEmployeesWorkflow.run({
    container,
    input: {
      employeeData: {
        customer_id: customers[1].id,
        company_id: company.id,
        is_admin: false,
        spending_limit: 5000,
      },
      customerId: customers[1].id,
    },
  })

  logger.info(
    `Finished seeding. Company admin ${companyEmail} and buyer ${employeeEmail} are customers on Acme GmbH (register those emails on the storefront to attach auth).`
  )
}
