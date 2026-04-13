import { formatMoney } from "./utils.js";

export function initProduct() {
  const variantSelector = document.querySelector("[data-variant-selector]");
  const addToCartBtn = document.querySelector("[data-add-to-cart]");

  // ── Variant data for client-side price / availability updates ──────────
  const variantsData = JSON.parse(
    document.getElementById("product-variants-json")?.textContent || "[]",
  );

  // ── Variant pills → hidden select sync ─────────────────────────────────
  const pills = document.querySelectorAll("[data-variant-pill]");

  const setActivePill = (activePill) => {
    pills.forEach((pill) => {
      const isActive = pill === activePill;
      pill.setAttribute("aria-pressed", String(isActive));

      if (isActive) {
        pill.classList.remove(
          "bg-surface",
          "text-on-surface",
          "shadow-ambient",
          "hover:bg-primary/10",
        );
        pill.classList.add("bg-primary", "text-on-primary", "shadow-bubbly");
      } else {
        pill.classList.remove("bg-primary", "text-on-primary", "shadow-bubbly");
        pill.classList.add(
          "bg-surface",
          "text-on-surface",
          "shadow-ambient",
          "hover:bg-primary/10",
        );
      }
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      if (pill.dataset.available === "false") return;

      if (variantSelector) {
        variantSelector.value = pill.dataset.variantId;
        variantSelector.dispatchEvent(new Event("change", { bubbles: true }));
      }

      setActivePill(pill);
    });
  });

  // ── Quantity stepper ───────────────────────────────────────────────────
  const qtyInput = document.querySelector('[name="quantity"]');

  document
    .querySelector("[data-qty-decrease]")
    ?.addEventListener("click", () => {
      if (!qtyInput) return;
      const current = parseInt(qtyInput.value, 10);
      if (current > 1) qtyInput.value = current - 1;
    });

  document
    .querySelector("[data-qty-increase]")
    ?.addEventListener("click", () => {
      if (!qtyInput) return;
      qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    });

  // ── Gallery image switcher ─────────────────────────────────────────────
  const thumbnails = document.querySelectorAll("[data-thumbnail]");
  const mainImage = document.querySelector("[data-main-image]");

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (mainImage && thumb.dataset.imageUrl) {
        mainImage.src = thumb.dataset.imageUrl;
      }

      thumbnails.forEach((t) => {
        const isActive = t === thumb;
        t.setAttribute("aria-pressed", String(isActive));
        t.classList.toggle("ring-primary", isActive);
        t.classList.toggle("ring-transparent", !isActive);
      });
    });
  });

  // ── Variant change → price + ATC state update ──────────────────────────
  if (variantSelector && variantsData.length) {
    variantSelector.addEventListener("change", () => {
      const variant = variantsData.find(
        (v) => v.id === parseInt(variantSelector.value, 10),
      );
      if (!variant) return;

      // Update the variant ID reference on the ATC button
      if (addToCartBtn) {
        addToCartBtn.dataset.variantId = variant.id;
      }

      // Update ATC button state
      if (addToCartBtn) {
        addToCartBtn.disabled = !variant.available;
        addToCartBtn.setAttribute("aria-disabled", String(!variant.available));
        addToCartBtn.textContent = variant.available
          ? "Add to Cart"
          : "Sold Out";
      }

      // Update price display
      const priceContainer = document.querySelector("[data-pdp-price]");
      if (priceContainer) {
        const formatted = formatMoney(variant.price);

        const compareFormatted =
          variant.compare_at_price > variant.price
            ? formatMoney(variant.compare_at_price)
            : null;

        const savingsAmount = variant.compare_at_price - variant.price;
        const savingsFormatted =
          savingsAmount > 0 ? formatMoney(savingsAmount) : null;

        // Rebuild price HTML inline — mirrors price.liquid output structure
        let priceHTML = `<div class="text-2xl">`;

        if (compareFormatted) {
          priceHTML += `
            <div class="price price__sale">
              <span class="sr-only">Sale price</span>
              <span class="font-semibold text-secondary">${formatted}</span>
              <s class="ml-1 text-sm text-on-surface/50">
                <span class="sr-only">Regular price</span>${compareFormatted}
              </s>
            </div>`;
        } else {
          priceHTML += `
            <div class="price price__regular">
              <span class="font-semibold text-secondary">${formatted}</span>
            </div>`;
        }

        priceHTML += `</div>`;

        if (savingsFormatted) {
          priceHTML += `
            <span class="rounded-full bg-secondary/15 px-3 py-1 text-sm font-bold text-secondary">
              Save ${savingsFormatted}
            </span>`;
        }

        priceContainer.innerHTML = priceHTML;
      }
    });
  }
}
