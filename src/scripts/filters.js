export function initCollection() {
  initSortSelect();
  initMobileFilters();
}

function initSortSelect() {
  const select = document.querySelector("[data-sort-select]");
  if (!select) return;

  select.addEventListener("change", () => {
    const url = new URL(window.location.href);
    url.searchParams.set("sort_by", select.value);
    window.location.href = url.toString();
  });
}

function initMobileFilters() {
  const openBtn = document.querySelector("[data-filter-open]");
  const closeBtn = document.querySelector("[data-filter-close]");
  const panel = document.querySelector("[data-filter-panel]");
  const overlay = document.querySelector("[data-filter-overlay]");
  if (!openBtn || !panel) return;

  function open() {
    panel.classList.remove("-translate-x-full");
    overlay?.classList.remove("hidden");
    openBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
  }

  function close() {
    panel.classList.add("-translate-x-full");
    overlay?.classList.add("hidden");
    openBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    openBtn.focus();
  }

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.classList.contains("-translate-x-full")) {
      close();
    }
  });
}
