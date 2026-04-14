import { formatAmount } from "./utils.js";

let abortController = null;
let debounceTimer = null;

async function fetchResults(query) {
  if (abortController) abortController.abort();
  abortController = new AbortController();

  const params = new URLSearchParams({
    q: query,
    "resources[type]": "product",
    "resources[limit]": "6",
    "resources[options][unavailable_products]": "last",
  });

  const res = await fetch(`/search/suggest.json?${params}`, {
    signal: abortController.signal,
  });

  if (!res.ok) throw new Error("Search failed");

  const data = await res.json();
  return data.resources.results.products ?? [];
}

function renderItem(product) {
  const imgSrc = product.featured_image?.url ?? product.image;
  const img = imgSrc
    ? `<img src="${imgSrc}" alt="" width="56" height="56" loading="lazy" class="h-14 w-14 flex-none rounded-xl object-cover">`
    : `<div class="h-14 w-14 flex-none rounded-xl bg-surface-container" aria-hidden="true"></div>`;

  const onSale =
    product.compare_at_price_max &&
    Number(product.compare_at_price_max) > Number(product.price);

  const priceHtml = onSale
    ? `<span class="font-semibold text-secondary">${formatAmount(Number(product.price))}</span><s class="ml-1 text-xs text-on-surface/40">${formatAmount(Number(product.compare_at_price_max))}</s>`
    : `<span class="font-semibold text-on-surface">${formatAmount(Number(product.price))}</span>`;

  return `<li role="option" aria-selected="false" data-predictive-search-item>
  <a href="${product.url}" class="flex items-center gap-3 mx-2 rounded-xl px-3 py-2 hover:bg-surface-container/60 focus:bg-surface-container/60 focus:outline-none" tabindex="-1">
    ${img}
    <span class="flex min-w-0 flex-1 flex-col gap-0.5">
      <span class="line-clamp-1 text-sm font-semibold text-on-surface">${product.title}</span>
      <span class="text-xs">${priceHtml}</span>
    </span>
  </a>
</li>`;
}

// Show exactly one slot; footer always mirrors body visibility.
function setSlot(loading, error, empty, body, footer, slot) {
  loading.classList.toggle("hidden", slot !== "loading");
  error.classList.toggle("hidden", slot !== "error");
  empty.classList.toggle("hidden", slot !== "empty");
  body.classList.toggle("hidden", slot !== "body");
  footer.classList.toggle("hidden", slot !== "body");
}

function renderResults(
  products,
  query,
  list,
  loading,
  error,
  empty,
  body,
  footer,
  viewAll,
) {
  if (products.length === 0) {
    list.innerHTML = "";
    setSlot(loading, error, empty, body, footer, "empty");
    return;
  }
  list.innerHTML = products.map(renderItem).join("");
  viewAll.href = `/search?q=${encodeURIComponent(query)}&type=product`;
  setSlot(loading, error, empty, body, footer, "body");
}

function showPanel(input, results) {
  results.classList.remove("hidden");
  input.setAttribute("aria-expanded", "true");
}

function hidePanel(input, results) {
  results.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  clearActive(results);
}

function getItems(results) {
  return Array.from(results.querySelectorAll("[data-predictive-search-item]"));
}

function clearActive(results) {
  getItems(results).forEach((item) => {
    item.removeAttribute("data-active");
    item.setAttribute("aria-selected", "false");
    item.querySelector("a")?.classList.remove("bg-surface-container/60");
  });
}

function setActive(item, input, results) {
  clearActive(results);
  item.setAttribute("data-active", "");
  item.setAttribute("aria-selected", "true");
  item.querySelector("a").classList.add("bg-surface-container/60");
  input.setAttribute("aria-activedescendant", item.querySelector("a").id || "");
  item.scrollIntoView({ block: "nearest" });
}

function handleKeydown(e, input, results) {
  if (results.classList.contains("hidden")) return;

  const items = getItems(results);
  if (!items.length) return;

  const activeIndex = items.findIndex((item) =>
    item.hasAttribute("data-active"),
  );

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const next = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    setActive(items[next], input, results);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const prev = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
    setActive(items[prev], input, results);
  } else if (e.key === "Home") {
    e.preventDefault();
    setActive(items[0], input, results);
  } else if (e.key === "End") {
    e.preventDefault();
    setActive(items[items.length - 1], input, results);
  } else if (e.key === "Enter" && activeIndex !== -1) {
    e.preventDefault();
    const link = items[activeIndex].querySelector("a");
    if (link) window.location.href = link.href;
  } else if (e.key === "Escape") {
    hidePanel(input, results);
    input.focus();
  }
}

export function initPredictiveSearch() {
  const wrapper = document.querySelector("[data-predictive-search]");
  if (!wrapper) return;

  const input = wrapper.querySelector("[data-predictive-search-input]");
  const results = wrapper.querySelector("[data-predictive-search-results]");
  const list = wrapper.querySelector("[data-predictive-search-list]");
  const loading = wrapper.querySelector("[data-predictive-search-loading]");
  const error = wrapper.querySelector("[data-predictive-search-error]");
  const empty = wrapper.querySelector("[data-predictive-search-empty]");
  const body = wrapper.querySelector("[data-predictive-search-body]");
  const footer = wrapper.querySelector("[data-predictive-search-footer]");
  const viewAll = wrapper.querySelector("[data-predictive-search-view-all]");

  if (
    !input ||
    !results ||
    !list ||
    !loading ||
    !error ||
    !empty ||
    !body ||
    !footer ||
    !viewAll
  )
    return;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();

    if (!q) {
      hidePanel(input, results);
      return;
    }

    showPanel(input, results);
    setSlot(loading, error, empty, body, footer, "loading");

    debounceTimer = setTimeout(async () => {
      try {
        const products = await fetchResults(q);
        renderResults(
          products,
          q,
          list,
          loading,
          error,
          empty,
          body,
          footer,
          viewAll,
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setSlot(loading, error, empty, body, footer, "error");
        }
      }
    }, 300);
  });

  input.addEventListener("keydown", (e) => handleKeydown(e, input, results));

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) hidePanel(input, results);
  });
}
