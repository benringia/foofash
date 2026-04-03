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
  const img = product.image
    ? `<img src="${product.image}" alt="" width="48" height="48" class="h-12 w-12 flex-none rounded object-cover">`
    : `<div class="h-12 w-12 flex-none rounded bg-gray-100" aria-hidden="true"></div>`;

  return `<li role="option" aria-selected="false" data-predictive-search-item>
  <a href="${product.url}" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none" tabindex="-1">
    ${img}
    <span class="flex-1 font-medium text-gray-800 line-clamp-2">${product.title}</span>
  </a>
</li>`;
}

function renderResults(products, list, empty) {
  if (products.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");
  list.innerHTML = products.map(renderItem).join("");
}

function showResults(input, results) {
  results.classList.remove("hidden");
  input.setAttribute("aria-expanded", "true");
}

function hideResults(input, results) {
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
  });
}

function setActive(item, input, results) {
  clearActive(results);
  item.setAttribute("data-active", "");
  item.setAttribute("aria-selected", "true");
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
  } else if (e.key === "Enter" && activeIndex !== -1) {
    e.preventDefault();
    const link = items[activeIndex].querySelector("a");
    if (link) window.location.href = link.href;
  } else if (e.key === "Escape") {
    hideResults(input, results);
    input.focus();
  }
}

export function initPredictiveSearch() {
  const wrapper = document.querySelector("[data-predictive-search]");
  if (!wrapper) return;

  const input = wrapper.querySelector("[data-predictive-search-input]");
  const results = wrapper.querySelector("[data-predictive-search-results]");
  const list = wrapper.querySelector("[data-predictive-search-list]");
  const empty = wrapper.querySelector("[data-predictive-search-empty]");

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();

    if (!q) {
      hideResults(input, results);
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const products = await fetchResults(q);
        renderResults(products, list, empty);
        showResults(input, results);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, 300);
  });

  input.addEventListener("keydown", (e) => handleKeydown(e, input, results));

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) hideResults(input, results);
  });
}
