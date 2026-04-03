function d() {
  const e = document.querySelector("[data-cart-form]");
  e &&
    e.addEventListener("submit", async (n) => {
      n.preventDefault();
      const t = new FormData(e);
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(t)),
      });
    });
}
function o() {
  const e = document.querySelector("[data-variant-selector]");
  e &&
    e.addEventListener("change", () => {
      const n = e.value,
        t = document.querySelector("[data-add-to-cart]");
      t && (t.dataset.variantId = n);
    });
}
function c() {
  const e = document.querySelectorAll("[data-modal-trigger]");
  e.length &&
    (e.forEach((n) => {
      n.addEventListener("click", () => {
        const t = n.dataset.modalTrigger,
          r = document.getElementById(t);
        r && (r.removeAttribute("hidden"), r.focus());
      });
    }),
    document.addEventListener("keydown", (n) => {
      if (n.key !== "Escape") return;
      const t = document.querySelector("[data-modal]:not([hidden])");
      t && t.setAttribute("hidden", "");
    }));
}
function i() {
  const e = document.querySelectorAll("[data-accordion]");
  e.length &&
    e.forEach((n) => {
      const t = n.querySelector("[data-accordion-trigger]"),
        r = n.querySelector("[data-accordion-panel]");
      !t ||
        !r ||
        t.addEventListener("click", () => {
          const a = t.getAttribute("aria-expanded") === "true";
          (t.setAttribute("aria-expanded", String(!a)), (r.hidden = a));
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  (d(), o(), c(), i());
});
