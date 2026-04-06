async function E() {
  const e = await fetch("/cart.js");
  if (!e.ok) throw new Error("Failed to fetch cart");
  return e.json();
}
async function D(e) {
  const t = await fetch("/cart/add.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: e }),
  });
  if (!t.ok) throw new Error("Failed to add to cart");
  return t.json();
}
async function L(e, t) {
  const r = await fetch("/cart/change.js", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: e, quantity: t }),
  });
  if (!r.ok) throw new Error("Failed to update cart");
  return r.json();
}
async function _(e) {
  return L(e, 0);
}
let u = !1,
  b = null;
function T(e) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(e / 100);
}
function H(e) {
  const t = e.image
      ? `<img src="${e.image}" alt="${e.title}" width="80" height="80" loading="lazy" class="h-20 w-20 rounded-md object-cover bg-gray-100">`
      : '<div class="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-300" aria-hidden="true"></div>',
    r =
      e.variant_title && e.variant_title !== "Default Title"
        ? `<p class="text-xs text-gray-500">${e.variant_title}</p>`
        : "";
  return `
    <li class="flex gap-4 py-4 border-b border-gray-100 last:border-0" data-line-item data-item-key="${e.key}">
      ${t}
      <div class="flex flex-1 flex-col gap-1 min-w-0">
        <p class="text-sm font-medium text-gray-800 truncate">${e.product_title}</p>
        ${r}
        <p class="text-sm font-semibold text-gray-900">${T(e.final_line_price)}</p>
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
            value="${e.quantity}"
            min="0"
            class="w-10 text-center text-sm border border-gray-300 rounded py-0.5"
            aria-label="Quantity for ${e.product_title}"
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
            aria-label="Remove ${e.product_title}"
            class="ml-auto text-xs text-gray-400 hover:text-red-500 underline"
          >Remove</button>
        </div>
      </div>
    </li>
  `.trim();
}
function y(e) {
  const t = document.querySelector("[data-cart-items]"),
    r = document.querySelector("[data-cart-empty]"),
    n = document.querySelectorAll("[data-cart-subtotal]"),
    a = document.querySelectorAll("[data-cart-count]");
  (t && (t.innerHTML = e.items.map(H).join("")),
    r && r.classList.toggle("hidden", e.item_count > 0),
    n.forEach((o) => {
      o.textContent = T(e.total_price);
    }),
    a.forEach((o) => {
      o.textContent = e.item_count;
    }));
}
function k() {
  const e = document.querySelector("[data-cart-drawer]"),
    t = document.querySelector("[data-cart-overlay]");
  if (!e) return;
  (t == null || t.classList.remove("hidden"),
    e.classList.remove("translate-x-full"),
    e.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"));
  const r = e.querySelector("[data-cart-close]");
  r == null || r.focus();
}
function w() {
  const e = document.querySelector("[data-cart-drawer]"),
    t = document.querySelector("[data-cart-overlay]");
  e &&
    (t == null || t.classList.add("hidden"),
    e.classList.add("translate-x-full"),
    e.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    b == null || b.focus());
}
function j() {
  (document.addEventListener("click", async (e) => {
    if (
      e.target.closest("[data-cart-toggle]") &&
      ((b = e.target.closest("[data-cart-toggle]")), !u)
    ) {
      u = !0;
      try {
        const t = await E();
        (y(t), k());
      } catch (t) {
        console.error("Cart open failed:", t);
      } finally {
        u = !1;
      }
    }
  }),
    document.addEventListener("click", (e) => {
      e.target.closest("[data-cart-close]") && w();
    }),
    document.addEventListener("click", (e) => {
      e.target.matches("[data-cart-overlay]") && w();
    }),
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const t = document.querySelector("[data-cart-drawer]");
        t && t.getAttribute("aria-hidden") === "false" && w();
      }
    }),
    document.addEventListener("submit", async (e) => {
      var a, o;
      const t = e.target.closest("[data-cart-form]");
      if (!t || (e.preventDefault(), u)) return;
      u = !0;
      const r = t.querySelector('[type="submit"]'),
        n = r == null ? void 0 : r.textContent;
      r && (r.textContent = "Adding…");
      try {
        const c =
          (a = t.querySelector('[name="id"]')) == null ? void 0 : a.value;
        if (!c) throw new Error("Add to cart: variant ID not found");
        const s = parseInt(
          ((o = t.querySelector('[name="quantity"]')) == null
            ? void 0
            : o.value) ?? "1",
          10,
        );
        await D([{ id: c, quantity: s }]);
        const i = await E();
        (y(i), k());
      } catch (c) {
        console.error("Add to cart failed:", c);
      } finally {
        (r && (r.textContent = n), (u = !1));
      }
    }),
    document.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-quantity-decrease]");
      if (!t || u) return;
      const r = t.closest("[data-line-item]"),
        n = r == null ? void 0 : r.dataset.itemKey,
        a = r == null ? void 0 : r.querySelector("[data-quantity-input]");
      if (!n || !a) return;
      const o = Math.max(0, parseInt(a.value, 10) - 1);
      u = !0;
      try {
        const c = await L(n, o);
        y(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        u = !1;
      }
    }),
    document.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-quantity-increase]");
      if (!t || u) return;
      const r = t.closest("[data-line-item]"),
        n = r == null ? void 0 : r.dataset.itemKey,
        a = r == null ? void 0 : r.querySelector("[data-quantity-input]");
      if (!n || !a) return;
      const o = parseInt(a.value, 10) + 1;
      u = !0;
      try {
        const c = await L(n, o);
        y(c);
      } catch (c) {
        console.error("Quantity update failed:", c);
      } finally {
        u = !1;
      }
    }),
    document.addEventListener("click", async (e) => {
      const t = e.target.closest("[data-remove-item]");
      if (!t || u) return;
      const r = t.closest("[data-line-item]"),
        n = r == null ? void 0 : r.dataset.itemKey;
      if (n) {
        u = !0;
        try {
          const a = await _(n);
          y(a);
        } catch (a) {
          console.error("Remove item failed:", a);
        } finally {
          u = !1;
        }
      }
    }));
}
function O() {
  const e = document.querySelector("[data-main-atc]"),
    t = document.querySelector("[data-sticky-atc]"),
    r = document.querySelector("[data-sticky-atc-btn]");
  if (!e || !t || !r) return;
  (new IntersectionObserver(
    ([o]) => {
      const c = o.isIntersecting;
      (t.classList.toggle("translate-y-full", c),
        t.setAttribute("aria-hidden", String(c)));
    },
    { threshold: 0 },
  ).observe(e),
    r.addEventListener("click", () => {
      const o = e.closest("form");
      if (!o) return;
      const c = o.querySelector("[data-variant-selector]");
      if (c) {
        const i = c.querySelector("option:not([disabled]):checked") !== null;
        if (((r.disabled = !i), !i)) return;
      }
      o.requestSubmit(e);
    }));
  const a = document.querySelector("[data-variant-selector]");
  a &&
    a.addEventListener("change", () => {
      const c = !a.options[a.selectedIndex].disabled;
      ((r.disabled = !c),
        r.setAttribute("aria-disabled", String(!c)),
        (r.textContent = c ? "Add to cart" : "Sold out"));
    });
}
let v = !1,
  m = null;
