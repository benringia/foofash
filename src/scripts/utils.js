/**
 * Shared money formatting utilities.
 *
 * formatMoney(cents) — input is an INTEGER in the store's smallest currency
 *                      unit (e.g. centavos / cents). Used for data from:
 *                        - Shopify Cart API (/cart.js, /cart/change.js)
 *                        - product-variants-json script tag in Liquid
 *                        - /recommendations/products.json (variant.price)
 *
 * NOTE: All Shopify storefront JSON endpoints return prices as integer cents,
 * not decimal strings. Always use formatMoney for any Shopify price value.
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
