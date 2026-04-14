# Predictive Search Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing predictive search panel to feel premium and conversion-focused by adding price display, richer result items, a loading skeleton, polished empty/error states, a "View all" CTA, and correct design token usage.

**Architecture:** The existing JS module (`predictive-search.js`) is refactored in-place: `renderItem` is upgraded to show pricing and larger images; state management functions (`showLoading`, `showError`, `showBody`, `showFooter`) are added and wired into the existing debounce/fetch flow. The Liquid snippet (`predictive-search.liquid`) is restructured to hold all state slots (loading, error, empty, body, footer) with correct initial visibility, eliminating all gray-colour tokens in favour of the design system.

**Tech Stack:** Shopify OS 2.0, Liquid, Tailwind CSS v3, Vanilla JS (ES Modules), Vite, `formatMoney` from `src/scripts/utils.js`

---

## File Map

| File                                        | Action                  | Responsibility                                                |
| ------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| `shopify/snippets/predictive-search.liquid` | Modify                  | Panel markup — all state slots, design tokens, structure      |
| `src/scripts/predictive-search.js`          | Modify                  | All JS — rendering, state, keyboard, fetch                    |
| `shopify/sections/header.liquid`            | No change               | Input wiring is fine as-is                                    |
| `src/scripts/main.js`                       | No change               | Already calls `initPredictiveSearch()`                        |
| `src/scripts/utils.js`                      | No change (import only) | `formatMoney(cents)` utility                                  |
| `tailwind.config.js`                        | No change               | Content scan covers both files; no dynamic class construction |

---

## Audit Notes (Pre-existing state)

**Works well — preserve:**

- `AbortController` stale-response handling ✓
- 300ms debounce ✓
- Full ARIA wiring (combobox, listbox, aria-expanded, aria-selected, aria-activedescendant) ✓
- Arrow/Enter/Escape keyboard navigation ✓
- Click-outside dismiss ✓

**Weaknesses to fix:**

- No loading UI (fetch fires silently)
- No error UI (console.error only)
- `renderItem` shows no price, no compare-at price, tiny image (48px), wrong colour tokens (`gray-100`, `gray-800`, `gray-50`)
- `setActive` adds `data-active` attribute but no CSS rule targets it → keyboard focus has **no visual state**
- Empty state is a single line: "No products found" with no guidance
- No "View all results" CTA in panel footer
- No group header label ("Products")
- Panel open on results-return only, not immediately on keypress (causes layout jump on slow network)

---

## Task 1: Restructure `predictive-search.liquid`

**Files:**

- Modify: `shopify/snippets/predictive-search.liquid`

Replace the entire file. New structure has five named slots all toggled by JS:
`loading` → `error` → `empty` → `body` (group header + list) → `footer` (view-all CTA).

- [ ] **Step 1: Replace the file contents**

```liquid
<div
  id="predictive-search-results"
  role="listbox"
  aria-label="Search results"
  data-predictive-search-results
  class="absolute left-0 top-full z-50 mt-2 hidden w-full min-w-[360px] overflow-hidden rounded-2xl bg-surface shadow-bubbly"
>
  {{- comment -}}
  Loading skeleton — 4 rows
  {{- endcomment -}}
  <div data-predictive-search-loading class="hidden p-2">
    {%- for i in (1..4) -%}
      <div class="flex items-center gap-3 rounded-xl px-3 py-2">
        <div
          class="h-14 w-14 flex-none animate-pulse rounded-xl bg-surface-container"
        ></div>
        <div class="flex flex-1 flex-col gap-2">
          <div
            class="h-3 w-3/4 animate-pulse rounded-full bg-surface-container"
          ></div>
          <div
            class="h-3 w-1/4 animate-pulse rounded-full bg-surface-container"
          ></div>
        </div>
      </div>
    {%- endfor -%}
  </div>

  {{- comment -}}
  Error state
  {{- endcomment -}}
  <p
    data-predictive-search-error
    class="hidden px-4 py-6 text-center text-sm text-on-surface/50"
  >
    Something went wrong — please try again.
  </p>

  {{- comment -}}
  Empty state
  {{- endcomment -}}
  <div data-predictive-search-empty class="hidden px-4 py-8 text-center">
    <p class="text-sm font-medium text-on-surface/60">No products found.</p>
    <p class="mt-1 text-xs text-on-surface/40">
      Try a shorter term or browse our categories.
    </p>
  </div>

  {{- comment -}}
  Results body: group label + list
  {{- endcomment -}}
  <div data-predictive-search-body class="hidden">
    <p
      class="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60"
      aria-hidden="true"
    >
      Products
    </p>
    <ul data-predictive-search-list role="presentation" class="pb-2"></ul>
  </div>

  {{- comment -}}
  Footer: view-all CTA
  {{- endcomment -}}
  <div
    data-predictive-search-footer
    class="hidden bg-surface-container/40 px-4 py-3"
  >
    <a
      data-predictive-search-view-all
      href="/search"
      class="flex w-full items-center justify-center rounded-xl bg-surface py-2.5 text-sm font-semibold text-on-surface shadow-ambient transition-colors hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      View all results
    </a>
  </div>
</div>
```

