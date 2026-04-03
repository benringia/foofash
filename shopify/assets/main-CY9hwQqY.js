async function g() {
  const t = await fetch("/cart.js");
  if (!t.ok) throw new Error("Failed to fetch cart");
  return t.json();
}
async function h(t) {
  const e = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: t }),
  });
  if (!e.ok) throw new Error("Failed to add to cart");
  return e.json();
}
async function m(t, e) {
  const a = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: t, quantity: e }),
  });
  if (!a.ok) throw new Error("Failed to update cart");
  return a.json();
}
async function q(t) {
  return m(t, 0);
}
let i = !1,
  u = null;
function b(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(t / 100);
}
function w(t) {
  const e = t.image
      ? `<img src="${t.image}" alt="${t.title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-md object-cover bg-gray-100">`
      : '<div class="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true"></div>',
    a =
      t.variant_title && t.variant_title !== "Default Title"
        ? `<p class="text-xs text-gray-500">${t.variant_title}</p>`
        : "";
  return `
    <li class="flex gap-4 py-4 border-b border-gray-100 last:border-0" data-line-item data-item-key="${t.key}">
      ${e}
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${t.product_title}</p>
        ${a}
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
function d(t) {
  const e = document.querySelector("[data-cart-items]"),
    a = document.querySelector("[data-cart-empty]"),
    r = document.querySelectorAll("[data-cart-subtotal]"),
    n = document.querySelectorAll("[data-cart-count]");
  (e && (e.innerHTML = t.items.map(w).join("")),
    a && a.classList.toggle("hidden", t.item_count > 0),
    r.forEach((o) => {
      o.textContent = b(t.total_price);
    }),
    n.forEach((o) => {
      o.textContent = t.item_count;
    }));
}
function p() {
  const t = document.querySelector("[data-cart-drawer]"),
    e = document.querySelector("[data-cart-overlay]");
  if (!t) return;
  (e == null || e.classList.remove("hidden"),
    t.classList.remove("translate-x-full"),
    t.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"));
  const a = t.querySelector("[data-cart-close]");
  a == null || a.focus();
}
function y() {
  const t = document.querySelector("[data-cart-drawer]"),
    e = document.querySelector("[data-cart-overlay]");
  t &&
    (e == null || e.classList.add("hidden"),
    t.classList.add("translate-x-full"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    u == null || u.focus());
}
function S() {
  (document.addEventListener("click", async (t) => {
    if (
      t.target.closest("[data-cart-toggle]") &&
      ((u = t.target.closest("[data-cart-toggle]")), !i)
    ) {
      i = !0;
      try {
        const e = await g();
        (d(e), p());
      } catch (e) {
        console.error("Cart open failed:", e);
      } finally {
        i = !1;
      }
    }
  }),
    document.addEventListener("click", (t) => {
      t.target.closest("[data-cart-close]") && y();
    }),
    document.addEventListener("click", (t) => {
      t.target.matches("[data-cart-overlay]") && y();
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key === "Escape") {
        const e = document.querySelector("[data-cart-drawer]");
        e && e.getAttribute("aria-hidden") === "false" && y();
      }
    }),
    document.addEventListener("submit", async (t) => {
      var n, o;
      const e = t.target.closest("[data-cart-form]");
      if (!e || (t.preventDefault(), i)) return;
      i = !0;
      const a = e.querySelector('[type="submit"]'),
        r = a == null ? void 0 : a.textContent;
      a && (a.textContent = "Adding…");
      try {
        const c =
            (n = e.querySelector('[name="id"]')) == null ? void 0 : n.value,
          v = parseInt(
            ((o = e.querySelector('[name="quantity"]')) == null
              ? void 0
              : o.value) ?? "1",
            10,
          );
        await h([{ id: c, quantity: v }]);
        const s = await g();
        (d(s), p());
      } catch (c) {
        console.error("Add to cart failed:", c);
      } finally {
        (a && (a.textContent = r), (i = !1));
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-quantity-decrease]");
      if (!e || i) return;
      const a = e.closest("[data-line-item]"),
        r = a == null ? void 0 : a.dataset.itemKey,
        n = a == null ? void 0 : a.querySelector("[data-quantity-input]");
      if (!r || !n) return;
      const o = Math.max(0, parseInt(n.value, 10) - 1);
      i = !0;
      try {
        const c = await m(r, o);
        d(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        i = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-quantity-increase]");
      if (!e || i) return;
      const a = e.closest("[data-line-item]"),
        r = a == null ? void 0 : a.dataset.itemKey,
        n = a == null ? void 0 : a.querySelector("[data-quantity-input]");
      if (!r || !n) return;
      const o = parseInt(n.value, 10) + 1;
      i = !0;
      try {
        const c = await m(r, o);
        d(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        i = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-remove-item]");
      if (!e || i) return;
      const a = e.closest("[data-line-item]"),
        r = a == null ? void 0 : a.dataset.itemKey;
      if (r) {
        i = !0;
        try {
          const n = await q(r);
          d(n);
        } catch (n) {
          console.error("Remove item failed:", n);
        } finally {
          i = !1;
        }
      }
    }));
}
function k() {
  const t = document.querySelector("[data-main-atc]"),
    e = document.querySelector("[data-sticky-atc]"),
    a = document.querySelector("[data-sticky-atc-btn]");
  if (!t || !e || !a) return;
  (new IntersectionObserver(
    ([o]) => {
      const c = o.isIntersecting;
      (e.classList.toggle("translate-y-full", c),
        e.setAttribute("aria-hidden", String(c)));
    },
    { threshold: 0 },
  ).observe(t),
    a.addEventListener("click", () => {
      const o = t.closest("form");
      if (!o) return;
      const c = o.querySelector("[data-variant-selector]");
      if (c) {
        const s = c.querySelector("option:not([disabled]):checked") !== null;
        if (((a.disabled = !s), !s)) return;
      }
      o.requestSubmit(t);
    }));
  const n = document.querySelector("[data-variant-selector]");
  n &&
    n.addEventListener("change", () => {
      const c = !n.options[n.selectedIndex].disabled;
      ((a.disabled = !c),
        a.setAttribute("aria-disabled", String(!c)),
        (a.textContent = c ? "Add to cart" : "Sold out"));
    });
}
let l = !1;
function x() {
  var a;
  const t = document.querySelector("[data-quick-view-modal]"),
    e = document.querySelector("[data-quick-view-overlay]");
  t &&
    (e == null || e.classList.remove("hidden"),
    t.classList.remove("hidden"),
    t.classList.add("flex"),
    t.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"),
    (a = t.querySelector("[data-quick-view-close]")) == null || a.focus());
}
function f() {
  const t = document.querySelector("[data-quick-view-modal]"),
    e = document.querySelector("[data-quick-view-overlay]");
  if (!t) return;
  (e == null || e.classList.add("hidden"),
    t.classList.add("hidden"),
    t.classList.remove("flex"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""));
  const a = t.querySelector("[data-quick-view-content]");
  a && (a.innerHTML = "");
}
async function L(t) {
  const e = await fetch(`/products/${t}?view=quick-view`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!e.ok) throw new Error(`Failed to load product: ${e.status}`);
  return e.text();
}
function E() {
  (document.addEventListener("click", async (t) => {
    const e = t.target.closest("[data-quick-view-trigger]");
    if (!e || (t.preventDefault(), l)) return;
    l = !0;
    const a = e.dataset.productHandle;
    if (!a) {
      l = !1;
      return;
    }
    const r = document.querySelector("[data-quick-view-content]");
    (r &&
      (r.innerHTML = '<p class="text-center text-gray-400 py-8">Loading…</p>'),
      x());
    try {
      const n = await L(a),
        o = new DOMParser().parseFromString(n, "text/html"),
        c = o.querySelector("main") ?? o.body;
      r && (r.innerHTML = c.innerHTML);
    } catch {
      r &&
        (r.innerHTML =
          '<p class="text-center text-red-500 py-8">Could not load product. <a href="/products/' +
          a +
          '" class="underline">View full page</a></p>');
    } finally {
      l = !1;
    }
  }),
    document.addEventListener("click", (t) => {
      t.target.closest("[data-quick-view-close]") && f();
    }),
    document.addEventListener("click", (t) => {
      t.target.matches("[data-quick-view-overlay]") && f();
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key !== "Escape") return;
      const e = document.querySelector("[data-quick-view-modal]");
      e && e.getAttribute("aria-hidden") === "false" && f();
    }));
}
function A() {
  const t = document.querySelector("[data-variant-selector]");
  t &&
    t.addEventListener("change", () => {
      const e = t.value,
        a = document.querySelector("[data-add-to-cart]");
      a && (a.dataset.variantId = e);
    });
}
function C() {
  const t = document.querySelectorAll("[data-modal-trigger]");
  t.length &&
    (t.forEach((e) => {
      e.addEventListener("click", () => {
        const a = e.dataset.modalTrigger,
          r = document.getElementById(a);
        r && (r.removeAttribute("hidden"), r.focus());
      });
    }),
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const a = document.querySelector("[data-modal]:not([hidden])");
      a && a.setAttribute("hidden", "");
    }));
}
function M() {
  const t = document.querySelectorAll("[data-accordion]");
  t.length &&
    t.forEach((e) => {
      const a = e.querySelector("[data-accordion-trigger]"),
        r = e.querySelector("[data-accordion-panel]");
      !a ||
        !r ||
        a.addEventListener("click", () => {
          const n = a.getAttribute("aria-expanded") === "true";
          (a.setAttribute("aria-expanded", String(!n)), (r.hidden = n));
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  (S(), k(), E(), A(), C(), M());
});
