import { formatMoney } from "./utils.js";

export function initProduct() {
  // ── Variant data ──────────────────────────────────────────────────────────
  const variantsData = JSON.parse(
    document.getElementById("product-variants-json")?.textContent || "[]",
  );

  // ── Quantity stepper ───────────────────────────────────────────────────────
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

  // ── Gallery image switcher ─────────────────────────────────────────────────
  const thumbnails = document.querySelectorAll("[data-thumbnail]");
  const mainImage = document.querySelector("[data-main-image]");

  function syncThumbnailActive(activeThumb) {
    thumbnails.forEach((t) => {
      const isActive = t === activeThumb;
      t.setAttribute("aria-pressed", String(isActive));
      t.classList.toggle("ring-primary", isActive);
      t.classList.toggle("ring-transparent", !isActive);
    });
  }

  function syncThumbnailToImage(imageUrl) {
    const match = [...thumbnails].find((t) => t.dataset.imageUrl === imageUrl);
    if (match) syncThumbnailActive(match);
  }

  thumbnails.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      if (mainImage && thumb.dataset.imageUrl) {
        mainImage.srcset = "";
        mainImage.src = thumb.dataset.imageUrl;
      }
      syncThumbnailActive(thumb);
    });
  });

  // ── Price update ───────────────────────────────────────────────────────────
  const priceContainer = document.querySelector("[data-pdp-price]");

  function updatePrice(variant) {
    if (!priceContainer) return;

    const formatted = formatMoney(variant.price);
    const compareFormatted =
      variant.compare_at_price > variant.price
        ? formatMoney(variant.compare_at_price)
        : null;
    const savingsAmount = variant.compare_at_price - variant.price;
    const savingsFormatted =
      savingsAmount > 0 ? formatMoney(savingsAmount) : null;

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

    // Trigger pulse animation
    priceContainer.classList.remove("price-pulse");
    void priceContainer.offsetWidth; // force reflow
    priceContainer.classList.add("price-pulse");
  }

  // ── Multi-option variant resolution ───────────────────────────────────────
  if (!variantsData.length) return;

  const optionBtns = document.querySelectorAll("[data-option-btn]");
  const variantSelector = document.querySelector("[data-variant-selector]");
  const addToCartBtn = document.querySelector("[data-add-to-cart]");

  // Single-variant products: no option buttons, nothing to wire up
  if (!optionBtns.length) return;

  function getInitialVariant() {
    const params = new URLSearchParams(window.location.search);
    const urlId = parseInt(params.get("variant"), 10);
    return (
      variantsData.find((v) => v.id === urlId) ||
      variantsData.find((v) => v.available) ||
      variantsData[0]
    );
  }

  const initialVariant = getInitialVariant();
  const selectedOptions = initialVariant ? [...initialVariant.options] : [];

  function findVariant(options) {
    return (
      variantsData.find((v) =>
        v.options.every((opt, i) => opt === options[i]),
      ) || null
    );
  }

  function isOptionAvailable(optionIndex, value) {
    return variantsData.some(
      (v) =>
        v.available &&
        v.options[optionIndex] === value &&
        selectedOptions.every(
          (opt, i) => i === optionIndex || v.options[i] === opt,
        ),
    );
  }

  function updateAllPillStates() {
    optionBtns.forEach((btn) => {
      const optionIndex = parseInt(btn.dataset.optionIndex, 10);
      const value = btn.dataset.optionValue;
      const isSelected = selectedOptions[optionIndex] === value;
      const isAvailable = isOptionAvailable(optionIndex, value);

      btn.setAttribute("aria-pressed", String(isSelected));

      btn.classList.toggle("bg-primary", isSelected);
      btn.classList.toggle("text-on-primary", isSelected);
      btn.classList.toggle("shadow-bubbly", isSelected);
      btn.classList.toggle("bg-surface", !isSelected);
      btn.classList.toggle("text-on-surface", !isSelected);
      btn.classList.toggle("shadow-ambient", !isSelected);
      btn.classList.toggle("hover:bg-primary/10", !isSelected);

      btn.classList.toggle("opacity-40", !isAvailable);
      btn.classList.toggle("cursor-not-allowed", !isAvailable);
      btn.classList.toggle("line-through", !isAvailable && !isSelected);
    });
  }

  function applyVariant(variant) {
    // 1. Sync hidden select — bridges to sticky-atc.js via change event
    if (variantSelector) {
      variantSelector.value = variant ? String(variant.id) : "";
      variantSelector.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 2. ATC button
    if (addToCartBtn) {
      if (!variant) {
        addToCartBtn.disabled = true;
        addToCartBtn.setAttribute("aria-disabled", "true");
        addToCartBtn.textContent = "Select options";
      } else if (!variant.available) {
        addToCartBtn.disabled = true;
        addToCartBtn.setAttribute("aria-disabled", "true");
        addToCartBtn.textContent = "Sold Out";
      } else {
        addToCartBtn.disabled = false;
        addToCartBtn.setAttribute("aria-disabled", "false");
        addToCartBtn.textContent = "Add to Cart";
      }
    }

    // 3. Price
    if (variant) updatePrice(variant);

    // 4. Variant image
    if (variant?.featured_image && mainImage) {
      mainImage.srcset = "";
      mainImage.src = variant.featured_image;
      syncThumbnailToImage(variant.featured_image);
    }

    // 5. URL
    if (variant) {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", variant.id);
      history.replaceState({}, "", url);
    }
  }

  // ── Pill click handler ─────────────────────────────────────────────────────
  optionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const optionIndex = parseInt(btn.dataset.optionIndex, 10);
      const value = btn.dataset.optionValue;

      selectedOptions[optionIndex] = value;

      const label = document.querySelector(
        `[data-selected-option-label="${optionIndex}"]`,
      );
      if (label) label.textContent = value;

      updateAllPillStates();

      const variant = findVariant(selectedOptions);
      applyVariant(variant);
    });
  });

  // ── Init: sync image + pill states + URL for the preselected variant ─────────
  if (initialVariant) {
    updateAllPillStates();

    // Sync main image to initial variant without triggering a full applyVariant
    // (price and ATC are already correct from Liquid server-side render)
    if (initialVariant.featured_image && mainImage) {
      mainImage.srcset = "";
      mainImage.src = initialVariant.featured_image;
      syncThumbnailToImage(initialVariant.featured_image);
    }

    const params = new URLSearchParams(window.location.search);
    if (!params.get("variant")) {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", initialVariant.id);
      history.replaceState({}, "", url);
    }
  }
}
