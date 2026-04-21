# Clinic Services Homepage Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a premium, booking-oriented Clinic Services section to the FOOFASH homepage that surfaces service products via merchant-configured product picker blocks and links each card to its service product page.

**Architecture:** Two-file change — create `shopify/sections/clinic-services.liquid` (the full section: header, 4-card grid via `limit: 4` block loop, optional footer CTA) and patch `shopify/templates/index.json` to insert it between `why-choose-us` and `homepage-bundles`. Product data is resolved live via `all_products[block.settings.product]`. Existing `icon.liquid` snippet and design tokens are reused throughout.

**Tech Stack:** Shopify OS 2.0, Liquid, Tailwind CSS (utility-first, no new classes needed — all tokens exist in `tailwind.config.js`)

---

## File Map

| Action | Path                                      | Responsibility                            |
| ------ | ----------------------------------------- | ----------------------------------------- |
| Create | `shopify/sections/clinic-services.liquid` | Section HTML + Liquid logic + JSON schema |
| Modify | `shopify/templates/index.json`            | Insert section into homepage order        |

---

## Task 1: Create `shopify/sections/clinic-services.liquid`

**Files:**

- Create: `shopify/sections/clinic-services.liquid`

This is the entire section. It reuses:

- Header pattern from `homepage-bundles.liquid` (eyebrow + h2 + subheading, centered)
- Card hover lift from `why-choose-us.liquid` (`hover:-translate-y-1 transition-all duration-300`)
- Product resolution from `homepage-bundles.liquid` (`all_products[block.settings.product]`)
- Image fallback from `homepage-bundles.liquid` (placeholder bg + centered icon)
- `{% render 'icon', icon: '...' %}` snippet (already supports: stethoscope, paw, tooth, scissors, syringe)
- Metafields: `product.metafields.service.tagline`, `product.metafields.service.price_prefix`

- [ ] **Step 1: Create the file with the full section content**

Create `shopify/sections/clinic-services.liquid` with this exact content:

