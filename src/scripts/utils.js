/**
 * Shared money formatting utilities.
 *
 * formatMoney(cents) — input is an INTEGER in the store's smallest currency
 *                      unit (e.g. centavos / cents). Used for data from:
 *                        - Shopify Cart API (/cart.js, /cart/change.js)
 *                        - product-variants-json script tag in Liquid
 *                        - /recommendations/products.json (variant.price)
 *
 * formatAmount(amount) — input is a DECIMAL already in the store's major
 *                        currency unit (e.g. pesos, dollars). Used for:
 *                        - /search/suggest.json (product.price,
 *                          product.compare_at_price_max)
 *
 * NOTE: /search/suggest.json is the exception — it returns prices as decimals
 * (e.g. 30.0 for ₱30.00), not in centavos. All other Shopify storefront JSON
 * endpoints return integer cents. Use formatMoney for those.
 *
 * Uses the store's active currency code exposed via window.__foofash.currency
 * (set in theme.liquid). Falls back to "USD" if the global is absent.
 */

function currency() {
  return window.__foofash?.currency ?? "USD";
}

export function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency(),
  }).format(cents / 100);
}

export function formatAmount(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency(),
  }).format(amount);
}
