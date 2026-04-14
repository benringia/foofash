import { addToCart, getCart } from "./cart.js";
import { formatMoney } from "./utils.js";

export function initBundle() {
  const dataEl = document.getElementById("bundle-data-json");
  if (!dataEl) return;

  let parsed;
  try {
    parsed = JSON.parse(dataEl.textContent);
  } catch {
    return;
  }

  const { items: rawItems, showSavings } = parsed;
  if (!Array.isArray(rawItems) || rawItems.length === 0) return;

  // State map: variantId (number) → item object with checked flag.
  // Unavailable items default to unchecked; all others default to checked
  // (including multi-variant items, which add using the first available variant).
  const state = new Map(
    rawItems.map((item) => [
      item.variantId,
      { ...item, checked: item.available },
    ]),
  );

  const totalEl = document.querySelector("[data-bundle-total]");
  const savingsEl = document.querySelector("[data-bundle-savings]");
  const addBtn = document.querySelector("[data-bundle-add]");
  const errorEl = document.querySelector("[data-bundle-error]");

  bindCheckboxes(state, totalEl, savingsEl, addBtn, showSavings);
  bindAddButton(state, addBtn, errorEl, savingsEl, totalEl, showSavings);
  recalculate(state, totalEl, savingsEl, addBtn, showSavings);
}

function bindCheckboxes(state, totalEl, savingsEl, addBtn, showSavings) {
  document.querySelectorAll("[data-bundle-checkbox]").forEach((checkbox) => {
    const variantId = parseInt(checkbox.dataset.variantId, 10);
    checkbox.addEventListener("change", () => {
      const item = state.get(variantId);
      if (item && item.available) {
        item.checked = checkbox.checked;
        recalculate(state, totalEl, savingsEl, addBtn, showSavings);
      }
    });
  });
}

function bindAddButton(
  state,
  addBtn,
  errorEl,
  savingsEl,
  totalEl,
  showSavings,
) {
  if (!addBtn) return;
  addBtn.addEventListener("click", () =>
    handleAdd(state, addBtn, errorEl, savingsEl, totalEl, showSavings),
  );
}

function recalculate(state, totalEl, savingsEl, addBtn, showSavings) {
  let total = 0;
  let compareTotal = 0;
  let hasCompare = false;

  for (const item of state.values()) {
    if (!item.checked) continue;
    total += item.price;
    if (item.compareAtPrice > item.price) {
      compareTotal += item.compareAtPrice;
      hasCompare = true;
    } else {
      compareTotal += item.price;
    }
  }

  if (totalEl) {
    totalEl.textContent = total > 0 ? formatMoney(total) : "\u2014";
  }

  if (savingsEl) {
    const savings = compareTotal - total;
    if (showSavings && hasCompare && savings > 0) {
      savingsEl.textContent = `You save ${formatMoney(savings)}`;
      savingsEl.classList.remove("hidden");
    } else {
      savingsEl.classList.add("hidden");
    }
  }

  if (addBtn) {
    const anyChecked = [...state.values()].some((i) => i.checked);
    addBtn.disabled = !anyChecked;
    addBtn.classList.toggle("opacity-50", !anyChecked);
    addBtn.classList.toggle("cursor-not-allowed", !anyChecked);
  }
}

async function handleAdd(
  state,
  addBtn,
  errorEl,
  savingsEl,
  totalEl,
  showSavings,
) {
  const items = [...state.entries()]
    .filter(([, item]) => item.checked && item.available)
    .map(([variantId]) => ({ id: variantId, quantity: 1 }));

  if (!items.length) return;

  const originalLabel = addBtn.textContent.trim();
  addBtn.disabled = true;
  addBtn.textContent = "Adding\u2026";
  if (errorEl) errorEl.classList.add("hidden");

  try {
    await addToCart(items);
    const cart = await getCart();
    document.dispatchEvent(
      new CustomEvent("foofash:cart-updated", { detail: { cart } }),
    );
  } catch {
    if (errorEl) {
      errorEl.textContent = "Something went wrong. Please try again.";
      errorEl.classList.remove("hidden");
    }
  } finally {
    addBtn.disabled = false;
    addBtn.textContent = originalLabel;
    recalculate(state, totalEl, savingsEl, addBtn, showSavings);
  }
}
