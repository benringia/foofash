/**
 * Shared money formatting utilities.
 *
 * Two contracts exist depending on the data source:
 *
 * formatMoney(cents)     — input is an INTEGER in the store's smallest currency
 *                          unit (e.g. centavos / cents). Used for data from:
 *                            - Shopify Cart API (/cart.js, /cart/change.js)
 *                            - product-variants-json script tag in Liquid
 *
 * formatPrice(decimalStr) — input is a DECIMAL STRING like "25.99". Used for
 *                           data from:
 *                             - /recommendations/products.json (variant.price)
 *
 * Both use the store's active currency code exposed via window.__foofash.currency
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

export function formatPrice(decimalStr) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency(),
  }).format(parseFloat(decimalStr));
}