> **Note:** Liquid doesn't support `{%- comment -%}` inside a `{{-` expression. Use standard `{%- comment -%} ... {%- endcomment -%}` blocks. The above is illustrative — use standard Liquid comment syntax when writing the actual file.

- [ ] **Step 2: Verify markup renders without Liquid errors**

Run `npm run dev` then open the storefront. Confirm no Liquid render errors in the browser console or terminal.

- [ ] **Step 3: Confirm panel is hidden on page load**

Inspect the DOM. `[data-predictive-search-results]` should have class `hidden`. All inner state slots should also have `hidden`.

- [ ] **Step 4: Commit**

```bash
git add shopify/snippets/predictive-search.liquid
git commit -m "feat: restructure predictive search panel with loading, error, empty, body, footer slots"
```

---

## Task 2: Upgrade `renderItem()` — price, larger image, design tokens

**Files:**

- Modify: `src/scripts/predictive-search.js` (lines 1–36)

- [ ] **Step 1: Add `formatMoney` import at the top of the file**

Replace the first line (currently blank module-level vars) with:

```js
import { formatMoney } from "./utils.js";

let abortController = null;
let debounceTimer = null;
```

- [ ] **Step 2: Replace `renderItem()` (lines 25–36) with the upgraded version**

```js
function renderItem(product) {
  const imgSrc = product.featured_image?.url ?? product.image;
  const img = imgSrc
    ? `<img src="${imgSrc}" alt="" width="56" height="56" loading="lazy" class="h-14 w-14 flex-none rounded-xl object-cover">`
    : `<div class="h-14 w-14 flex-none rounded-xl bg-surface-container" aria-hidden="true"></div>`;

  const onSale =
    product.compare_at_price_max &&
    Number(product.compare_at_price_max) > Number(product.price);

  const priceHtml = onSale
    ? `<span class="font-semibold text-secondary">${formatMoney(Number(product.price))}</span><s class="ml-1 text-xs text-on-surface/40">${formatMoney(Number(product.compare_at_price_max))}</s>`
    : `<span class="font-semibold text-on-surface">${formatMoney(Number(product.price))}</span>`;

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
```

