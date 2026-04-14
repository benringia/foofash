import { getCart, addToCart, updateItem, removeItem } from "./cart.js";
import { refreshCartUpsell } from "./cart-upsell.js";
import { formatMoney } from "./utils.js";

let busy = false;
let lastToggleTrigger = null;

const REMOVE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(drawer) {
  const focusable = () => Array.from(drawer.querySelectorAll(FOCUSABLE));
  drawer._trapHandler = (e) => {
    if (e.key !== "Tab") return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  drawer.addEventListener("keydown", drawer._trapHandler);
}

function releaseFocus(drawer) {
  if (drawer._trapHandler) {
    drawer.removeEventListener("keydown", drawer._trapHandler);
    drawer._trapHandler = null;
  }
}

function renderCartItem(item) {
  const image = item.image
    ? `<img src="${item.image}" alt="${item.product_title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-2xl object-cover bg-surface-container">`
    : `<div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-container text-primary/20" aria-hidden="true"></div>`;

  const variantLine =
    item.variant_title && item.variant_title !== "Default Title"
      ? `<p class="mt-0.5 text-xs text-on-surface-variant">${item.variant_title}</p>`
      : "";

  return `
    <li class="flex gap-3 py-4" data-line-item data-item-key="${item.key}">
      <div class="shrink-0">${image}</div>
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="line-clamp-2 text-sm font-semibold leading-snug text-on-surface">${item.product_title}</p>
            ${variantLine}
          </div>
          <button type="button" data-remove-item aria-label="Remove ${item.product_title}" class="ml-1 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-xl text-on-surface-variant/60 transition-colors hover:bg-secondary/10 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary">${REMOVE_ICON}</button>
        </div>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center overflow-hidden rounded-2xl bg-surface shadow-ambient" aria-label="Quantity">
            <button type="button" data-quantity-decrease aria-label="Decrease quantity" class="flex h-8 w-8 cursor-pointer items-center justify-center text-on-surface transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">&#8722;</button>
            <input type="number" data-quantity-input value="${item.quantity}" min="0" class="w-8 bg-transparent text-center text-sm font-semibold text-on-surface focus:outline-none" aria-label="Quantity for ${item.product_title}">
            <button type="button" data-quantity-increase aria-label="Increase quantity" class="flex h-8 w-8 cursor-pointer items-center justify-center text-on-surface transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">&#43;</button>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <p class="text-sm font-bold text-on-surface">${formatMoney(item.final_line_price)}</p>
            ${
              item.original_line_price !== item.final_line_price
                ? `<p class="text-xs text-on-surface/40 line-through">${formatMoney(item.original_line_price)}</p>`
                : ""
            }
          </div>
        </div>
      </div>
    </li>
  `.trim();
}

function renderCart(cart) {
  const itemsList = document.querySelector("[data-cart-items]");
  const emptyMsg = document.querySelector("[data-cart-empty]");
  const subtotalEls = document.querySelectorAll("[data-cart-subtotal]");
  const countEls = document.querySelectorAll("[data-cart-count]");

  if (itemsList) {
    itemsList.innerHTML = cart.items.map(renderCartItem).join("");
  }

  if (emptyMsg) {
    emptyMsg.classList.toggle("hidden", cart.item_count > 0);
  }

  subtotalEls.forEach((el) => {
    el.textContent = formatMoney(cart.total_price);
  });

  countEls.forEach((el) => {
    el.textContent = cart.item_count;
  });

  document.querySelectorAll("[data-cart-count-label]").forEach((el) => {
    el.textContent = cart.item_count === 1 ? "item" : "items";
  });

  document.querySelectorAll("[data-cart-count-badge]").forEach((el) => {
    el.classList.toggle("hidden", cart.item_count === 0);
  });

  // Refresh upsell after every cart state change (fire-and-forget)
  refreshCartUpsell(cart);
}

function openDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  if (!drawer) return;

  overlay?.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  trapFocus(drawer);

  // Focus the close button
  const closeBtn = drawer.querySelector("[data-cart-close]");
  closeBtn?.focus();
}

function closeDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  if (!drawer) return;

  overlay?.classList.add("hidden");
  drawer.classList.add("translate-x-full");
  drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  releaseFocus(drawer);

  lastToggleTrigger?.focus();
}

