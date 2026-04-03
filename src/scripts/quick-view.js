let busy = false;

function openModal() {
  const modal = document.querySelector("[data-quick-view-modal]");
  const overlay = document.querySelector("[data-quick-view-overlay]");
  if (!modal) return;

  overlay?.classList.remove("hidden");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  modal.querySelector("[data-quick-view-close]")?.focus();
}

function closeModal() {
  const modal = document.querySelector("[data-quick-view-modal]");
  const overlay = document.querySelector("[data-quick-view-overlay]");
  if (!modal) return;

  overlay?.classList.add("hidden");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  // Clear content so next open starts fresh
  const content = modal.querySelector("[data-quick-view-content]");
  if (content) content.innerHTML = "";
}

async function loadProduct(handle) {
  const res = await fetch(`/products/${handle}?view=quick-view`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!res.ok) throw new Error(`Failed to load product: ${res.status}`);
  return res.text();
}

export function initQuickView() {
  // Delegated trigger click
  document.addEventListener("click", async (e) => {
    const trigger = e.target.closest("[data-quick-view-trigger]");
    if (!trigger) return;
    e.preventDefault();
    if (busy) return;
    busy = true;

    const handle = trigger.dataset.productHandle;
    if (!handle) {
      busy = false;
      return;
    }

    const content = document.querySelector("[data-quick-view-content]");
    if (content)
      content.innerHTML =
        '<p class="text-center text-gray-400 py-8">Loading…</p>';
    openModal();

    try {
      const html = await loadProduct(handle);
      const parsed = new DOMParser().parseFromString(html, "text/html");
      // Extract just the main content area rendered by the quick-view template
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
    if (e.target.closest("[data-quick-view-close]")) closeModal();
  });

  // Overlay click
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-quick-view-overlay]")) closeModal();
  });

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const modal = document.querySelector("[data-quick-view-modal]");
    if (modal && modal.getAttribute("aria-hidden") === "false") closeModal();
  });
}
