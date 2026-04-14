# Collection Filter Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the FOOFASH collection filter sidebar to expose Pet and Category filter groups via Shopify-native filtering, and fix a pre-existing gap where `price_range`-type filters render as silent empty accordions.

**Architecture:** Only `shopify/snippets/filter-group.liquid` changes — it gains a `price_range` branch alongside the existing `list` branch. The `main-collection.liquid` loop already renders every filter Shopify exposes, in both desktop and mobile contexts, so no template changes are required. Multi-filter stacking for the price form is handled in pure Liquid by re-emitting active list-type filter params as hidden inputs.

**Tech Stack:** Shopify OS 2.0, Liquid, Tailwind CSS (utility classes only — no new CSS). No JavaScript changes. Shopify Search & Discovery app for filter configuration.

---

## File Map

| Action       | Path                                      | Responsibility                                                         |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------------- |
| Modify       | `shopify/snippets/filter-group.liquid`    | Add `price_range` branch; wrap existing `list` rendering in type check |
| No change    | `shopify/sections/main-collection.liquid` | Already loops `collection.filters` dynamically — untouched             |
| No change    | `src/scripts/filters.js`                  | Sort select + mobile drawer only — untouched                           |
| Admin config | Shopify Search & Discovery                | Expose Pet, Category, Availability, Price filters                      |

---

## Task 1: Update `filter-group.liquid` to handle both filter types

**Files:**

- Modify: `shopify/snippets/filter-group.liquid`

**Context:** The current file unconditionally iterates `filter.values` inside the accordion body. This works for `list`-type filters. Shopify's `price_range`-type filter has no `.values` — it exposes `filter.min_value`, `filter.max_value`, and `filter.range_max` instead. The fix wraps existing content in `{%- if filter.type == 'list' -%}` and adds a `price_range` branch.

**Price form multi-filter stacking:** When the price form submits to `collection.url`, a plain `GET` would discard other active filter params. The solution is pure Liquid: loop `collection.filters` inside the form and emit a hidden input for each active `list`-type value. `collection` is a global Liquid object — accessible inside `render`-isolated snippets. `active_filter.param_name` is the URL parameter key; `value.value` is the selected option's value.

**Price value format:** Shopify stores price filter values in cents internally. `filter.min_value.value` and `filter.range_max` are in cents. Divide by 100.0 to display as dollars. The form submits the user-entered dollar amount; Shopify's S&D layer handles the conversion back to cents.