export function initCartDrawer() {
  // Open drawer on cart icon click
  document.addEventListener("click", async (e) => {
    if (!e.target.closest("[data-cart-toggle]")) return;
    lastToggleTrigger = e.target.closest("[data-cart-toggle]");
    if (busy) return;
    busy = true;
    try {
      const cart = await getCart();
      renderCart(cart);
      openDrawer();
    } catch (err) {
      console.error("Cart open failed:", err);
    } finally {
      busy = false;
    }
  });

  // Upsell quick-add fires this event after updating the cart
  document.addEventListener("foofash:cart-updated", (e) => {
    renderCart(e.detail.cart);
  });

  // Close on ✕ button
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-close]")) closeDrawer();
  });

  // Close on overlay click
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-cart-overlay]")) closeDrawer();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const drawer = document.querySelector("[data-cart-drawer]");
      if (drawer && drawer.getAttribute("aria-hidden") === "false")
        closeDrawer();
    }
  });

  // Intercept ATC form submit
  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-cart-form]");
    if (!form) return;
    e.preventDefault();
    if (busy) return;
    busy = true;

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) submitBtn.textContent = "Adding…";

    try {
      const variantId = form.querySelector('[name="id"]')?.value;
      if (!variantId) throw new Error("Add to cart: variant ID not found");
      const quantity = parseInt(
        form.querySelector('[name="quantity"]')?.value ?? "1",
        10,
      );
      await addToCart([{ id: variantId, quantity }]);
      const cart = await getCart();
      renderCart(cart);
      openDrawer();
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      if (submitBtn) submitBtn.textContent = originalText;
      busy = false;
    }
  });

  // Quantity decrease
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-quantity-decrease]");
    if (!btn) return;
    if (busy) return;
    const li = btn.closest("[data-line-item]");
    const key = li?.dataset.itemKey;
    const input = li?.querySelector("[data-quantity-input]");
    if (!key || !input) return;
    const newQty = Math.max(0, parseInt(input.value, 10) - 1);
    li.classList.add("opacity-50", "pointer-events-none");
    busy = true;
    try {
      const cart = await updateItem(key, newQty);
      renderCart(cart);
    } catch (err) {
      console.error("Quantity update failed:", err);
      li.classList.remove("opacity-50", "pointer-events-none");
    } finally {
      busy = false;
    }
  });

  // Quantity increase
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-quantity-increase]");
    if (!btn) return;
    if (busy) return;
    const li = btn.closest("[data-line-item]");
    const key = li?.dataset.itemKey;
    const input = li?.querySelector("[data-quantity-input]");
    if (!key || !input) return;
    const newQty = parseInt(input.value, 10) + 1;
    li.classList.add("opacity-50", "pointer-events-none");
    busy = true;
    try {
      const cart = await updateItem(key, newQty);
      renderCart(cart);
    } catch (err) {
      console.error("Quantity update failed:", err);
      li.classList.remove("opacity-50", "pointer-events-none");
    } finally {
      busy = false;
    }
  });

  // Direct quantity input (typing a number)
  document.addEventListener("change", async (e) => {
    const input = e.target.closest("[data-quantity-input]");
    if (!input) return;
    if (busy) return;
    const li = input.closest("[data-line-item]");
    const key = li?.dataset.itemKey;
    if (!key) return;
    const newQty = Math.max(0, parseInt(input.value, 10) || 0);
    li.classList.add("opacity-50", "pointer-events-none");
    busy = true;
    try {
      const cart = await updateItem(key, newQty);
      renderCart(cart);
    } catch (err) {
      console.error("Quantity update failed:", err);
      li.classList.remove("opacity-50", "pointer-events-none");
    } finally {
      busy = false;
    }
  });

  // Remove item
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-remove-item]");
    if (!btn) return;
    if (busy) return;
    const li = btn.closest("[data-line-item]");
    const key = li?.dataset.itemKey;
    if (!key) return;
    li.classList.add("opacity-50", "pointer-events-none");
    busy = true;
    try {
      const cart = await removeItem(key);
      renderCart(cart);
    } catch (err) {
      console.error("Remove item failed:", err);
      li.classList.remove("opacity-50", "pointer-events-none");
    } finally {
      busy = false;
    }
  });
}
