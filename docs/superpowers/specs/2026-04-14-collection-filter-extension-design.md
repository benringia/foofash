# Collection Filter Extension — Design Spec

**Date:** 2026-04-14  
**Status:** Approved  
**Scope:** Add Pet and Category filter groups to `/collections/all` using Shopify-native filtering

---

## Overview

Extend the existing FOOFASH collection filter sidebar to expose two new filter groups — Pet (Dogs, Cats, Small Animals, Fish) and Category (product type) — using Shopify's native `collection.filters` API. Fix a pre-existing gap in `filter-group.liquid` that causes price range filters to render silently empty.

---

## Architecture

### What changes

| File                                   | Change                                                    |
| -------------------------------------- | --------------------------------------------------------- |
| `shopify/snippets/filter-group.liquid` | Add `price_range` branch alongside existing `list` branch |
| Shopify Search & Discovery (admin)     | Configure Pet, Category, Availability, and Price filters  |

### What does not change

- `shopify/sections/main-collection.liquid` — already loops `collection.filters` dynamically in both desktop sidebar and mobile drawer
- `src/scripts/filters.js` — only handles sort select and mobile drawer; no changes needed
- All other theme files — unaffected

### How it works

`main-collection.liquid` renders `{%- render 'filter-group', filter: filter -%}` for every entry in `collection.filters`, identically in desktop and mobile. Any filter configured in Search & Discovery auto-appears in both contexts once `filter-group.liquid` can handle its type. No template-level changes required.

---

## filter-group.liquid — Changes

### Current state

The snippet unconditionally iterates `filter.values`. This only works for `list`-type filters. A `price_range` filter has no `.values` — it exposes `filter.min_value`, `filter.max_value`, and `filter.range_max`. Currently, price range filters render as an empty open accordion.

### New structure

```
<details> (accordion wrapper — unchanged)
  <summary> (label + chevron — unchanged)

  {%- if filter.type == 'list' -%}
    existing active/inactive/zero-count value rendering (unchanged)
  {%- elsif filter.type == 'price_range' -%}
    new: <form GET> with min/max inputs + Apply button + conditional Clear link
  {%- endif -%}
</details>
```

### Price range form spec

- `<form>` method `GET`, action `{{ collection.url }}` (clean URL, strips stale params)
- Carry sort order through via `<input type="hidden" name="sort_by" value="{{ collection.sort_by }}">` — `collection.sort_by` is globally accessible from any Liquid context including snippets rendered with `render`
- Input names use Shopify's param names: `filter.min_value.param_name` and `filter.max_value.param_name`
- Input values pre-filled from `filter.min_value.value` and `filter.max_value.value` when active
- Placeholder text: "Min" / "Max"
- Styling: `rounded-xl bg-surface-container-low px-3 py-2 text-sm` with focus ring
- Apply button: matches existing "Clear all" pill — `rounded-xl bg-primary/10 text-primary hover:bg-primary/15`
- Clear link: visible only when price range is active (`filter.min_value.value != blank or filter.max_value.value != blank`), links to `filter.url_to_remove`

### Active pills (no change needed)

The active filter pills bar in `main-collection.liquid` loops `filter.active_values`. Shopify populates this for `price_range` filters automatically with a formatted label (e.g. "$10 - $50"). The existing markup handles it correctly.

---

## Search & Discovery Configuration

### Prerequisites

Before configuring S&D filters, ensure the `pet.type` metafield definition exists:

1. Shopify admin → Settings → Custom data → Products
2. Add definition: namespace `pet`, key `type`, type **Single line text**
3. Populate products with values: `Dogs`, `Cats`, `Small Animals`, `Fish`
   - Casing must be consistent — S&D groups by exact string value

### Filter setup (Shopify admin → Apps → Search & Discovery → Filters)

#### Pet filter

- Source: **Product metafields** → namespace `pet`, key `type`
- Label: `Pet`
- Display type: **List**

#### Category filter

- Source: **Product type** (built-in Shopify field)
- Label: `Category`
- Display type: **List**
- Values come from each product's "Product type" field — only types with ≥1 product appear

#### Availability filter

- Source: **Availability** (built-in)
- Label: `Availability`
- Display type: **List**

#### Price filter

- Source: **Price** (built-in)
- Label: `Price`
- Display type: **Price range**

### Recommended filter order (drag in S&D UI)

1. Pet
2. Category
3. Availability
4. Price

---

## Edge Cases

| Scenario                                           | Behavior                                                                                              |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pet.type` metafield not populated on any product  | Pet filter absent from `collection.filters` — no empty accordion, no UI impact                        |
| Product has no `pet.type` value                    | Product excluded from filtered results; correct behavior                                              |
| Product Type field blank                           | Product excluded when filtering by Category; that type doesn't appear as an option                    |
| Price form submitted with empty inputs             | Shopify treats as no price filter — safe                                                              |
| Multi-filter combinations (Pet + Category + Price) | Shopify native URL params handle stacking; no JS intervention needed                                  |
| Zero-result filter combination                     | Existing empty state in `main-collection.liquid` handles with "Clear all filters" CTA                 |
| S&D not configured                                 | `collection.filters` is empty; sidebar and mobile filter button both hidden via existing conditionals |

---

## Acceptance Criteria

- Pet filter group appears in desktop sidebar and mobile drawer when `pet.type` data exists
- Category filter group appears when products have Product Type set
- Price range filter renders a functional min/max form instead of an empty accordion
- Availability filter continues to work as before
- All filters combine correctly via Shopify native URL params
- Active filter pills show for all filter types including price range
- No layout regressions on desktop or mobile
- No JavaScript errors
- No hardcoded filter values in theme code

---

## Out of Scope

- Emoji or icon decorators on filter values
- Custom JS range slider for price
- Any changes to `filters.js`, `main-collection.liquid`, or other theme files
