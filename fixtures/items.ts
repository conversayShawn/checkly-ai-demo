// Fixture definitions — the set of items this demo expects to exist on jsonmap.site.
// seed.ts PUTs these; teardown.ts DELETEs them.
export type Fixture = { key: string; body: unknown }

export const fixtures: Fixture[] = [
  {
    key: 'system-health',
    body: { status: 'ok', service: 'blueprint-ai-demo', version: '0.1.0' },
  },

  // Catalog
  {
    key: 'product-telescope-starter',
    body: { sku: 'TELE-001', name: 'Starter Telescope', priceUsd: 129.0, inStock: true },
  },
  {
    key: 'product-binoculars-roof',
    body: { sku: 'BINO-002', name: 'Roof Binoculars', priceUsd: 89.0, inStock: true },
  },
  {
    key: 'product-tripod-carbon',
    body: { sku: 'TRIP-003', name: 'Carbon Tripod', priceUsd: 199.0, inStock: false },
  },

  // Orders
  {
    key: 'order-demo-1',
    body: {
      orderId: 'ORD-0001',
      status: 'confirmed',
      total: 218.0,
      items: [
        { sku: 'TELE-001', qty: 1 },
        { sku: 'BINO-002', qty: 1 },
      ],
    },
  },

  // Inventory
  {
    key: 'inventory-TELE-001',
    body: { sku: 'TELE-001', available: 42, warehouse: 'US-WEST', reservedForOrders: 3 },
  },
  {
    key: 'inventory-BINO-002',
    body: { sku: 'BINO-002', available: 18, warehouse: 'US-WEST', reservedForOrders: 0 },
  },
  {
    key: 'inventory-TRIP-003',
    body: { sku: 'TRIP-003', available: 0, warehouse: 'US-EAST', reservedForOrders: 0 },
  },

  // Pricing
  {
    key: 'pricing-TELE-001',
    body: { sku: 'TELE-001', base: 129.0, currency: 'USD', discount: null },
  },
  {
    key: 'pricing-BINO-002',
    body: { sku: 'BINO-002', base: 89.0, currency: 'USD', discount: { pct: 10, code: 'SPRING10' } },
  },
  {
    key: 'pricing-TRIP-003',
    body: { sku: 'TRIP-003', base: 199.0, currency: 'USD', discount: null },
  },

  // Recommendations
  {
    key: 'recommendations-TELE-001',
    body: { sku: 'TELE-001', recommendedSkus: ['BINO-002', 'TRIP-003'] },
  },
  {
    key: 'recommendations-BINO-002',
    body: { sku: 'BINO-002', recommendedSkus: ['TELE-001'] },
  },

  // Payment gateway health
  {
    key: 'payment-health',
    body: { status: 'ok', provider: 'stripe', latencyMs: 120 },
  },

  // Shipping estimates
  {
    key: 'shipping-10001',
    body: { postcode: '10001', cost: 12.5, currency: 'USD', etaDays: 3 },
  },
  {
    key: 'shipping-94107',
    body: { postcode: '94107', cost: 14.0, currency: 'USD', etaDays: 4 },
  },
]