```liquid
{%- liquid
  assign has_blocks = false
  for block in section.blocks
    assign has_blocks = true
    break
  endfor
-%}

<section class="clinic-services bg-surface-low py-24 rounded-t-[4rem] rounded-b-[4rem] shadow-bubbly-lg">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mb-12 text-center">
      {%- if section.settings.eyebrow != blank -%}
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary">
          {{- section.settings.eyebrow -}}
        </p>
      {%- endif -%}
      {%- if section.settings.heading != blank -%}
        <h2 class="font-display text-4xl font-extrabold text-primary">
          {{ section.settings.heading }}
        </h2>
      {%- endif -%}
      {%- if section.settings.subheading != blank -%}
        <p class="mt-2 text-on-surface-variant font-medium max-w-xl mx-auto">
          {{ section.settings.subheading }}
        </p>
      {%- endif -%}
    </div>

    {%- if has_blocks -%}
      <ul
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {%- for block in section.blocks limit: 4 -%}
          {%- liquid
            assign product = all_products[block.settings.product]
            if product == blank
              continue
            endif
            assign tagline = product.metafields.service.tagline
            if tagline == blank
              assign tagline = product.description | strip_html | truncate: 80
            endif
            assign price_prefix = product.metafields.service.price_prefix
          -%}
          <li {{ block.shopify_attributes }}>
            <article class="group flex flex-col bg-white rounded-3xl shadow-bubbly hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full">
              <div class="relative aspect-[3/2] overflow-hidden">
                {%- if product.featured_image != blank -%}
                  {{
                    product.featured_image
                    | image_url: width: 600
                    | image_tag:
                      loading: 'lazy',
                      width: 600,
                      class: 'w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700',
                      alt: product.featured_image.alt
                    | default: product.title
                  }}
                {%- else -%}
                  <div class="flex h-full w-full items-center justify-center bg-surface-container">
                    <span class="h-12 w-12 text-primary/20" aria-hidden="true">
                      {%- render 'icon', icon: 'stethoscope' -%}
                    </span>
                  </div>
                {%- endif -%}

                <div
                  class="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 shadow-ambient"
                  aria-hidden="true"
                >
                  <span class="h-4 w-4 flex-shrink-0 text-primary">
                    {%- render 'icon', icon: block.settings.icon -%}
                  </span>
                  {%- if product.type != blank -%}
                    <span class="text-xs font-semibold text-on-surface-variant">
                      {{- product.type -}}
                    </span>
                  {%- endif -%}
                </div>
              </div>

              <div class="flex flex-1 flex-col p-5">
                <h3 class="font-bold text-primary text-lg leading-snug">
                  {{ product.title }}
                </h3>
                {%- if tagline != blank -%}
                  <p class="mt-1 text-sm text-on-surface-variant">
                    {{ tagline }}
                  </p>
                {%- endif -%}

                <p class="mt-3 text-sm font-semibold text-on-surface">
                  {%- if price_prefix != blank -%}
                    {{ price_prefix }}&#32;
                  {%- endif -%}
                  {{- product.price | money -}}
                </p>

                <a
                  href="{{ product.url }}"
                  class="mt-4 block w-full rounded-xl bg-primary-gradient py-3 text-center text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {{ block.settings.cta_label }}
                </a>
              </div>
            </article>
          </li>
        {%- endfor -%}
      </ul>
    {%- else -%}
      <ul
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {%- for i in (1..4) -%}
          <li>
            <article class="flex flex-col bg-white rounded-3xl shadow-bubbly overflow-hidden">
              <div
                class="aspect-[3/2] animate-pulse bg-surface-container"
              ></div>
              <div class="p-5 space-y-3">
                <div
                  class="h-5 w-3/4 animate-pulse rounded-full bg-surface-container"
                ></div>
                <div
                  class="h-4 w-full animate-pulse rounded-full bg-surface-container"
                ></div>
                <div
                  class="mt-4 h-10 w-full animate-pulse rounded-xl bg-surface-container"
                ></div>
              </div>
            </article>
          </li>
        {%- endfor -%}
      </ul>
      <p class="mt-6 text-center text-sm text-on-surface-variant/50">
        Add service blocks in the theme editor to display your clinic services.
      </p>
    {%- endif -%}

    {%- if section.settings.cta_url != blank -%}
      <div class="mt-12 text-center">
        <a
          href="{{ section.settings.cta_url }}"
          class="inline-flex items-center gap-2 rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {{ section.settings.cta_label | default: 'View all services' }}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    {%- endif -%}
  </div>
</section>

{% schema %}
{
  "name": "Clinic Services",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow label",
      "default": "Our Clinic Services"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Care Your Pet Deserves"
    },
    {
      "type": "textarea",
      "id": "subheading",
      "label": "Subheading",
      "default": "Book a clinic visit for expert care from our veterinary team."
    },
    {
      "type": "header",
      "content": "Footer link"
    },
    {
      "type": "text",
      "id": "cta_label",
      "label": "Link label",
      "default": "View all services"
    },
    {
      "type": "url",
      "id": "cta_url",
      "label": "Link URL"
    }
  ],
  "blocks": [
    {
      "type": "service",
      "name": "Service",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Service product"
        },
        {
          "type": "select",
          "id": "icon",
          "label": "Card icon",
          "options": [
            { "value": "stethoscope", "label": "Stethoscope" },
            { "value": "paw", "label": "Paw" },
            { "value": "tooth", "label": "Tooth" },
            { "value": "scissors", "label": "Scissors" },
            { "value": "syringe", "label": "Syringe" }
          ],
          "default": "stethoscope"
        },
        {
          "type": "text",
          "id": "cta_label",
          "label": "Button label",
          "default": "Book Now"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Clinic Services"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add shopify/sections/clinic-services.liquid
git commit -m "feat: add clinic-services homepage section"
```

