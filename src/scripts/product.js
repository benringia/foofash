export function initProduct() {
  const variantSelector = document.querySelector("[data-variant-selector]");
  if (!variantSelector) return;

  variantSelector.addEventListener("change", () => {
    const selectedVariant = variantSelector.value;
    const addToCartBtn = document.querySelector("[data-add-to-cart]");
    if (addToCartBtn) {
      addToCartBtn.dataset.variantId = selectedVariant;
    }
  });
}
