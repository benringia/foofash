async function m() {
  const t = await fetch("/cart.js");
  if (!t.ok) throw new Error("Failed to fetch cart");
  return t.json();
}
async function v(t) {
  const a = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: t }),
  });
  if (!a.ok) throw new Error("Failed to add to cart");
  return a.json();
}
async function y(t, a) {
  const e = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: t, quantity: a }),
  });
  if (!e.ok) throw new Error("Failed to update cart");
  return e.json();
}
async function p(t) {
  return y(t, 0);
}
let i = !1,
  l = null;
function b(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(t / 100);
}
function h(t) {
  const a = t.image
      ? `<img src="${t.image}" alt="${t.title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-md object-cover bg-gray-100">`
      : '<div class="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true"></div>',
    e =
      t.variant_title && t.variant_title !== "Default Title"
        ? `<p class="text-xs text-gray-500">${t.variant_title}</p>`
        : "";
  return `
    <li class="flex gap-4 py-4 border-b border-gray-100 last:border-0" data-line-item data-item-key="${t.key}">
      ${a}
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${t.product_title}</p>
        ${e}
        <p class="text-sm font-semibold text-gray-900">${b(t.final_line_price)}</p>
        <div class="flex items-center gap-2 mt-1">
          <button
            type="button"
            data-quantity-decrease
            aria-label="Decrease quantity"
            class="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >−</button>
          <input
            type="number"
            data-quantity-input
            value="${t.quantity}"
            min="0"
            class="w-10 text-center text-sm border border-gray-300 rounded py-0.5"
            aria-label="Quantity for ${t.product_title}"
          >
          <button
            type="button"
            data-quantity-increase
            aria-label="Increase quantity"
            class="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >+</button>
          <button
            type="button"
            data-remove-item
            aria-label="Remove ${t.product_title}"
            class="ml-auto text-xs text-gray-400 hover:text-red-500 underline"
          >Remove</button>
        </div>
      </div>
    </li>
  `.trim();
}
function s(t) {
  const a = document.querySelector("[data-cart-items]"),
    e = document.querySelector("[data-cart-empty]"),
    o = document.querySelectorAll("[data-cart-subtotal]"),
    r = document.querySelectorAll("[data-cart-count]");
  (a && (a.innerHTML = t.items.map(h).join("")),
    e && e.classList.toggle("hidden", t.item_count > 0),
    o.forEach((c) => {
      c.textContent = b(t.total_price);
    }),
    r.forEach((c) => {
      c.textContent = t.item_count;
    }));
}
function g() {
  const t = document.querySelector("[data-cart-drawer]"),
    a = document.querySelector("[data-cart-overlay]");
  if (!t) return;
  (a == null || a.classList.remove("hidden"),
    t.classList.remove("translate-x-full"),
    t.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"));
  const e = t.querySelector("[data-cart-close]");
  e == null || e.focus();
}
function u() {
  const t = document.querySelector("[data-cart-drawer]"),
    a = document.querySelector("[data-cart-overlay]");
  t &&
    (a == null || a.classList.add("hidden"),
    t.classList.add("translate-x-full"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    l == null || l.focus());
}
function S() {
  (document.addEventListener("click", async (t) => {
    if (
      t.target.closest("[data-cart-toggle]") &&
      ((l = t.target.closest("[data-cart-toggle]")), !i)
    ) {
      i = !0;
      try {
        const a = await m();
        (s(a), g());
      } catch (a) {
        console.error("Cart open failed:", a);
      } finally {
        i = !1;
      }
    }
  }),
    document.addEventListener("click", (t) => {
      t.target.closest("[data-cart-close]") && u();
    }),
    document.addEventListener("click", (t) => {
      t.target.matches("[data-cart-overlay]") && u();
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key === "Escape") {
        const a = document.querySelector("[data-cart-drawer]");
        a && a.getAttribute("aria-hidden") === "false" && u();
      }
    }),
    document.addEventListener("submit", async (t) => {
      var r, c;
      const a = t.target.closest("[data-cart-form]");
      if (!a || (t.preventDefault(), i)) return;
      i = !0;
      const e = a.querySelector('[type="submit"]'),
        o = e == null ? void 0 : e.textContent;
      e && (e.textContent = "Adding…");
      try {
        const n =
            (r = a.querySelector('[name="id"]')) == null ? void 0 : r.value,
          f = parseInt(
            ((c = a.querySelector('[name="quantity"]')) == null
              ? void 0
              : c.value) ?? "1",
            10,
          );
        await v([{ id: n, quantity: f }]);
        const d = await m();
        (s(d), g());
      } catch (n) {
        console.error("Add to cart failed:", n);
      } finally {
        (e && (e.textContent = o), (i = !1));
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-quantity-decrease]");
      if (!a || i) return;
      const e = a.closest("[data-line-item]"),
        o = e == null ? void 0 : e.dataset.itemKey,
        r = e == null ? void 0 : e.querySelector("[data-quantity-input]");
      if (!o || !r) return;
      const c = Math.max(0, parseInt(r.value, 10) - 1);
      i = !0;
      try {
        const n = await y(o, c);
        s(n);
      } catch (n) {
        console.error("Quantity update failed:", n);
      } finally {
        i = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-quantity-increase]");
      if (!a || i) return;
      const e = a.closest("[data-line-item]"),
        o = e == null ? void 0 : e.dataset.itemKey,
        r = e == null ? void 0 : e.querySelector("[data-quantity-input]");
      if (!o || !r) return;
      const c = parseInt(r.value, 10) + 1;
      i = !0;
      try {
        const n = await y(o, c);
        s(n);
      } catch (n) {
        console.error("Quantity update failed:", n);
      } finally {
        i = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-remove-item]");
      if (!a || i) return;
      const e = a.closest("[data-line-item]"),
        o = e == null ? void 0 : e.dataset.itemKey;
      if (o) {
        i = !0;
        try {
          const r = await p(o);
          s(r);
        } catch (r) {
          console.error("Remove item failed:", r);
        } finally {
          i = !1;
        }
      }
    }));
}
function q() {
  const t = document.querySelector("[data-main-atc]"),
    a = document.querySelector("[data-sticky-atc]"),
    e = document.querySelector("[data-sticky-atc-btn]");
  if (!t || !a || !e) return;
  (new IntersectionObserver(
    ([c]) => {
      const n = c.isIntersecting;
      (a.classList.toggle("translate-y-full", n),
        a.setAttribute("aria-hidden", String(n)));
    },
    { threshold: 0 },
  ).observe(t),
    e.addEventListener("click", () => {
      const c = t.closest("form");
      if (!c) return;
      const n = c.querySelector("[data-variant-selector]");
      if (n) {
        const d = n.querySelector("option:not([disabled]):checked") !== null;
        if (((e.disabled = !d), !d)) return;
      }
      c.requestSubmit(t);
    }));
  const r = document.querySelector("[data-variant-selector]");
  r &&
    r.addEventListener("change", () => {
      const n = !r.options[r.selectedIndex].disabled;
      ((e.disabled = !n),
        e.setAttribute("aria-disabled", String(!n)),
        (e.textContent = n ? "Add to cart" : "Sold out"));
    });
}
function w() {
  const t = document.querySelector("[data-variant-selector]");
  t &&
    t.addEventListener("change", () => {
      const a = t.value,
        e = document.querySelector("[data-add-to-cart]");
      e && (e.dataset.variantId = a);
    });
}
function x() {
  const t = document.querySelectorAll("[data-modal-trigger]");
  t.length &&
    (t.forEach((a) => {
      a.addEventListener("click", () => {
        const e = a.dataset.modalTrigger,
          o = document.getElementById(e);
        o && (o.removeAttribute("hidden"), o.focus());
      });
    }),
    document.addEventListener("keydown", (a) => {
      if (a.key !== "Escape") return;
      const e = document.querySelector("[data-modal]:not([hidden])");
      e && e.setAttribute("hidden", "");
    }));
}
function E() {
  const t = document.querySelectorAll("[data-accordion]");
  t.length &&
    t.forEach((a) => {
      const e = a.querySelector("[data-accordion-trigger]"),
        o = a.querySelector("[data-accordion-panel]");
      !e ||
        !o ||
        e.addEventListener("click", () => {
          const r = e.getAttribute("aria-expanded") === "true";
          (e.setAttribute("aria-expanded", String(!r)), (o.hidden = r));
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  (S(), q(), w(), x(), E());
});