- [ ] **Step 1: Replace `filter-group.liquid` with the updated version**

  Full file content — replaces the existing file entirely:

  ```liquid
  {%- comment -%}
    Filter group rendered as an accordion using native <details>/<summary>.
    Handles both list and price_range filter types.
    Usage: {% render 'filter-group', filter: filter %}
  {%- endcomment -%}

  <details class="rounded-2xl bg-surface p-4 shadow-ambient" open>
    <summary class="flex cursor-pointer list-none items-center justify-between">
      <span class="text-sm font-semibold text-on-surface">
        {{- filter.label -}}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        focusable="false"
        class="text-on-surface/40 transition-transform duration-200 [[open]_&]:rotate-180"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </summary>

    {%- if filter.type == 'list' -%}
      <div class="mt-3 flex flex-col gap-0.5">
        {%- for value in filter.values -%}
          {%- if value.active -%}
            <a
              href="{{ value.url_to_remove }}"
              class="flex items-center gap-2.5 rounded-xl bg-primary/10 px-2 py-1.5 text-sm text-primary transition-colors hover:bg-primary/15"
              aria-label="Remove filter: {{ filter.label }} {{ value.label }}"
            >
              <span class="flex h-4 w-4 flex-none items-center justify-center rounded border-2 border-primary bg-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              <span class="font-medium">{{ value.label }}</span>
              <span class="ml-auto text-xs text-on-surface-variant/60"
                >({{ value.count }})</span
              >
            </a>
          {%- elsif value.count > 0 -%}
            <a
              href="{{ value.url_to_add }}"
              class="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-on-surface"
              aria-label="Add filter: {{ filter.label }} {{ value.label }}"
            >
              <span
                class="flex h-4 w-4 flex-none items-center justify-center rounded border-2 border-on-surface/20"
              ></span>
              {{ value.label }}
              <span class="ml-auto text-xs text-on-surface/40"
                >({{ value.count }})</span
              >
            </a>
          {%- else -%}
            <span
              class="flex cursor-not-allowed items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm text-on-surface/20"
              aria-disabled="true"
            >
              <span
                class="flex h-4 w-4 flex-none items-center justify-center rounded border-2 border-on-surface/10"
              ></span>
              {{ value.label }}
              <span class="ml-auto text-xs">(0)</span>
            </span>
          {%- endif -%}
        {%- endfor -%}
      </div>

    {%- elsif filter.type == 'price_range' -%}
      <div class="mt-3">
        <form method="GET" action="{{ collection.url }}">
          <input type="hidden" name="sort_by" value="{{ collection.sort_by }}">
          {%- comment -%}
            Preserve active list-type filter params so price submission combines
            with Pet, Category, Availability, etc. rather than resetting them.
            collection is a global Liquid object — accessible inside render snippets.
          {%- endcomment -%}
          {%- for active_filter in collection.filters -%}
            {%- if active_filter.type == 'list' -%}
              {%- for value in active_filter.active_values -%}
                <input
                  type="hidden"
                  name="{{ active_filter.param_name }}"
                  value="{{ value.value }}"
                >
              {%- endfor -%}
            {%- endif -%}
          {%- endfor -%}
          <div class="flex gap-2">
            <input
              type="number"
              aria-label="Minimum price"
              name="{{ filter.min_value.param_name }}"
              {%- if filter.min_value.value != blank -%}
                value="{{ filter.min_value.value | divided_by: 100.0 }}"
              {%- endif -%}
              placeholder="Min"
              min="0"
              max="{{ filter.range_max | divided_by: 100.0 }}"
              class="w-full rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary"
            >
            <input
              type="number"
              aria-label="Maximum price"
              name="{{ filter.max_value.param_name }}"
              {%- if filter.max_value.value != blank -%}
                value="{{ filter.max_value.value | divided_by: 100.0 }}"
              {%- endif -%}
              placeholder="Max"
              min="0"
              max="{{ filter.range_max | divided_by: 100.0 }}"
              class="w-full rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface/30 focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </div>
          <div class="mt-2 flex items-center gap-2">
            <button
              type="submit"
              class="flex-1 rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Apply
            </button>
            {%- if filter.min_value.value != blank
              or filter.max_value.value != blank
            -%}
              <a
                href="{{ filter.url_to_remove }}"
                class="rounded-xl px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
              >
                Clear
              </a>
            {%- endif -%}
          </div>
        </form>
      </div>
    {%- endif -%}
  </details>
  ```

