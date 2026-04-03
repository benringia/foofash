let busy = false;
let lastTrigger = null;

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function getFocusable(modal) {
  return Array.from(
    modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
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

  lastTrigger?.focus();
  lastTrigger = null;
}

async function loadProduct(handle) {
  const res = await fetch(`/products/${handle}?view=quick-view`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!res.ok) throw new Error(`Failed to load product: ${res.status}`);
  return res.text();
}

export function initQuickView() {
  const modal = document.querySelector("[data-quick-view-modal]");
  const overlay = document.querySelector("[data-quick-view-overlay]");
  if (!modal) return;

  // Delegated trigger click
  document.addEventListener("click", async (e) => {
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
      content.innerHTML =
        '<p class="text-center text-gray-400 py-8">Loading…</p>';
    openModal(modal, overlay);

    try {
      const html = await loadProduct(handle);
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const inner = parsed.querySelector("main") ?? parsed.body;
      if (content) content.innerHTML = inner.innerHTML;
    } catch {
      if (content) {
        content.innerHTML =
          '<p class="text-center text-red-500 py-8">Could not load product. <a href="/products/' +
          handle +
          '" class="underline">View full page</a></p>';
      }
    } finally {
      busy = false;
    }
  });

  // Close button
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-quick-view-close]")) closeModal(modal, overlay);
  });

  // Overlay click
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-quick-view-overlay]"))
      closeModal(modal, overlay);
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal.getAttribute("aria-hidden") === "false")
      closeModal(modal, overlay);
  });

  // Variant change → update price and ATC button state
  document.addEventListener("change", (e) => {
    const select = e.target.closest("[data-variant-selector]");
    if (!select) return;
    if (modal.getAttribute("aria-hidden") === "true") return;

    const variantsEl = modal.querySelector("[data-product-variants]");
    if (!variantsEl) return;

    const variants = JSON.parse(variantsEl.textContent);
    const variant = variants.find((v) => String(v.id) === select.value);
    if (!variant) return;

    const priceEl = modal.querySelector("[data-quick-view-price]");
    if (priceEl) {
      const price = formatMoney(variant.price);
      const compareAt = variant.compare_at_price;
      if (compareAt && compareAt > variant.price) {
        priceEl.innerHTML = `<span class="text-red-600 font-semibold">${price}</span> <s class="text-gray-400 text-sm">${formatMoney(compareAt)}</s>`;
      } else {
        priceEl.innerHTML = `<span class="font-semibold text-gray-900">${price}</span>`;
      }
    }

    const atcBtn = modal.querySelector("[data-add-to-cart]");
    if (atcBtn) {
      atcBtn.disabled = !variant.available;
      atcBtn.setAttribute("aria-disabled", String(!variant.available));
      atcBtn.textContent = variant.available ? "Add to cart" : "Sold out";
    }
  });
}
