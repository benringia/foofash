async function y() {
  const t = await fetch("/cart.js");
  if (!t.ok) throw new Error("Failed to fetch cart");
  return t.json();
}
async function b(t) {
  const a = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: t }),
  });
  if (!a.ok) throw new Error("Failed to add to cart");
  return a.json();
}
async function u(t, a) {
  const e = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: t, quantity: a }),
  });
  if (!e.ok) throw new Error("Failed to update cart");
  return e.json();
}
async function v(t) {
  return u(t, 0);
}
let o = !1,
  s = null;
function m(t) {
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
        <p class="text-sm font-semibold text-gray-900">${m(t.final_line_price)}</p>
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
function d(t) {
  const a = document.querySelector("[data-cart-items]"),
    e = document.querySelector("[data-cart-empty]"),
    r = document.querySelectorAll("[data-cart-subtotal]"),
    n = document.querySelectorAll("[data-cart-count]");
  (a && (a.innerHTML = t.items.map(h).join("")),
    e && e.classList.toggle("hidden", t.item_count > 0),
    r.forEach((i) => {
      i.textContent = m(t.total_price);
    }),
    n.forEach((i) => {
      i.textContent = t.item_count;
    }));
}
function f() {
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
function l() {
  const t = document.querySelector("[data-cart-drawer]"),
    a = document.querySelector("[data-cart-overlay]");
  t &&
    (a == null || a.classList.add("hidden"),
    t.classList.add("translate-x-full"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    s == null || s.focus());
}
function w() {
  (document.addEventListener("click", async (t) => {
    if (
      t.target.closest("[data-cart-toggle]") &&
      ((s = t.target.closest("[data-cart-toggle]")), !o)
    ) {
      o = !0;
      try {
        const a = await y();
        (d(a), f());
      } catch (a) {
        console.error("Cart open failed:", a);
      } finally {
        o = !1;
      }
    }
  }),
    document.addEventListener("click", (t) => {
      t.target.closest("[data-cart-close]") && l();
    }),
    document.addEventListener("click", (t) => {
      t.target.matches("[data-cart-overlay]") && l();
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key === "Escape") {
        const a = document.querySelector("[data-cart-drawer]");
        a && a.getAttribute("aria-hidden") === "false" && l();
      }
    }),
    document.addEventListener("submit", async (t) => {
      var n, i;
      const a = t.target.closest("[data-cart-form]");
      if (!a || (t.preventDefault(), o)) return;
      o = !0;
      const e = a.querySelector('[type="submit"]'),
        r = e == null ? void 0 : e.textContent;
      e && (e.textContent = "Adding…");
      try {
        const c =
            (n = a.querySelector('[name="id"]')) == null ? void 0 : n.value,
          g = parseInt(
            ((i = a.querySelector('[name="quantity"]')) == null
              ? void 0
              : i.value) ?? "1",
            10,
          );
        await b([{ id: c, quantity: g }]);
        const p = await y();
        (d(p), f());
      } catch (c) {
        console.error("Add to cart failed:", c);
      } finally {
        (e && (e.textContent = r), (o = !1));
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-quantity-decrease]");
      if (!a || o) return;
      const e = a.closest("[data-line-item]"),
        r = e == null ? void 0 : e.dataset.itemKey,
        n = e == null ? void 0 : e.querySelector("[data-quantity-input]");
      if (!r || !n) return;
      const i = Math.max(0, parseInt(n.value, 10) - 1);
      o = !0;
      try {
        const c = await u(r, i);
        d(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        o = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-quantity-increase]");
      if (!a || o) return;
      const e = a.closest("[data-line-item]"),
        r = e == null ? void 0 : e.dataset.itemKey,
        n = e == null ? void 0 : e.querySelector("[data-quantity-input]");
      if (!r || !n) return;
      const i = parseInt(n.value, 10) + 1;
      o = !0;
      try {
        const c = await u(r, i);
        d(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        o = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const a = t.target.closest("[data-remove-item]");
      if (!a || o) return;
      const e = a.closest("[data-line-item]"),
        r = e == null ? void 0 : e.dataset.itemKey;
      if (r) {
        o = !0;
        try {
          const n = await v(r);
          d(n);
        } catch (n) {
          console.error("Remove item failed:", n);
        } finally {
          o = !1;
        }
      }
    }));
}
function x() {
  const t = document.querySelector("[data-variant-selector]");
  t &&
    t.addEventListener("change", () => {
      const a = t.value,
        e = document.querySelector("[data-add-to-cart]");
      e && (e.dataset.variantId = a);
    });
}
function q() {
  const t = document.querySelectorAll("[data-modal-trigger]");
  t.length &&
    (t.forEach((a) => {
      a.addEventListener("click", () => {
        const e = a.dataset.modalTrigger,
          r = document.getElementById(e);
        r && (r.removeAttribute("hidden"), r.focus());
      });
    }),
    document.addEventListener("keydown", (a) => {
      if (a.key !== "Escape") return;
      const e = document.querySelector("[data-modal]:not([hidden])");
      e && e.setAttribute("hidden", "");
    }));
}
function S() {
  const t = document.querySelectorAll("[data-accordion]");
  t.length &&
    t.forEach((a) => {
      const e = a.querySelector("[data-accordion-trigger]"),
        r = a.querySelector("[data-accordion-panel]");
      !e ||
        !r ||
        e.addEventListener("click", () => {
          const n = e.getAttribute("aria-expanded") === "true";
          (e.setAttribute("aria-expanded", String(!n)), (r.hidden = n));
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  (w(), x(), q(), S());
});