- [ ] **Step 2: Push to development theme and verify list filters are unchanged**

  ```bash
  npm run push
  ```

  Open `/collections/all` in a browser (Shopify development theme preview URL).

  Verify:
  - Any existing list-type filters (Availability) render identically to before — active/inactive/zero states all present
  - No visual regressions
  - No Liquid rendering errors (blank page or `Liquid error` text in the UI means a syntax error)

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/snippets/filter-group.liquid
  git commit -m "fix: add price_range support to filter-group snippet

  Wraps existing list filter rendering in a type check and adds a price_range
  branch with a min/max form. Active list-type filter params are preserved as
  hidden inputs so price filtering combines correctly with Pet, Category, and
  Availability filters."
  ```

---

## Task 2: Configure Search & Discovery filters in Shopify admin

**Context:** This task has no code changes. It configures the Shopify S&D app so that `collection.filters` returns the Pet, Category, Availability, and Price filter objects. Until S&D is configured, `collection.filters` is empty and the sidebar is hidden — the theme code from Task 1 won't render anything new.

Complete these steps in order. Steps 2a–2b are prerequisites; 2c is the S&D filter configuration.

- [ ] **Step 2a: Define the `pet.type` metafield (if not already defined)**

  In Shopify admin:
  1. Go to **Settings → Custom data → Products**
  2. Click **Add definition**
  3. Set:
     - **Name:** Pet Type (display name — not used in code)
     - **Namespace and key:** `pet.type`
     - **Type:** Single line text
  4. Save

  If a definition with namespace `pet` and key `type` already exists, skip this step.

- [ ] **Step 2b: Populate `pet.type` on products**

  For each product that belongs to a pet category:
  1. In Shopify admin, open the product
  2. Scroll to **Metafields**
  3. Set `pet.type` to exactly one of: `Dogs`, `Cats`, `Small Animals`, `Fish`
     - Casing must be consistent — S&D groups by exact string value
     - Products without a value are excluded when the pet filter is active (correct behavior)

  This can also be done via bulk import using Shopify's CSV import or a third-party metafield bulk-editor app.

- [ ] **Step 2c: Configure filters in Search & Discovery**

  In Shopify admin go to **Apps → Search & Discovery → Filters**.

  Add each filter below in order. Drag to reorder after adding all four.

  **Filter 1 — Pet**
  - Source: **Product metafields** → namespace `pet`, key `type`
  - Label: `Pet`
  - Display type: **List**

  **Filter 2 — Category**
  - Source: **Product type** (built-in Shopify field — no metafield needed)
  - Label: `Category`
  - Display type: **List**
  - Values come automatically from each product's "Product type" field

  **Filter 3 — Availability**
  - Source: **Availability** (built-in)
  - Label: `Availability`
  - Display type: **List**

  **Filter 4 — Price**
  - Source: **Price** (built-in)
  - Label: `Price`
  - Display type: **Price range**

  After adding all four, drag them into this order:
  1. Pet
  2. Category
  3. Availability
  4. Price

  Save.

- [ ] **Step 2d: Verify filters appear in the storefront**

  Open `/collections/all` in the development theme preview.

  Expected:
  - Desktop sidebar shows filter accordions in order: Pet → Category → Availability → Price
  - Mobile "Filters" button opens the drawer with the same four groups
  - Pet and Category values match what is set on products
  - Price accordion shows Min/Max inputs and an Apply button

---

## Task 3: Manual acceptance verification

**Context:** Liquid has no unit test framework. Verification is functional browser testing against the acceptance criteria from the spec.

- [ ] **Step 3a: Verify list filters work correctly**

  On `/collections/all`:
  - Click a Pet value (e.g. "Dogs") — URL gains the pet filter param, product grid updates, active pill appears in the controls bar
  - Click a Category value — URL gains the category filter param, product grid updates
  - Click an Availability value — same
  - Click the "×" on an active pill — filter is removed, product count recovers
  - Click "Clear all" — all filters reset
  - Zero-count values appear greyed and non-clickable

- [ ] **Step 3b: Verify price range filter**
  - Enter a Min value only and click Apply — URL gains the price min param, product grid updates, active pill shows a price range label
  - Enter a Max value only and click Apply — same for max
  - Enter both Min and Max and click Apply — both params in URL
  - Click "Clear" link inside the price accordion — price params removed from URL, other active filters preserved
  - With "Dogs" active, enter a price range and click Apply — URL keeps the pet filter param AND adds the price params (both filters active simultaneously)

- [ ] **Step 3c: Verify price inputs pre-fill when active**

  Apply a price range (e.g. Min 10, Max 50). With the filter active, open the Price accordion — inputs should show the currently active values (10 and 50). If they show unexpected values (e.g. hundredths like 0.1), the `divided_by: 100.0` conversion needs to be removed from `filter-group.liquid` — Shopify may return dollar values directly rather than cents.

  Fix if needed (removing `| divided_by: 100.0` from both value attributes):

  ```liquid
  value='{{ filter.min_value.value }}'
  ```

  ```liquid
  value='{{ filter.max_value.value }}'
  ```

- [ ] **Step 3d: Verify mobile filter drawer**
  - On a narrow viewport (< 1024px), tap "Filters" button — drawer opens with same four filter groups
  - Pet and Category filters behave identically to desktop
  - Price form submits and closes the drawer (it causes a page navigation)
  - No layout overflow or truncated labels

- [ ] **Step 3e: Commit verification complete**

  If any fixes were applied during Steps 3a–3d, commit them now:

  ```bash
  git add shopify/snippets/filter-group.liquid
  git commit -m "fix: correct price filter value display format"
  ```

  If no fixes were needed:

  ```bash
  git commit --allow-empty -m "chore: collection filter extension verified complete"
  ```

---

## Notes for implementer

**S&D propagation delay:** After saving filters in Search & Discovery, allow up to 60 seconds for changes to appear in the storefront. Hard-refresh (`Ctrl+Shift+R`) if filters don't appear immediately.

**Pet filter empty:** If the Pet filter accordion doesn't appear at all, it means no products have `pet.type` set. Complete Step 2b before expecting it to render.

**Product type values:** Whatever text is in each product's "Product type" field in Shopify admin becomes a Category filter option. Ensure consistency (e.g. "Food" not "food" or "Foods") before populating products.