function A(e) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(e / 100);
}
function P(e) {
  return Array.from(
    e.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
}
function R(e, t) {
  const r = P(e);
  if (!r.length) return;
  const n = r[0],
    a = r[r.length - 1];
  t.shiftKey && document.activeElement === n
    ? (t.preventDefault(), a.focus())
    : !t.shiftKey &&
      document.activeElement === a &&
      (t.preventDefault(), n.focus());
}
function F(e, t) {
  var r;
  (t == null || t.classList.remove("hidden"),
    e.classList.remove("hidden"),
    e.classList.add("flex"),
    e.setAttribute("aria-hidden", "false"),
    (document.body.style.overflow = "hidden"),
    (e._trapHandler = (n) => {
      n.key === "Tab" && R(e, n);
    }),
    e.addEventListener("keydown", e._trapHandler),
    (r = e.querySelector("[data-quick-view-close]")) == null || r.focus());
}
function S(e, t) {
  (t == null || t.classList.add("hidden"),
    e.classList.add("hidden"),
    e.classList.remove("flex"),
    e.setAttribute("aria-hidden", "true"),
    (document.body.style.overflow = ""),
    e._trapHandler &&
      (e.removeEventListener("keydown", e._trapHandler),
      (e._trapHandler = null)));
  const r = e.querySelector("[data-quick-view-content]");
  (r && (r.innerHTML = ""), m == null || m.focus(), (m = null));
}
async function K(e) {
  const t = await fetch(`/products/${e}?view=quick-view`, {
    headers: { "X-Requested-With": "XMLHttpRequest" },
  });
  if (!t.ok) throw new Error(`Failed to load product: ${t.status}`);
  return t.text();
}
function U() {
  const e = document.querySelector("[data-quick-view-modal]"),
    t = document.querySelector("[data-quick-view-overlay]");
  e &&
    (document.addEventListener("click", async (r) => {
      const n = r.target.closest("[data-quick-view-trigger]");
      if (!n || (r.preventDefault(), v)) return;
      ((v = !0), (m = n));
      const a = n.dataset.productHandle;
      if (!a) {
        v = !1;
        return;
      }
      const o = e.querySelector("[data-quick-view-content]");
      (o &&
        (o.innerHTML =
          '<p class="text-center text-gray-400 py-8">Loading…</p>'),
        F(e, t));
      try {
        const c = await K(a),
          s = new DOMParser().parseFromString(c, "text/html"),
          i = s.querySelector("main") ?? s.body;
        o && (o.innerHTML = i.innerHTML);
      } catch {
        o &&
          (o.innerHTML =
            '<p class="text-center text-red-500 py-8">Could not load product. <a href="/products/' +
            a +
            '" class="underline">View full page</a></p>');
      } finally {
        v = !1;
      }
    }),
    document.addEventListener("click", (r) => {
      r.target.closest("[data-quick-view-close]") && S(e, t);
    }),
    document.addEventListener("click", (r) => {
      r.target.matches("[data-quick-view-overlay]") && S(e, t);
    }),
    document.addEventListener("keydown", (r) => {
      r.key === "Escape" &&
        e.getAttribute("aria-hidden") === "false" &&
        S(e, t);
    }),
    document.addEventListener("change", (r) => {
      const n = r.target.closest("[data-variant-selector]");
      if (!n || e.getAttribute("aria-hidden") === "true") return;
      const a = e.querySelector("[data-product-variants]");
      if (!a) return;
      let o;
      try {
        o = JSON.parse(a.textContent);
      } catch {
        return;
      }
      const c = o.find((l) => String(l.id) === n.value);
      if (!c) return;
      const s = e.querySelector("[data-quick-view-price]");
      if (s) {
        const l = A(c.price),
          d = c.compare_at_price;
        d && d > c.price
          ? (s.innerHTML = `<span class="text-red-600 font-semibold">${l}</span> <s class="text-gray-400 text-sm">${A(d)}</s>`)
          : (s.innerHTML = `<span class="font-semibold text-gray-900">${l}</span>`);
      }
      const i = e.querySelector("[data-add-to-cart]");
      i &&
        ((i.disabled = !c.available),
        i.setAttribute("aria-disabled", String(!c.available)),
        (i.textContent = c.available ? "Add to cart" : "Sold out"));
    }));
}
function Q() {
  const e = document.querySelector("[data-variant-selector]");
  e &&
    e.addEventListener("change", () => {
      const t = e.value,
        r = document.querySelector("[data-add-to-cart]");
      r && (r.dataset.variantId = t);
    });
}
function N() {
  const e = document.querySelectorAll("[data-modal-trigger]");
  e.length &&
    (e.forEach((t) => {
      t.addEventListener("click", () => {
        const r = t.dataset.modalTrigger,
          n = document.getElementById(r);
        n && (n.removeAttribute("hidden"), n.focus());
      });
    }),
    document.addEventListener("keydown", (t) => {
      if (t.key !== "Escape") return;
      const r = document.querySelector("[data-modal]:not([hidden])");
      r && r.setAttribute("hidden", "");
    }));
}
function V() {
  const e = document.querySelectorAll("[data-accordion]");
  e.length &&
    e.forEach((t) => {
      const r = t.querySelector("[data-accordion-trigger]"),
        n = t.querySelector("[data-accordion-panel]");
      !r ||
        !n ||
        r.addEventListener("click", () => {
          const a = r.getAttribute("aria-expanded") === "true";
          (r.setAttribute("aria-expanded", String(!a)), (n.hidden = a));
        });
    });
}
let h = null,
  I = null;
async function B(e) {
  (h && h.abort(), (h = new AbortController()));
  const t = new URLSearchParams({
      q: e,
      "resources[type]": "product",
      "resources[limit]": "6",
      "resources[options][unavailable_products]": "last",
    }),
    r = await fetch(`/search/suggest.json?${t}`, { signal: h.signal });
  if (!r.ok) throw new Error("Search failed");
  return (await r.json()).resources.results.products ?? [];
}
function J(e) {
  const t = e.image
    ? `<img src="${e.image}" alt="" width="48" height="48" class="h-12 w-12 flex-none rounded object-cover">`
    : '<div class="h-12 w-12 flex-none rounded bg-gray-100" aria-hidden="true"></div>';
  return `<li role="option" aria-selected="false" data-predictive-search-item>
  <a href="${e.url}" class="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none" tabindex="-1">
    ${t}
    <span class="flex-1 font-medium text-gray-800 line-clamp-2">${e.title}</span>
  </a>
</li>`;
}
function z(e, t, r) {
  if (e.length === 0) {
    ((t.innerHTML = ""), r.classList.remove("hidden"));
    return;
  }
  (r.classList.add("hidden"), (t.innerHTML = e.map(J).join("")));
}
function X(e, t) {
  (t.classList.remove("hidden"), e.setAttribute("aria-expanded", "true"));
}
function q(e, t) {
  (t.classList.add("hidden"), e.setAttribute("aria-expanded", "false"), C(t));
}
function $(e) {
  return Array.from(e.querySelectorAll("[data-predictive-search-item]"));
}
function C(e) {
  $(e).forEach((t) => {
    (t.removeAttribute("data-active"),
      t.setAttribute("aria-selected", "false"));
  });
}
function M(e, t, r) {
  (C(r),
    e.setAttribute("data-active", ""),
    e.setAttribute("aria-selected", "true"),
    t.setAttribute("aria-activedescendant", e.querySelector("a").id || ""),
    e.scrollIntoView({ block: "nearest" }));
}
function W(e, t, r) {
  if (r.classList.contains("hidden")) return;
  const n = $(r);
  if (!n.length) return;
  const a = n.findIndex((o) => o.hasAttribute("data-active"));
  if (e.key === "ArrowDown") {
    e.preventDefault();
    const o = a < n.length - 1 ? a + 1 : 0;
    M(n[o], t, r);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    const o = a > 0 ? a - 1 : n.length - 1;
    M(n[o], t, r);
  } else if (e.key === "Enter" && a !== -1) {
    e.preventDefault();
    const o = n[a].querySelector("a");
    o && (window.location.href = o.href);
  } else e.key === "Escape" && (q(t, r), t.focus());
}
function G() {
  const e = document.querySelector("[data-predictive-search]");
  if (!e) return;
  const t = e.querySelector("[data-predictive-search-input]"),
    r = e.querySelector("[data-predictive-search-results]"),
    n = e.querySelector("[data-predictive-search-list]"),
    a = e.querySelector("[data-predictive-search-empty]");
  !t ||
    !r ||
    !n ||
    !a ||
    (t.addEventListener("input", () => {
      clearTimeout(I);
      const o = t.value.trim();
      if (!o) {
        q(t, r);
        return;
      }
      I = setTimeout(async () => {
        try {
          const c = await B(o);
          (z(c, n, a), X(t, r));
        } catch (c) {
          c.name !== "AbortError" && console.error(c);
        }
      }, 300);
    }),
    t.addEventListener("keydown", (o) => W(o, t, r)),
    document.addEventListener("click", (o) => {
      e.contains(o.target) || q(t, r);
    }));
}
function Y() {
  (Z(), ee());
}
function Z() {
  const e = document.querySelector("[data-sort-select]");
  e &&
    e.addEventListener("change", () => {
      const t = new URL(window.location.href);
      (t.searchParams.set("sort_by", e.value),
        (window.location.href = t.toString()));
    });
}
function ee() {
  const e = document.querySelector("[data-filter-open]"),
    t = document.querySelector("[data-filter-close]"),
    r = document.querySelector("[data-filter-panel]"),
    n = document.querySelector("[data-filter-overlay]");
  if (!e || !r) return;
  function a() {
    (r.classList.remove("-translate-x-full"),
      n == null || n.classList.remove("hidden"),
      e.setAttribute("aria-expanded", "true"),
      (document.body.style.overflow = "hidden"),
      t == null || t.focus());
  }
  function o() {
    (r.classList.add("-translate-x-full"),
      n == null || n.classList.add("hidden"),
      e.setAttribute("aria-expanded", "false"),
      (document.body.style.overflow = ""),
      e.focus());
  }
  (e.addEventListener("click", a),
    t == null || t.addEventListener("click", o),
    n == null || n.addEventListener("click", o),
    document.addEventListener("keydown", (c) => {
      c.key === "Escape" && !r.classList.contains("-translate-x-full") && o();
    }));
}
function te() {
  const e = document.querySelector("[data-product-recommendations]");
  if (!e) return;
  const { productId: t, url: r, limit: n = 4 } = e.dataset;
  fetch(`${r}?section_id=product-recommendations&product_id=${t}&limit=${n}`)
    .then((a) => (a.ok ? a.text() : Promise.reject()))
    .then((a) => {
      var s;
      const c = new DOMParser()
        .parseFromString(a, "text/html")
        .querySelector("[data-product-recommendations]");
      c != null && c.children.length
        ? (e.innerHTML = c.innerHTML)
        : (s = e.closest("section")) == null || s.remove();
    })
    .catch(() => {
      var a;
      return (a = e.closest("section")) == null ? void 0 : a.remove();
    });
}
function re() {
  (ne(), ae(), oe());
}
function ne() {
  const e = document.querySelector(".site-header");
  if (!e) return;
  const t = document.querySelectorAll("[data-mega-panel]"),
    r = () => {
      const s = e.offsetHeight;
      t.forEach((i) => {
        i.style.top = `${s}px`;
      });
    };
  (r(), new ResizeObserver(r).observe(e));
  const a = [],
    o = (s, i) => {
      (i.classList.remove("opacity-100", "pointer-events-auto"),
        i.classList.add("opacity-0", "pointer-events-none"),
        i.setAttribute("aria-hidden", "true"),
        s.setAttribute("aria-expanded", "false"));
      const l = s.querySelector("[data-mega-chevron]");
      l && l.classList.remove("rotate-180");
    },
    c = (s, i) => {
      (a.forEach(({ trigger: d, panel: f }) => {
        f !== i && o(d, f);
      }),
        i.classList.remove("opacity-0", "pointer-events-none"),
        i.classList.add("opacity-100", "pointer-events-auto"),
        i.setAttribute("aria-hidden", "false"),
        s.setAttribute("aria-expanded", "true"));
      const l = s.querySelector("[data-mega-chevron]");
      l && l.classList.add("rotate-180");
    };
  document.querySelectorAll("[data-mega-menu]").forEach((s) => {
    const i = s.querySelector("[data-mega-trigger]");
    if (!i) return;
    const l = i.getAttribute("aria-controls"),
      d = document.getElementById(l);
    if (!d) return;
    a.push({ trigger: i, panel: d });
    let f;
    const x = () => {
        f = setTimeout(() => o(i, d), 100);
      },
      g = () => clearTimeout(f);
    (s.addEventListener("mouseenter", () => {
      (g(), c(i, d));
    }),
      s.addEventListener("mouseleave", x),
      d.addEventListener("mouseenter", g),
      d.addEventListener("mouseleave", x),
      i.addEventListener("focus", () => {
        i.getAttribute("aria-expanded") !== "true" && c(i, d);
      }),
      d.addEventListener("focusin", g),
      i.addEventListener("keydown", (p) => {
        p.key === "Escape" && (o(i, d), i.focus());
      }),
      d.addEventListener("focusout", (p) => {
        !d.contains(p.relatedTarget) && !s.contains(p.relatedTarget) && o(i, d);
      }));
  });
}
function ae() {
  const e = document.querySelector("[data-mobile-toggle]"),
    t = document.querySelector("[data-mobile-drawer]"),
    r = document.querySelector("[data-mobile-close]"),
    n = document.querySelector("[data-mobile-backdrop]");
  if (!e || !t || !n) return;
  const a =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    o = () => {
      (t.classList.remove("-translate-x-full"),
        t.setAttribute("aria-hidden", "false"),
        n.classList.remove("hidden"),
        e.setAttribute("aria-expanded", "true"));
      const s = t.querySelector(a);
      s && s.focus();
    },
    c = () => {
      (t.classList.add("-translate-x-full"),
        t.setAttribute("aria-hidden", "true"),
        n.classList.add("hidden"),
        e.setAttribute("aria-expanded", "false"),
        e.focus());
    };
  (e.addEventListener("click", () => {
    e.getAttribute("aria-expanded") === "true" ? c() : o();
  }),
    r == null || r.addEventListener("click", c),
    n.addEventListener("click", c),
    document.addEventListener("keydown", (s) => {
      s.key === "Escape" && e.getAttribute("aria-expanded") === "true" && c();
    }),
    t.addEventListener("keydown", (s) => {
      if (t.getAttribute("aria-hidden") === "true" || s.key !== "Tab") return;
      const i = [...t.querySelectorAll(a)];
      if (!i.length) return;
      const l = i[0],
        d = i[i.length - 1];
      s.shiftKey && document.activeElement === l
        ? (s.preventDefault(), d.focus())
        : !s.shiftKey &&
          document.activeElement === d &&
          (s.preventDefault(), l.focus());
    }));
}
function oe() {
  document.querySelectorAll("[data-mobile-accordion]").forEach((e) => {
    e.addEventListener("click", () => {
      const t = e.getAttribute("aria-controls"),
        r = document.getElementById(t);
      if (!r) return;
      const n = e.getAttribute("aria-expanded") === "true",
        a = e.closest("[data-mobile-drawer]");
      (a &&
        a.querySelectorAll("[data-mobile-accordion]").forEach((c) => {
          if (c === e) return;
          const s = c.getAttribute("aria-controls"),
            i = document.getElementById(s);
          c.setAttribute("aria-expanded", "false");
          const l = c.querySelector("[data-accordion-chevron]");
          (l && l.classList.remove("rotate-180"),
            i == null || i.classList.add("hidden"));
        }),
        e.setAttribute("aria-expanded", String(!n)));
      const o = e.querySelector("[data-accordion-chevron]");
      (o && o.classList.toggle("rotate-180", !n),
        r.classList.toggle("hidden", n));
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  (j(),
    O(),
    U(),
    Q(),
    N(),
    V(),
    G(),
    Y(),
    te(),
    re(),
    document.querySelectorAll("[data-date-min-today]").forEach((e) => {
      e.min = new Date().toISOString().split("T")[0];
    }));
});
