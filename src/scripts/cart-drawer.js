import { getCart, addToCart, updateItem, removeItem } from "./cart.js";

let busy = false;
let lastToggleTrigger = null;

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function renderCartItem(item) {
  const image = item.image
    ? `<img src="${item.image}" alt="${item.title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-md object-cover bg-gray-100">`
    : `<div class="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true"></div>`;

  const variantLine =
    item.variant_title && item.variant_title !== "Default Title"
      ? `<p class="text-xs text-gray-500">${item.variant_title}</p>`
      : "";

  return `
    <li class="flex gap-4 py-4 border-b border-gray-100 last:border-0" data-line-item data-item-key="${item.key}">
      ${image}
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${item.product_title}</p>
        ${variantLine}
        <p class="text-sm font-semibold text-gray-900">${formatMoney(item.final_line_price)}</p>
        <div class="flex items-center gap-2 mt-1">
          <button
            type="button"
            data-quantity-decrease
            aria-label="Decrease quantity"
            class="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >−</button>
          <input
            type="number"
            data-quantity-input
            value="${item.quantity}"
            min="0"
            class="w-10 text-center text-sm border border-gray-300 rounded py-0.5"
            aria-label="Quantity for ${item.product_title}"
          >
          <button
            type="button"
            data-quantity-increase
            aria-label="Increase quantity"
            class="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >+</button>
          <button
            type="button"
            data-remove-item
            aria-label="Remove ${item.product_title}"
            class="ml-auto text-xs text-gray-400 hover:text-red-500 underline"
          >Remove</button>
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
}

function openDrawer() {
  const drawer = document.querySelector("[data-cart-drawer]");
  const overlay = document.querySelector("[data-cart-overlay]");
  if (!drawer) return;

  overlay?.classList.remove("hidden");
  drawer.classList.remove("translate-x-full");
  drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

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
    busy = true;
    try {
      const cart = await updateItem(key, newQty);
      renderCart(cart);
    } catch (err) {
      console.error("Quantity update failed:", err);
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
    busy = true;
    try {
      const cart = await updateItem(key, newQty);
      renderCart(cart);
    } catch (err) {
      console.error("Quantity update failed:", err);
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
    busy = true;
    try {
      const cart = await removeItem(key);
      renderCart(cart);
    } catch (err) {
      console.error("Remove item failed:", err);
    } finally {
      busy = false;
    }
  });
}
