import { formatMoney } from "./utils.js";

export function initStickyAtc() {
  const mainAtc = document.querySelector("[data-main-atc]");
  const stickyBar = document.querySelector("[data-sticky-atc]");
  const stickyBtn = document.querySelector("[data-sticky-atc-btn]");

  if (!mainAtc || !stickyBar || !stickyBtn) return;

  // Show/hide the bar based on main ATC visibility
  const observer = new IntersectionObserver(
    ([entry]) => {
      const visible = entry.isIntersecting;
      stickyBar.classList.toggle("translate-y-full", visible);
      stickyBar.setAttribute("aria-hidden", String(visible));
    },
    { threshold: 0 },
  );

  observer.observe(mainAtc);

  // Clicking sticky button submits the main product form
  stickyBtn.addEventListener("click", () => {
    const form = mainAtc.closest("form");
    if (!form) return;
    form.requestSubmit(mainAtc);
  });

  // ── Variant sync ──────────────────────────────────────────────────────────
  const variantSelector = document.querySelector("[data-variant-selector]");
  const stickyPrice = document.querySelector("[data-sticky-atc-price]");
  const stickyVariant = document.querySelector("[data-sticky-atc-variant]");

  const variantsData = JSON.parse(
    document.getElementById("product-variants-json")?.textContent || "[]",
  );

  const updatePrice = (variant) => {
    if (!stickyPrice) return;
    const onSale = variant.compare_at_price > variant.price;
    if (onSale) {
      stickyPrice.innerHTML = `
        <div class="price">
          <span class="price__sale font-semibold text-secondary">
            <span class="sr-only">Sale price</span>${formatMoney(variant.price)}
          </span>
          <s class="price__compare ml-1 text-sm text-on-surface/50">
            <span class="sr-only">Regular price</span>${formatMoney(variant.compare_at_price)}
          </s>
        </div>`;
    } else {
      stickyPrice.innerHTML = `
        <div class="price">
          <span class="price__regular font-semibold text-on-surface">
            ${formatMoney(variant.price)}
          </span>
        </div>`;
    }
  };

  if (!variantSelector || !variantsData.length) return;

  variantSelector.addEventListener("change", () => {
    const variant = variantsData.find(
      (v) => v.id === parseInt(variantSelector.value, 10),
    );
    if (!variant) return;

    // Sync button state
    stickyBtn.disabled = !variant.available;
    stickyBtn.setAttribute("aria-disabled", String(!variant.available));
    stickyBtn.textContent = variant.available ? "Add to Cart" : "Sold Out";

    // Sync price display
    updatePrice(variant);

    // Sync variant label
    if (stickyVariant) {
      const selectedOption =
        variantSelector.options[variantSelector.selectedIndex];
      stickyVariant.textContent = selectedOption?.text ?? "";
    }
  });
}
