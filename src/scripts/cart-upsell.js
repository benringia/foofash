import { addToCart, getCart } from "./cart.js";
import { formatMoney } from "./utils.js";

const MAX_UPSELLS = 3;
let upsellBusy = false;
let renderGen = 0;
let cachedProducts = [];
let cachedSeedId = null;

const PLUS_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;

function getImageUrl(product) {
  // Recommendations API returns featured_image as a URL string or null
  const src =
    typeof product.featured_image === "string"
      ? product.featured_image
      : (product.featured_image?.src ?? null);
  if (!src) return null;
  return src.includes("?") ? `${src}&width=120` : `${src}?width=120`;
}

function renderUpsellItem(product) {
  // Only quick-add when product has exactly one variant (no option selection needed)
  const availableVariant = product.variants.find((v) => v.available);
  if (!availableVariant) return "";

  const canQuickAdd = product.variants.length === 1;
  const imageUrl = getImageUrl(product);

  const image = imageUrl
    ? `<img src="${imageUrl}" alt="${product.title}" width="56" height="56" loading="lazy" class="h-14 w-14 shrink-0 rounded-2xl object-cover bg-surface-container">`
    : `<div class="h-14 w-14 shrink-0 rounded-2xl bg-surface-container flex items-center justify-center text-primary/20" aria-hidden="true"></div>`;

  const action = canQuickAdd
    ? `<button
         type="button"
         data-upsell-add
         data-variant-id="${availableVariant.id}"
         aria-label="Add ${product.title} to cart"
         class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40"
       >${PLUS_ICON}</button>`
    : `<a
         href="${product.url}"
         class="flex h-8 shrink-0 items-center justify-center rounded-xl bg-surface px-3 text-xs font-semibold text-primary shadow-ambient transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
       >View</a>`;

  return `
    <div class="flex items-center gap-3 rounded-2xl bg-surface-container p-2.5">
      ${image}
      <div class="min-w-0 flex-1">
        <p class="line-clamp-2 text-xs font-semibold leading-snug text-on-surface">${product.title}</p>
        <p class="mt-0.5 text-xs font-bold text-primary">${formatMoney(availableVariant.price)}</p>
      </div>
      ${action}
    </div>
  `.trim();
}

async function fetchRecommendations(productId) {
  const res = await fetch(
    `/recommendations/products.json?product_id=${productId}&limit=6`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.products) ? data.products : [];
}

export async function refreshCartUpsell(cart) {
  const upsellBlock = document.querySelector("[data-cart-upsell]");
  const upsellItems = document.querySelector("[data-cart-upsell-items]");
  if (!upsellBlock || !upsellItems) return;

  if (!cart.items.length) {
    upsellBlock.classList.add("hidden");
    return;
  }

  const gen = ++renderGen;
  const cartProductIds = new Set(cart.items.map((i) => i.product_id));
  const seedProductId = cart.items[0].product_id;

  try {
    // Only hit the API when the seed product changes; otherwise re-filter the cache
    if (seedProductId !== cachedSeedId) {
      const products = await fetchRecommendations(seedProductId);
      if (gen !== renderGen) return; // a newer refresh is in flight, bail
      cachedProducts = products;
      cachedSeedId = seedProductId;
    }

    const eligible = cachedProducts
      .filter((p) => !cartProductIds.has(p.id))
      .filter((p) => p.available)
      .slice(0, MAX_UPSELLS);

    if (!eligible.length) {
      upsellBlock.classList.add("hidden");
      return;
    }

    const html = eligible.map(renderUpsellItem).filter(Boolean).join("");
    if (!html) {
      upsellBlock.classList.add("hidden");
      return;
    }

    upsellItems.innerHTML = html;
    upsellBlock.classList.remove("hidden");
  } catch {
    // Fail silently — hide upsell, keep drawer usable
    upsellBlock.classList.add("hidden");
  }
}

export function initCartUpsell() {
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-upsell-add]");
    if (!btn || upsellBusy) return;

    const variantId = btn.dataset.variantId;
    if (!variantId) return;

    upsellBusy = true;
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span aria-hidden="true" class="text-xs font-bold leading-none">…</span>`;

    try {
      await addToCart([{ id: parseInt(variantId, 10), quantity: 1 }]);
      const cart = await getCart();
      // Notify cart-drawer to re-render the items list and subtotal
      document.dispatchEvent(
        new CustomEvent("foofash:cart-updated", { detail: { cart } }),
      );
    } catch (err) {
      console.error("Upsell add failed:", err);
      btn.innerHTML = originalContent;
      btn.disabled = false;
    } finally {
      upsellBusy = false;
    }
  });
}
