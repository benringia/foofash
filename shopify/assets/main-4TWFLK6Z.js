async function q() {
  const t = await fetch("/cart.js");
  if (!t.ok) throw new Error("Failed to fetch cart");
  return t.json();
}
async function C(t) {
  const e = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: t }),
  });
  if (!e.ok) throw new Error("Failed to add to cart");
  return e.json();
}
async function g(t, e) {
  const r = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: t, quantity: e }),
  });
  if (!r.ok) throw new Error("Failed to update cart");
  return r.json();
}
async function I(t) {
  return g(t, 0);
}
let o = !1,
  p = null;
function E(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(t / 100);
}
function M(t) {
  const e = t.image
      ? `<img src="${t.image}" alt="${t.title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-md object-cover bg-gray-100">`
      : '<div class="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true"></div>',
    r =
      t.variant_title && t.variant_title !== "Default Title"
        ? `<p class="text-xs text-gray-500">${t.variant_title}</p>`
        : "";
  return `
    <li class="flex gap-4 py-4 border-b border-gray-100 last:border-0" data-line-item data-item-key="${t.key}">
      ${e}
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${t.product_title}</p>
        ${r}
        <p class="text-sm font-semibold text-gray-900">${E(t.final_line_price)}</p>
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
function l(t) {
  const e = document.querySelector("[data-cart-items]"),
    r = document.querySelector("[data-cart-empty]"),
    a = document.querySelectorAll("[data-cart-subtotal]"),
    n = document.querySelectorAll("[data-cart-count]");
  (e && (e.innerHTML = t.items.map(M).join("")),
    r && r.classList.toggle("hidden", t.item_count > 0),
    a.forEach((c) => {
      c.textContent = E(t.total_price);
    }),
    n.forEach((c) => {
      c.textContent = t.item_count;
    }));
}
function S() {
  const t = document.querySelector("[data-cart-drawer]"),
    e = document.querySelector("[data-cart-overlay]");
  if (!t) return;
  (e == null || e.classList.remove("hidden"),
    t.classList.remove("translate-x-full"),
    t.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"));
  const r = t.querySelector("[data-cart-close]");
  r == null || r.focus();
}
function h() {
  const t = document.querySelector("[data-cart-drawer]"),
    e = document.querySelector("[data-cart-overlay]");
  t &&
    (e == null || e.classList.add("hidden"),
    t.classList.add("translate-x-full"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    p == null || p.focus());
}
function T() {
  (document.addEventListener("click", async (t) => {
    if (
      t.target.closest("[data-cart-toggle]") &&
      ((p = t.target.closest("[data-cart-toggle]")), !o)
    ) {
      o = !0;
      try {
        const e = await q();
        (l(e), S());
      } catch (e) {
        console.error("Cart open failed:", e);
      } finally {
        o = !1;
      }
    }
  }),
    document.addEventListener("click", (t) => {
      t.target.closest("[data-cart-close]") && h();
    }),
    document.addEventListener("click", (t) => {
      t.target.matches("[data-cart-overlay]") && h();
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key === "Escape") {
        const e = document.querySelector("[data-cart-drawer]");
        e && e.getAttribute("aria-hidden") === "false" && h();
      }
    }),
    document.addEventListener("submit", async (t) => {
      var n, c;
      const e = t.target.closest("[data-cart-form]");
      if (!e || (t.preventDefault(), o)) return;
      o = !0;
      const r = e.querySelector('[type="submit"]'),
        a = r == null ? void 0 : r.textContent;
      r && (r.textContent = "Adding…");
      try {
        const i =
            (n = e.querySelector('[name="id"]')) == null ? void 0 : n.value,
          d = parseInt(
            ((c = e.querySelector('[name="quantity"]')) == null
              ? void 0
              : c.value) ?? "1",
            10,
          );
        await C([{ id: i, quantity: d }]);
        const s = await q();
        (l(s), S());
      } catch (i) {
        console.error("Add to cart failed:", i);
      } finally {
        (r && (r.textContent = a), (o = !1));
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-quantity-decrease]");
      if (!e || o) return;
      const r = e.closest("[data-line-item]"),
        a = r == null ? void 0 : r.dataset.itemKey,
        n = r == null ? void 0 : r.querySelector("[data-quantity-input]");
      if (!a || !n) return;
      const c = Math.max(0, parseInt(n.value, 10) - 1);
      o = !0;
      try {
        const i = await g(a, c);
        l(i);
      } catch (i) {
        console.error("Quantity update failed:", i);
      } finally {
        o = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-quantity-increase]");
      if (!e || o) return;
      const r = e.closest("[data-line-item]"),
        a = r == null ? void 0 : r.dataset.itemKey,
        n = r == null ? void 0 : r.querySelector("[data-quantity-input]");
      if (!a || !n) return;
      const c = parseInt(n.value, 10) + 1;
      o = !0;
      try {
        const i = await g(a, c);
        l(i);
      } catch (i) {
        console.error("Quantity update failed:", i);
      } finally {
        o = !1;
      }
    }),
    document.addEventListener("click", async (t) => {
      const e = t.target.closest("[data-remove-item]");
      if (!e || o) return;
      const r = e.closest("[data-line-item]"),
        a = r == null ? void 0 : r.dataset.itemKey;
      if (a) {
        o = !0;
        try {
          const n = await I(a);
          l(n);
        } catch (n) {
          console.error("Remove item failed:", n);
        } finally {
          o = !1;
        }
      }
    }));
}
function _() {
  const t = document.querySelector("[data-main-atc]"),
    e = document.querySelector("[data-sticky-atc]"),
    r = document.querySelector("[data-sticky-atc-btn]");
  if (!t || !e || !r) return;
  (new IntersectionObserver(
    ([c]) => {
      const i = c.isIntersecting;
      (e.classList.toggle("translate-y-full", i),
        e.setAttribute("aria-hidden", String(i)));
    },
    { threshold: 0 },
  ).observe(t),
    r.addEventListener("click", () => {
      const c = t.closest("form");
      if (!c) return;
      const i = c.querySelector("[data-variant-selector]");
      if (i) {
        const s = i.querySelector("option:not([disabled]):checked") !== null;
        if (((r.disabled = !s), !s)) return;
      }
      c.requestSubmit(t);
    }));
  const n = document.querySelector("[data-variant-selector]");
  n &&
    n.addEventListener("change", () => {
      const i = !n.options[n.selectedIndex].disabled;
      ((r.disabled = !i),
        r.setAttribute("aria-disabled", String(!i)),
        (r.textContent = i ? "Add to cart" : "Sold out"));
    });
}
let y = !1,
  u = null;
function x(t) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(t / 100);
}
function j(t) {
  return Array.from(
    t.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
}
function D(t, e) {
  const r = j(t);
  if (!r.length) return;
  const a = r[0],
    n = r[r.length - 1];
  e.shiftKey && document.activeElement === a
    ? (e.preventDefault(), n.focus())
    : !e.shiftKey &&
      document.activeElement === n &&
      (e.preventDefault(), a.focus());
}
function H(t, e) {
  var r;
  (e == null || e.classList.remove("hidden"),
    t.classList.remove("hidden"),
    t.classList.add("flex"),
    t.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"),
    (t._trapHandler = (a) => {
      a.key === "Tab" && D(t, a);
    }),
    t.addEventListener("keydown", t._trapHandler),
    (r = t.querySelector("[data-quick-view-close]")) == null || r.focus());
}
function b(t, e) {
  (e == null || e.classList.add("hidden"),
    t.classList.add("hidden"),
    t.classList.remove("flex"),
    t.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    t._trapHandler &&
      (t.removeEventListener("keydown", t._trapHandler),
      (t._trapHandler = null)));
  const r = t.querySelector("[data-quick-view-content]");
  (r && (r.innerHTML = ""), u == null || u.focus(), (u = null));
}
async function O(t) {
  const e = await fetch(`/products/${t}?view=quick-view`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!e.ok) throw new Error(`Failed to load product: ${e.status}`);
  return e.text();
}
function R() {
  const t = document.querySelector("[data-quick-view-modal]"),
    e = document.querySelector("[data-quick-view-overlay]");
  t &&
    (document.addEventListener("click", async (r) => {
      const a = r.target.closest("[data-quick-view-trigger]");
      if (!a || (r.preventDefault(), y)) return;
      ((y = !0), (u = a));
      const n = a.dataset.productHandle;
      if (!n) {
        y = !1;
        return;
      }
      const c = t.querySelector("[data-quick-view-content]");
      (c &&
        (c.innerHTML =
          '<p class="text-center text-gray-400 py-8">Loading…</p>'),
        H(t, e));
      try {
        const i = await O(n),
          d = new DOMParser().parseFromString(i, "text/html"),
          s = d.querySelector("main") ?? d.body;
        c && (c.innerHTML = s.innerHTML);
      } catch {
        c &&
          (c.innerHTML =
            '<p class="text-center text-red-500 py-8">Could not load product. <a href="/products/' +
            n +
            '" class="underline">View full page</a></p>');
      } finally {
        y = !1;
      }
    }),
    document.addEventListener("click", (r) => {
      r.target.closest("[data-quick-view-close]") && b(t, e);
    }),
    document.addEventListener("click", (r) => {
      r.target.matches("[data-quick-view-overlay]") && b(t, e);
    }),
    document.addEventListener("keydown", (r) => {
      r.key === "Escape" &&
        t.getAttribute("aria-hidden") === "false" &&
        b(t, e);
    }),
    document.addEventListener("change", (r) => {
      const a = r.target.closest("[data-variant-selector]");
      if (!a || t.getAttribute("aria-hidden") === "true") return;
      const n = t.querySelector("[data-product-variants]");
      if (!n) return;
      const i = JSON.parse(n.textContent).find((f) => String(f.id) === a.value);
      if (!i) return;
      const d = t.querySelector("[data-quick-view-price]");
      if (d) {
        const f = x(i.price),
          v = i.compare_at_price;
        v && v > i.price
          ? (d.innerHTML = `<span class="text-red-600 font-semibold">${f}</span> <s class="text-gray-400 text-sm">${x(v)}</s>`)
          : (d.innerHTML = `<span class="font-semibold text-gray-900">${f}</span>`);
      }
      const s = t.querySelector("[data-add-to-cart]");
      s &&
        ((s.disabled = !i.available),
        s.setAttribute("aria-disabled", String(!i.available)),
        (s.textContent = i.available ? "Add to cart" : "Sold out"));
    }));
}
function F() {
  const t = document.querySelector("[data-variant-selector]");
  t &&
    t.addEventListener("change", () => {
      const e = t.value,
        r = document.querySelector("[data-add-to-cart]");
      r && (r.dataset.variantId = e);
    });
}
function P() {
  const t = document.querySelectorAll("[data-modal-trigger]");
  t.length &&
    (t.forEach((e) => {
      e.addEventListener("click", () => {
        const r = e.dataset.modalTrigger,
          a = document.getElementById(r);
        a && (a.removeAttribute("hidden"), a.focus());
      });
    }),
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const r = document.querySelector("[data-modal]:not([hidden])");
      r && r.setAttribute("hidden", "");
    }));
}
function K() {
  const t = document.querySelectorAll("[data-accordion]");
  t.length &&
    t.forEach((e) => {
      const r = e.querySelector("[data-accordion-trigger]"),
        a = e.querySelector("[data-accordion-panel]");
      !r ||
        !a ||
        r.addEventListener("click", () => {
          const n = r.getAttribute("aria-expanded") === "true";
          (r.setAttribute("aria-expanded", String(!n)), (a.hidden = n));
        });
    });
}
let m = null,
  L = null;
async function Q(t) {
  (m && m.abort(), (m = new AbortController()));
  const e = new URLSearchParams({
      q: t,
      "resources[type]": "product",
      "resources[limit]": "6",
      "resources[options][unavailable_products]": "last",
    }),
    r = await fetch(`/search/suggest.json?${e}`, { signal: m.signal });
  if (!r.ok) throw new Error("Search failed");
  return (await r.json()).resources.results.products ?? [];
}
function U(t) {
  const e = t.image
    ? `<img src="${t.image}" alt="" width="48" height="48" class="h-12 w-12 flex-none rounded object-cover">`
    : '<div class="h-12 w-12 flex-none rounded bg-gray-100" aria-hidden="true"></div>';
  return `<li role="option" aria-selected="false" data-predictive-search-item>
  <a href="${t.url}" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none" tabindex="-1">
    ${e}
    <span class="flex-1 font-medium text-gray-800 line-clamp-2">${t.title}</span>
  </a>
</li>`;
}
function N(t, e, r) {
  if (t.length === 0) {
    ((e.innerHTML = ""), r.classList.remove("hidden"));
    return;
  }
  (r.classList.add("hidden"), (e.innerHTML = t.map(U).join("")));
}
function V(t, e) {
  (e.classList.remove("hidden"), t.setAttribute("aria-expanded", "true"));
}
function w(t, e) {
  (e.classList.add("hidden"), t.setAttribute("aria-expanded", "false"), $(e));
}
function A(t) {
  return Array.from(t.querySelectorAll("[data-predictive-search-item]"));
}
function $(t) {
  A(t).forEach((e) => {
    (e.removeAttribute("data-active"),
      e.setAttribute("aria-selected", "false"));
  });
}
function k(t, e, r) {
  ($(r),
    t.setAttribute("data-active", ""),
    t.setAttribute("aria-selected", "true"),
    e.setAttribute("aria-activedescendant", t.querySelector("a").id || ""),
    t.scrollIntoView({ block: "nearest" }));
}
function B(t, e, r) {
  if (r.classList.contains("hidden")) return;
  const a = A(r);
  if (!a.length) return;
  const n = a.findIndex((c) => c.hasAttribute("data-active"));
  if (t.key === "ArrowDown") {
    t.preventDefault();
    const c = n < a.length - 1 ? n + 1 : 0;
    k(a[c], e, r);
  } else if (t.key === "ArrowUp") {
    t.preventDefault();
    const c = n > 0 ? n - 1 : a.length - 1;
    k(a[c], e, r);
  } else if (t.key === "Enter" && n !== -1) {
    t.preventDefault();
    const c = a[n].querySelector("a");
    c && (window.location.href = c.href);
  } else t.key === "Escape" && (w(e, r), e.focus());
}
function J() {
  const t = document.querySelector("[data-predictive-search]");
  if (!t) return;
  const e = t.querySelector("[data-predictive-search-input]"),
    r = t.querySelector("[data-predictive-search-results]"),
    a = t.querySelector("[data-predictive-search-list]"),
    n = t.querySelector("[data-predictive-search-empty]");
  (e.addEventListener("input", () => {
    clearTimeout(L);
    const c = e.value.trim();
    if (!c) {
      w(e, r);
      return;
    }
    L = setTimeout(async () => {
      try {
        const i = await Q(c);
        (N(i, a, n), V(e, r));
      } catch (i) {
        i.name !== "AbortError" && console.error(i);
      }
    }, 300);
  }),
    e.addEventListener("keydown", (c) => B(c, e, r)),
    document.addEventListener("click", (c) => {
      t.contains(c.target) || w(e, r);
    }));
}
document.addEventListener("DOMContentLoaded", () => {
  (T(), _(), R(), F(), P(), K(), J());
});
