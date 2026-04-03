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

    // Keep variant in sync — read the selected value from the form's variant selector
    const variantSelector = form.querySelector("[data-variant-selector]");
    if (variantSelector) {
      const selectedOption = variantSelector.querySelector(
        "option:not([disabled]):checked",
      );
      const isAvailable = selectedOption !== null;
      stickyBtn.disabled = !isAvailable;
      if (!isAvailable) return;
    }

    form.requestSubmit(mainAtc);
  });

  // Mirror disabled state onto sticky button when variant changes
  const variantSelector = document.querySelector("[data-variant-selector]");
  if (variantSelector) {
    variantSelector.addEventListener("change", () => {
      const selected = variantSelector.options[variantSelector.selectedIndex];
      const available = !selected.disabled;
      stickyBtn.disabled = !available;
      stickyBtn.setAttribute("aria-disabled", String(!available));
      stickyBtn.textContent = available ? "Add to cart" : "Sold out";
    });
  }
}