---

## Task 2: Wire into `shopify/templates/index.json`

**Files:**

- Modify: `shopify/templates/index.json`

Two changes needed:

1. Add a `"clinic-services"` entry to the `"sections"` object
2. Insert `"clinic-services"` into the `"order"` array between `"why-choose-us"` and `"homepage-bundles"`

- [ ] **Step 1: Add the section entry to the `"sections"` object**

In `shopify/templates/index.json`, after the closing `}` of the `"why-choose-us"` entry (around line 174), add:

```json
    "clinic-services": {
      "type": "clinic-services",
      "blocks": {},
      "block_order": [],
      "settings": {
        "eyebrow": "Our Clinic Services",
        "heading": "Care Your Pet Deserves",
        "subheading": "Book a clinic visit for expert care from our veterinary team.",
        "cta_label": "View all services",
        "cta_url": ""
      }
    },
```

- [ ] **Step 2: Insert into the `"order"` array**

In `shopify/templates/index.json`, the `"order"` array currently reads:

```json
  "order": [
    "hero-banner",
    "trust-bar",
    "pet-type-nav",
    "featured-collection",
    "why-choose-us",
    "homepage-bundles",
    "testimonials",
    "cta"
  ]
```

Change it to:

```json
  "order": [
    "hero-banner",
    "trust-bar",
    "pet-type-nav",
    "featured-collection",
    "why-choose-us",
    "clinic-services",
    "homepage-bundles",
    "testimonials",
    "cta"
  ]
```

- [ ] **Step 3: Commit**

```bash
git add shopify/templates/index.json
git commit -m "feat: add clinic-services to homepage between why-choose-us and bundles"
```

---

## Task 3: Verify end-to-end

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: Vite compiles and Shopify CLI starts theme preview. No build errors in terminal output.

- [ ] **Step 2: Open the Shopify theme customizer for the homepage**

Navigate to the homepage in the theme preview. Confirm the Clinic Services section appears between "Why Choose Us" and "Homepage Bundles". Without any blocks configured it should show 4 skeleton pulse cards and the helper text "Add service blocks in the theme editor to display your clinic services."

- [ ] **Step 3: Add 4 service product blocks in the customizer**

In the customizer sidebar, add 4 "Service" blocks to the Clinic Services section. For each block, select a real service product (General Checkup, Vaccination, Dental Care, Grooming). Confirm:

- Product image renders at 3:2 aspect ratio
- Icon badge appears bottom-left of image with the correct icon and product type text
- Product title, descriptor, and price all render below the image
- "Book Now" button is full-width with gradient background

- [ ] **Step 4: Test edge cases**

Test each of the following and confirm the correct fallback renders:

| Test                                                          | Expected result                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Add a block with a product that has no featured image         | `bg-surface-container` placeholder with centered faint stethoscope icon          |
| Select a product where `service.tagline` metafield is not set | Descriptor shows `product.description` truncated to ~80 chars                    |
| Select a product where `service.price_prefix` is not set      | Price renders without prefix (just the money amount)                             |
| Add a 5th block                                               | Only 4 cards render in the grid; 5th block appears in customizer but not on page |
| Leave `cta_url` blank                                         | No footer link row renders                                                       |
| Set `cta_url` to `/pages/clinic`                              | Footer row renders with "View all services →" linking to `/pages/clinic`         |

- [ ] **Step 5: Verify responsive layout**

Resize the browser:

- Mobile (<768px): 1-column grid, cards stack vertically
- Tablet (768px–1023px): 2-column grid
- Desktop (≥1024px): 4-column grid

- [ ] **Step 6: Verify "Book Now" links**

Click a "Book Now" button. Confirm it navigates to the correct service product page (using the `product.service` template with the full booking flow).

- [ ] **Step 7: Final commit if any adjustments were made during verification**

```bash
git add -p
git commit -m "fix: adjust clinic-services section after verification"
```