> **Price field note:** The Shopify `/search/suggest.json` endpoint returns `price` and `compare_at_price_max` as integers in cents (store's smallest currency unit). `Number()` coercion handles both integer and string formats defensively. If prices appear incorrect during testing, log `product.price` raw to verify the unit and adjust `formatMoney` call accordingly (divide by 100 is already done inside `formatMoney`).

- [ ] **Step 3: Build and visually verify in the browser**

Run `npm run dev`. Type a product name in the search field. Confirm:

- Product image is ~56×56 and square-cropped
- Product title is on one line with ellipsis if long
- Price appears below title
- Sale price shows in `text-secondary` (orange) with strikethrough regular price
- No `gray-` colour classes visible in DevTools on result items

- [ ] **Step 4: Commit**

```bash
git add src/scripts/predictive-search.js
git commit -m "feat: upgrade search result items with pricing, larger images, and design token classes"
```

---

## Task 3: Add state management functions

**Files:**

- Modify: `src/scripts/predictive-search.js` (replace `renderResults`, `showResults`, `hideResults`)

The new model: the panel (`results`) is shown as soon as the user types. Inside it, only one slot is visible at a time: `loading`, `error`, `empty`, or `body`. The `footer` is shown alongside `body` when there are results.

- [ ] **Step 1: Replace `showResults` and `hideResults` with expanded state functions**

Remove lines 48–57 (the old `showResults` and `hideResults` functions) and replace with:

```js
function showPanel(input, results) {
  results.classList.remove("hidden");
  input.setAttribute("aria-expanded", "true");
}

function hidePanel(input, results) {
  results.classList.add("hidden");
  input.setAttribute("aria-expanded", "false");
  clearActive(results);
}

function setSlot(loading, error, empty, body, footer, slot) {
  loading.classList.toggle("hidden", slot !== "loading");
  error.classList.toggle("hidden", slot !== "error");
  empty.classList.toggle("hidden", slot !== "empty");
  body.classList.toggle("hidden", slot !== "body");
  footer.classList.toggle("hidden", slot !== "body");
}
```

> `setSlot` accepts a string `slot` — one of `"loading"`, `"error"`, `"empty"`, `"body"`. It shows exactly one slot and always syncs `footer` with `body` (footer is only visible when body is).

- [ ] **Step 2: Replace `renderResults` with a version that uses `setSlot`**

Remove the old `renderResults` function (lines 38–46) and replace with:

```js
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
```

- [ ] **Step 3: Confirm no syntax errors**

Run `npm run build` (or `npm run dev`) and confirm Vite compiles without errors.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/predictive-search.js
git commit -m "refactor: add slot-based state management to predictive search"
```

---

## Task 4: Wire the new elements and state into `initPredictiveSearch()`

**Files:**

- Modify: `src/scripts/predictive-search.js` — `initPredictiveSearch()` function (lines 106–142)

- [ ] **Step 1: Replace `initPredictiveSearch()` entirely**

```js
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
```

- [ ] **Step 2: Build and run full flow test in browser**

Run `npm run dev`. Test each state:

1. **Loading:** Type a query → panel opens immediately with animated skeleton rows
2. **Results:** Wait 300ms → skeleton replaced by product items with image + title + price
3. **View all CTA:** Footer appears below results with correct href (`/search?q=QUERY&type=product`)
4. **Empty:** Type a term with no matches → empty state with two-line friendly message
5. **Escape:** Press Escape → panel closes, input re-focused
6. **Click outside:** Click elsewhere → panel closes

- [ ] **Step 3: Test error state**

Temporarily disable network in DevTools (Offline mode). Type a query → panel should show the error message instead of skeleton or results. Re-enable network.

- [ ] **Step 4: Commit**

```bash
git add src/scripts/predictive-search.js
git commit -m "feat: wire loading, error, empty, body, footer states into predictive search init"
```

---

## Task 5: Fix keyboard active-state visual feedback

**Files:**

- Modify: `src/scripts/predictive-search.js` — `setActive()` and `clearActive()` functions

Currently `setActive` writes `data-active` attribute with no corresponding CSS rule, so keyboard navigation has **no visible highlight**. Fix by toggling the `bg-surface-container/60` class directly on the anchor element.

- [ ] **Step 1: Replace `clearActive()` (lines 63–68)**

```js
function clearActive(results) {
  getItems(results).forEach((item) => {
    item.removeAttribute("data-active");
    item.setAttribute("aria-selected", "false");
    item.querySelector("a")?.classList.remove("bg-surface-container/60");
  });
}
```

- [ ] **Step 2: Replace `setActive()` (lines 70–76)**

```js
function setActive(item, input, results) {
  clearActive(results);
  item.setAttribute("data-active", "");
  item.setAttribute("aria-selected", "true");
  item.querySelector("a").classList.add("bg-surface-container/60");
  input.setAttribute("aria-activedescendant", item.querySelector("a").id || "");
  item.scrollIntoView({ block: "nearest" });
}
```

- [ ] **Step 3: Verify keyboard navigation in browser**

Run `npm run dev`. Type a query → when results appear, press `ArrowDown`:

- First result should show a visible `bg-surface-container/60` tinted background
- Pressing `ArrowDown` again moves highlight to next item
- `ArrowUp` moves it back
- `Enter` on a highlighted item navigates to that product URL

- [ ] **Step 4: Commit**

```bash
git add src/scripts/predictive-search.js
git commit -m "fix: add visible keyboard navigation highlight to predictive search result items"
```

---

## Task 6: Stale-response and tab-order hardening

**Files:**

- Modify: `src/scripts/predictive-search.js` — `handleKeydown()` and guard clauses

- [ ] **Step 1: Add `Home` and `End` key support to `handleKeydown()`**

In `handleKeydown`, after the `ArrowUp` block and before `Enter`, add:

```js
} else if (e.key === "Home") {
  e.preventDefault();
  setActive(items[0], input, results);
} else if (e.key === "End") {
  e.preventDefault();
  setActive(items[items.length - 1], input, results);
```

- [ ] **Step 2: Verify `tabindex="-1"` on all result anchors prevents tab into results**

In the browser with the panel open, press `Tab` from the search input. Focus should leave the input/panel area entirely (to the cart button) without cycling through each result. Result items are only navigable via arrow keys.

- [ ] **Step 3: Verify Escape closes panel and returns focus to input**

Press Escape while arrow-navigating results → panel closes, input is focused (existing behaviour confirmed still works).

- [ ] **Step 4: Verify rapid typing does not show stale results**

Type quickly ("dog f"), then pause. Only results for the final query should appear. The AbortController pattern already handles this — confirm no flash of intermediate results.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/predictive-search.js
git commit -m "feat: add Home/End key support to predictive search keyboard navigation"
```

---

## Task 7: Panel sizing and overflow polish

**Files:**

- Modify: `shopify/snippets/predictive-search.liquid` (already done in Task 1 — verify only)
- Modify: `shopify/sections/header.liquid` if panel clipping is found

- [ ] **Step 1: Verify panel is not clipped by the header container**

Open the storefront with DevTools. Type a query. Check that the results panel (`[data-predictive-search-results]`) renders below the header pill and is not hidden by `overflow:hidden` on any ancestor.

The header's pill container uses `rounded-full` which clips children if `overflow:hidden` is applied. The predictive search wrapper is `[data-predictive-search]` with `relative` positioning — confirm the panel escapes the pill container. If it's clipped, the `[data-predictive-search]` div in `header.liquid` (line 40) needs `overflow-visible`:

```html
<div
  class="relative hidden shrink-0 overflow-visible lg:block"
  data-predictive-search
></div>
```

- [ ] **Step 2: Verify min-width on narrow viewports**

At `lg` breakpoint (1024px window width), the input is `260px` wide but the panel is `min-w-[360px]`. Confirm the panel extends rightward without going off-screen. The panel uses `left-0` so it aligns to the left edge of the input wrapper.

- [ ] **Step 3: Commit only if `header.liquid` was changed**

```bash
git add shopify/sections/header.liquid
git commit -m "fix: allow predictive search panel to escape header pill container overflow"
```

---

## Verification Checklist (End-to-End)

Run through this full checklist on the live dev server before marking complete:

**Functional:**

- [ ] Typing shows loading skeleton immediately (before fetch resolves)
- [ ] Results appear after 300ms debounce with image, title, and price
- [ ] Sale products show orange sale price + strikethrough regular price
- [ ] "View all results" link appears below results and points to `/search?q=QUERY&type=product`
- [ ] Empty query → panel closes
- [ ] No-results query → friendly empty state message
- [ ] Network offline → error state message, no crash
- [ ] Rapid typing → only final query's results appear, no flicker of intermediate results

**Keyboard:**

- [ ] `ArrowDown` / `ArrowUp` cycles through results with visible highlight
- [ ] `Home` focuses first result, `End` focuses last result
- [ ] `Enter` on highlighted result navigates to product URL
- [ ] `Escape` closes panel and returns focus to input
- [ ] `Tab` from input skips over results entirely

**Accessibility:**

- [ ] `aria-expanded` on input is `"true"` when panel is open, `"false"` when closed
- [ ] `aria-selected` on active item is `"true"`, all others `"false"`
- [ ] `aria-activedescendant` on input references active item's link
- [ ] Panel has `role="listbox"` and `aria-label="Search results"`
- [ ] Group label paragraph has `aria-hidden="true"` (it's decorative, not part of listbox semantics)
- [ ] Screen reader announces result count changes (browser handles via listbox role)

**Design:**

- [ ] No `gray-` Tailwind classes on any search element — all use design tokens
- [ ] Panel uses `bg-surface`, `shadow-bubbly`, `rounded-2xl` — consistent with theme
- [ ] Hover and active states use `bg-surface-container/60` (tonal, no harsh borders)
- [ ] Footer uses `bg-surface-container/40` background shift — no border divider
- [ ] Loading skeleton uses `animate-pulse` on `bg-surface-container` shapes
- [ ] Empty state is centred and has two lines of copy

**Performance:**

- [ ] No duplicate fetches for the same query
- [ ] Aborted requests do not cause console errors (only real errors should log)
- [ ] Result list DOM updates without layout shift in the surrounding header
