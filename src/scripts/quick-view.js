import { formatMoney } from "./utils.js";

let busy = false;
let lastTrigger = null;

function getFocusable(modal) {
  return Array.from(
    modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function trapFocus(modal, e) {
  const focusable = getFocusable(modal);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openModal(modal, overlay) {
  overlay?.classList.remove("hidden");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // Double rAF ensures the browser paints the initial scale-95/opacity-0 state
  // before the transition class change fires (single rAF batches with hidden removal)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const panel = modal.querySelector(".qv-panel");
      if (panel) {
        panel.classList.remove("scale-95", "opacity-0");
        panel.classList.add("scale-100", "opacity-100");
      }
    });
  });

  modal._trapHandler = (e) => {
    if (e.key === "Tab") trapFocus(modal, e);
  };
  modal.addEventListener("keydown", modal._trapHandler);

  modal.querySelector("[data-quick-view-close]")?.focus();
}

function closeModal(modal, overlay) {
  overlay?.classList.add("hidden");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (modal._trapHandler) {
    modal.removeEventListener("keydown", modal._trapHandler);
    modal._trapHandler = null;
  }

  // Clear content so next open starts fresh
  const content = modal.querySelector("[data-quick-view-content]");
  if (content) content.innerHTML = "";

  // Reset panel to initial state for next open
  // (element is display:none here — no visible flicker)
  const panel = modal.querySelector(".qv-panel");
  if (panel) {
    panel.classList.remove("scale-100", "opacity-100");
    panel.classList.add("scale-95", "opacity-0");
  }

  lastTrigger?.focus();
  lastTrigger = null;
}

async function loadProduct(handle) {
  const res = await fetch(`/products/${handle}?sections=quick-view-product`);
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  return json["quick-view-product"] ?? "";
}

export function initQuickView() {
  const modal = document.querySelector("[data-quick-view-modal]");
  const overlay = document.querySelector("[data-quick-view-overlay]");
  if (!modal) return;

  // Single delegated click handler for all quick-view click interactions
  document.addEventListener("click", async (e) => {
    // Close button
    if (e.target.closest("[data-quick-view-close]")) {
      closeModal(modal, overlay);
      return;
    }

    // Overlay click
    if (e.target.matches("[data-quick-view-overlay]")) {
      closeModal(modal, overlay);
      return;
    }

    // Trigger
    const trigger = e.target.closest("[data-quick-view-trigger]");
    if (!trigger) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    lastTrigger = trigger;

    const handle = trigger.dataset.productHandle;
    if (!handle) {
      busy = false;
      return;
    }

    const content = modal.querySelector("[data-quick-view-content]");
    if (content)
      content.innerHTML = `
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-pulse">
          <div class="aspect-square rounded-2xl bg-surface-container"></div>
          <div class="flex flex-col gap-4 py-2">
            <div class="h-3 w-1/3 rounded-full bg-surface-container"></div>
            <div class="h-5 w-2/3 rounded-full bg-surface-container"></div>
            <div class="h-4 w-1/4 rounded-full bg-surface-container"></div>
            <div class="mt-4 h-10 w-full rounded-2xl bg-surface-container"></div>
          </div>
        </div>`;
    openModal(modal, overlay);

    try {
      const html = await loadProduct(handle);
      if (content) content.innerHTML = html;
    } catch {
      if (content) {
        content.innerHTML =
          '<p class="py-12 text-center text-sm text-on-surface-variant">Could not load product. <a href="/products/' +
          handle +
          '" class="font-semibold text-primary underline">View full page</a></p>';
      }
    } finally {
      busy = false;
    }
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.getAttribute("aria-hidden") === "false")
      closeModal(modal, overlay);
  });

  // Close modal when the product form inside it is submitted (ATC)
  // cart-drawer.js handles the actual add-to-cart + drawer open flow
  document.addEventListener("submit", (e) => {
    if (modal.getAttribute("aria-hidden") === "true") return;
    if (!e.target.closest("[data-cart-form]")) return;
    closeModal(modal, overlay);
  });

  // Variant change → update price and ATC button state
  document.addEventListener("change", (e) => {
    const select = e.target.closest("[data-variant-selector]");
    if (!select) return;
    if (modal.getAttribute("aria-hidden") === "true") return;

    const variantsEl = modal.querySelector("[data-product-variants]");
    if (!variantsEl) return;

    let variants;
    try {
      variants = JSON.parse(variantsEl.textContent);
    } catch {
      return;
    }
    const variant = variants.find((v) => String(v.id) === select.value);
    if (!variant) return;

    const priceEl = modal.querySelector("[data-quick-view-price]");
    if (priceEl) {
      const price = formatMoney(variant.price);
      const compareAt = variant.compare_at_price;
      if (compareAt && compareAt > variant.price) {
        priceEl.innerHTML = `<div class="price"><span class="price__sale font-semibold text-secondary"><span class="sr-only">Sale price</span>${price}</span> <s class="price__compare ml-1 text-sm text-on-surface/50"><span class="sr-only">Regular price</span>${formatMoney(compareAt)}</s></div>`;
      } else {
        priceEl.innerHTML = `<div class="price"><span class="price__regular font-semibold text-on-surface">${price}</span></div>`;
      }
    }

    const atcBtn = modal.querySelector("[data-add-to-cart]");
    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      atcBtn.textContent = variant.available ? "Add to Cart" : "Sold Out";
    }
  });
}
