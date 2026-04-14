# Homepage CRO Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Foofash homepage into an 8-section conversion funnel by editing 3 existing sections, creating 2 new section files, and rewiring `index.json`.

**Architecture:** Minimal-change, max-reuse approach. Existing section files are edited in-place. Two new Liquid section files are created. `index.json` is fully rewritten with the new section order, updated settings, and new section entries. No JS or CSS changes required.

**Tech Stack:** Shopify OS 2.0, Liquid, Tailwind CSS (via Vite), `npm run push` to deploy.

**Spec:** `docs/superpowers/specs/2026-04-14-homepage-cro-funnel-design.md`

---

## File Map

| Status | File                                          | Change                                          |
| ------ | --------------------------------------------- | ----------------------------------------------- |
| Modify | `shopify/sections/trust-bar.liquid`           | Add `shipping`/`returns` icon colour mappings   |
| Modify | `shopify/sections/pet-type-nav.liquid`        | Grid layout, card tiles, anchor id, label arrow |
| Modify | `shopify/sections/featured-collection.liquid` | Eyebrow copy, trust chip, schema default        |
| Create | `shopify/sections/why-choose-us.liquid`       | New benefits section                            |
| Create | `shopify/sections/homepage-bundles.liquid`    | New collection-based kit cards section          |
| Modify | `shopify/templates/index.json`                | Full rewrite — new order + all settings         |

---

## Task 1: Add icon colour mappings to trust-bar.liquid

`shipping` and `returns` currently fall through to the grey `else` case. Add proper tinted backgrounds so the new trust bar items match the design system.

**Files:**

- Modify: `shopify/sections/trust-bar.liquid:8-21`

- [ ] **Step 1: Update the icon colour mapping `case` block**

In `shopify/sections/trust-bar.liquid`, replace the existing `case` block (lines 8–21):

```liquid
{%- liquid
  case block.settings.icon
    when 'vet-approved'
      assign icon_bg = 'bg-medical-green'
      assign icon_color = 'text-primary'
    when 'stethoscope'
      assign icon_bg = 'bg-orange-50'
      assign icon_color = 'text-secondary'
    when 'clock'
      assign icon_bg = 'bg-medical-blue'
      assign icon_color = 'text-primary'
    else
      assign icon_bg = 'bg-slate-50'
      assign icon_color = 'text-on-surface-variant'
  endcase
-%}
```

With:

```liquid
{%- liquid
  case block.settings.icon
    when 'vet-approved'
      assign icon_bg = 'bg-medical-green'
      assign icon_color = 'text-primary'
    when 'stethoscope'
      assign icon_bg = 'bg-orange-50'
      assign icon_color = 'text-secondary'
    when 'clock'
      assign icon_bg = 'bg-medical-blue'
      assign icon_color = 'text-primary'
    when 'shipping'
      assign icon_bg = 'bg-medical-blue'
      assign icon_color = 'text-primary'
    when 'returns'
      assign icon_bg = 'bg-orange-50'
      assign icon_color = 'text-secondary'
    else
      assign icon_bg = 'bg-slate-50'
      assign icon_color = 'text-on-surface-variant'
  endcase
-%}
```

- [ ] **Step 2: Commit**

```bash
git add shopify/sections/trust-bar.liquid
git commit -m "feat: add shipping and returns icon colour mappings to trust bar"
```

---

## Task 2: Update pet-type-nav.liquid — card tiles, grid, anchor

Convert the floating circles layout into tappable card tiles on a proper grid. Add `id="categories"` so the hero's "Shop by Pet" anchor CTA works.

**Files:**

- Modify: `shopify/sections/pet-type-nav.liquid`

- [ ] **Step 1: Replace the full section Liquid (above the `{% schema %}` tag)**

Replace everything from line 1 to the `{% schema %}` tag with:

```liquid
<section class="pet-type-nav bg-surface py-24" id="categories">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    {%- if section.settings.heading != blank
      or section.settings.subheading != blank
    -%}
      <div class="mb-16 text-center">
        {%- if section.settings.heading != blank -%}
          <h2 class="font-display text-4xl font-extrabold text-primary mb-4">
            {{ section.settings.heading }}
          </h2>
        {%- endif -%}
        {%- if section.settings.subheading != blank -%}
          <p class="text-on-surface-variant font-medium">
            {{ section.settings.subheading }}
          </p>
        {%- endif -%}
      </div>
    {%- endif -%}

    {%- if section.blocks.size > 0 -%}
      <ul class="grid grid-cols-2 gap-6 md:grid-cols-4" role="list">
        {%- for block in section.blocks -%}
          <li {{ block.shopify_attributes }}>
            <a
              href="{{ block.settings.link | default: '#' }}"
              class="group flex flex-col items-center bg-white rounded-3xl p-6 shadow-bubbly hover:-translate-y-1 hover:shadow-bubbly-lg transition-all duration-300 cursor-pointer"
            >
              <div class="w-32 h-32 rounded-full overflow-hidden">
                {%- if block.settings.image != blank -%}
                  {{
                    block.settings.image
                    | image_url: width: 288
                    | image_tag:
                      width: 288,
                      height: 288,
                      loading: 'lazy',
                      class: 'h-full w-full object-cover',
                      alt: block.settings.label
                    | default: block.settings.image.alt
                  }}
                {%- else -%}
                  <div class="flex h-full w-full items-center justify-center bg-surface-container text-primary">
                    {%- render 'icon', icon: 'paw' -%}
                  </div>
                {%- endif -%}
              </div>
              {%- if block.settings.label != blank -%}
                <span class="mt-4 text-lg font-bold text-primary flex items-center gap-1">
                  {{ block.settings.label }}
                  <span aria-hidden="true">→</span>
                </span>
              {%- endif -%}
            </a>
          </li>
        {%- endfor -%}
      </ul>
    {%- endif -%}
  </div>
</section>
```

The `{% schema %}` block is unchanged — leave it exactly as-is.

- [ ] **Step 2: Commit**

```bash
git add shopify/sections/pet-type-nav.liquid
git commit -m "feat: update pet-type-nav to card tile grid with anchor id"
```

---

## Task 3: Update featured-collection.liquid — Best Sellers

Three targeted copy changes: eyebrow label, "Fast dispatch" trust chip → "Free shipping over $50", and schema default for view-all button.

**Files:**

- Modify: `shopify/sections/featured-collection.liquid`

- [ ] **Step 1: Update the hardcoded eyebrow label**

Find and replace this line:

```liquid
<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary/70">
  Most-loved picks this week
</p>
```

With:

```liquid
<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-primary/70">
  Customer Favorites
</p>
```

- [ ] **Step 2: Update the "Fast dispatch" trust chip**

Find and replace the fast dispatch chip block:

```liquid
<span class="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface">
  <span class="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true">
    {%- render 'icon', icon: 'clock' -%}
  </span>
  Fast dispatch
</span>
```

With:

```liquid
<span class="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-on-surface">
  <span class="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true">
    {%- render 'icon', icon: 'shipping' -%}
  </span>
  Free shipping over $50
</span>
```

- [ ] **Step 3: Update the schema default for view_all_label**

In the `{% schema %}` block, find:

```json
    {
      "type": "text",
      "id": "view_all_label",
      "label": "View all label",
      "default": "View All Products"
    },
```

Replace with:

```json
    {
      "type": "text",
      "id": "view_all_label",
      "label": "View all label",
      "default": "Shop All Best Sellers"
    },
```

- [ ] **Step 4: Commit**

```bash
git add shopify/sections/featured-collection.liquid
git commit -m "feat: update featured-collection copy for Best Sellers section"
```

---

## Task 4: Create why-choose-us.liquid

New block-based benefits section. Four tiles: Vet Approved, Free Shipping, Easy Returns, Clinic-Backed Care.

**Files:**

- Create: `shopify/sections/why-choose-us.liquid`

- [ ] **Step 1: Create the file**

Create `shopify/sections/why-choose-us.liquid` with this content:

```liquid
{%- if section.blocks.size > 0 -%}
  <section class="why-choose-us bg-surface py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      {%- if section.settings.heading != blank
        or section.settings.subheading != blank
      -%}
        <div class="mb-16 text-center">
          {%- if section.settings.heading != blank -%}
            <h2 class="font-display text-4xl font-extrabold text-primary mb-4">
              {{ section.settings.heading }}
            </h2>
          {%- endif -%}
          {%- if section.settings.subheading != blank -%}
            <p class="text-on-surface-variant font-medium max-w-xl mx-auto">
              {{ section.settings.subheading }}
            </p>
          {%- endif -%}
        </div>
      {%- endif -%}

      <ul
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {%- for block in section.blocks -%}
          {%- liquid
            case block.settings.icon
              when 'vet-approved'
                assign icon_bg = 'bg-medical-green'
                assign icon_color = 'text-primary'
              when 'shipping'
                assign icon_bg = 'bg-medical-blue'
                assign icon_color = 'text-primary'
              when 'returns'
                assign icon_bg = 'bg-orange-50'
                assign icon_color = 'text-secondary'
              else
                assign icon_bg = 'bg-surface-container'
                assign icon_color = 'text-on-surface-variant'
            endcase
          -%}
          <li
            class="flex flex-col bg-white rounded-3xl p-8 shadow-bubbly hover:-translate-y-1 transition-all duration-300"
            {{ block.shopify_attributes }}
          >
            {%- if block.settings.icon != blank -%}
              <div
                class="w-16 h-16 {{ icon_bg }} rounded-2xl flex items-center justify-center mb-6"
                aria-hidden="true"
              >
                <span class="h-8 w-8 {{ icon_color }}">
                  {%- render 'icon', icon: block.settings.icon -%}
                </span>
              </div>
            {%- endif -%}
            {%- if block.settings.title != blank -%}
              <h3 class="text-xl font-bold text-primary mb-3">
                {{ block.settings.title }}
              </h3>
            {%- endif -%}
            {%- if block.settings.description != blank -%}
              <p class="text-on-surface-variant leading-relaxed">
                {{ block.settings.description }}
              </p>
            {%- endif -%}
          </li>
        {%- endfor -%}
      </ul>
    </div>
  </section>
{%- endif -%}

{% schema %}
{
  "name": "Why Choose Us",
  "max_blocks": 4,
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Why Pet Parents Choose Foofash"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Care you can trust, backed by a real veterinary team"
    }
  ],
  "blocks": [
    {
      "type": "benefit",
      "name": "Benefit",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Icon name",
          "info": "Supported: vet-approved, shipping, returns, paw"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title"
        },
        {
          "type": "textarea",
          "id": "description",
          "label": "Description"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Why Choose Us",
      "blocks": [
        {
          "type": "benefit",
          "settings": {
            "icon": "vet-approved",
            "title": "Vet Approved",
            "description": "Every product is reviewed and recommended by our in-house veterinary team"
          }
        },
        {
          "type": "benefit",
          "settings": {
            "icon": "shipping",
            "title": "Free Shipping",
            "description": "Free delivery on all orders over $50 — fast, reliable, tracked"
          }
        },
        {
          "type": "benefit",
          "settings": {
            "icon": "returns",
            "title": "Easy Returns",
            "description": "Changed your mind? 30-day hassle-free returns, no questions asked"
          }
        },
        {
          "type": "benefit",
          "settings": {
            "icon": "paw",
            "title": "Clinic-Backed Care",
            "description": "Products chosen by vets who treat pets daily — not just sourced for the shelf"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add shopify/sections/why-choose-us.liquid
git commit -m "feat: create why-choose-us section with benefit tiles"
```

---

## Task 5: Create homepage-bundles.liquid

New collection-based section that surfaces 2–3 kit products as editorial cards. Falls back to skeleton placeholders when no collection is assigned.

**Files:**

- Create: `shopify/sections/homepage-bundles.liquid`

- [ ] **Step 1: Create the file**

Create `shopify/sections/homepage-bundles.liquid` with this content:

```liquid
{%- liquid
  assign kits_collection = section.settings.collection
  assign limit = section.settings.products_to_show
-%}

<section class="homepage-bundles bg-white py-24 rounded-t-[4rem] rounded-b-[4rem] shadow-bubbly-lg">
  <div class="mx-auto max-w-7xl px-6 lg:px-8">
    <div class="mb-12 text-center">
      {%- if section.settings.eyebrow != blank -%}
        <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">
          {{ section.settings.eyebrow }}
        </p>
      {%- endif -%}
      {%- if section.settings.heading != blank -%}
        <h2 class="font-display text-4xl font-extrabold text-primary">
          {{ section.settings.heading }}
        </h2>
      {%- endif -%}
      {%- if section.settings.subheading != blank -%}
        <p class="mt-2 text-on-surface-variant font-medium">
          {{ section.settings.subheading }}
        </p>
      {%- endif -%}
    </div>

    {%- if kits_collection != blank and kits_collection.products_count > 0 -%}
      <ul
        class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {%- for product in kits_collection.products limit: limit -%}
          {%- assign short_desc = product.description
            | strip_html
            | truncate: 100
          -%}
          <li>
            <article class="group flex flex-col bg-surface rounded-3xl overflow-hidden shadow-bubbly hover:-translate-y-1 hover:shadow-bubbly-lg transition-all duration-300">
              <div class="relative aspect-video overflow-hidden">
                {%- if product.featured_image != blank -%}
                  {{
                    product.featured_image
                    | image_url: width: 800
                    | image_tag:
                      loading: 'lazy',
                      width: 800,
                      class: 'w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700',
                      alt: product.featured_image.alt
                    | default: product.title
                  }}
                {%- else -%}
                  <div class="flex h-full w-full items-center justify-center bg-surface-container text-primary/20">
                    {%- render 'icon', icon: 'paw' -%}
                  </div>
                {%- endif -%}
                <span class="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white">
                  Starter Kit
                </span>
              </div>

              <div class="flex flex-1 flex-col p-6 gap-4">
                <h3 class="text-xl font-bold text-primary leading-snug">
                  {{ product.title }}
                </h3>

                {%- if short_desc != blank -%}
                  <p class="text-sm text-on-surface-variant leading-relaxed flex-1">
                    {{ short_desc }}
                  </p>
                {%- endif -%}

                <div class="flex items-center gap-2">
                  <span class="text-lg font-extrabold text-primary">
                    {{- product.price | money -}}
                  </span>
                  {%- if product.compare_at_price > product.price -%}
                    <span class="text-sm text-on-surface-variant/60 line-through">
                      {{- product.compare_at_price | money -}}
                    </span>
                  {%- endif -%}
                </div>

                <a
                  href="{{ product.url }}"
                  class="block w-full rounded-full bg-primary px-6 py-3 text-center font-bold text-white shadow-bubbly hover:bg-primary-dim hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Shop This Kit
                </a>
                <a
                  href="{{ product.url }}"
                  class="text-center text-sm font-semibold text-primary/60 hover:text-primary transition-colors"
                >
                  What's included →
                </a>
              </div>
            </article>
          </li>
        {%- endfor -%}
      </ul>
    {%- else -%}
      <ul
        class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {%- for i in (1..3) -%}
          <li>
            <article class="bg-surface rounded-3xl overflow-hidden shadow-bubbly">
              <div
                class="aspect-video animate-pulse bg-surface-container"
              ></div>
              <div class="p-6 space-y-3">
                <div
                  class="h-5 w-3/4 animate-pulse rounded-full bg-surface-container"
                ></div>
                <div
                  class="h-4 w-full animate-pulse rounded-full bg-surface-container"
                ></div>
                <div
                  class="h-4 w-2/3 animate-pulse rounded-full bg-surface-container"
                ></div>
              </div>
            </article>
          </li>
        {%- endfor -%}
      </ul>
      <p class="mt-6 text-center text-sm text-on-surface-variant/50">
        No kits found — assign a Starter Kits collection in the theme editor.
      </p>
    {%- endif -%}
  </div>
</section>

{% schema %}
{
  "name": "Homepage Bundles",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow label",
      "default": "Starter Kits"
    },
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Complete Care Kits"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Everything your pet needs, curated by our vet team"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Starter Kits collection"
    },
    {
      "type": "range",
      "id": "products_to_show",
      "label": "Kits to show",
      "min": 2,
      "max": 3,
      "step": 1,
      "default": 3
    }
  ],
  "presets": [
    {
      "name": "Homepage Bundles"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add shopify/sections/homepage-bundles.liquid
git commit -m "feat: create homepage-bundles section with collection-based kit cards"
```

---

## Task 6: Rewrite index.json — new funnel order

Full replacement of `shopify/templates/index.json`. New order: hero → trust-bar → pet-type-nav → featured-collection → why-choose-us → homepage-bundles → testimonials → cta. Clinic sections (`services-grid`, `clinic-info`) are removed. Hero image setting is preserved.

**Files:**

- Modify: `shopify/templates/index.json`

- [ ] **Step 1: Replace the entire file**

Overwrite `shopify/templates/index.json` with:

```json
{
  "sections": {
    "hero-banner": {
      "type": "hero-banner",
      "settings": {
        "eyebrow": "Vet-Approved Pet Care",
        "heading": "Happy Paws,",
        "heading_accent": "Healthy Hearts",
        "subheading": "Premium, vet-approved products for every pet in your family. Fast shipping, easy returns, and a team that genuinely cares.",
        "primary_cta_label": "Shop Now",
        "primary_cta_link": "shopify://collections/all",
        "secondary_cta_label": "Shop by Pet",
        "secondary_cta_link": "#categories",
        "trust_label": "Trusted by 5,000+ Pet Parents",
        "image": "shopify://shop_images/Gemini_Generated_Image_dild5ldild5ldild.png",
        "stat_1_value": "4.9★",
        "stat_1_label": "Average Rating",
        "stat_2_value": "5,000+",
        "stat_2_label": "Happy Pets"
      }
    },
    "trust-bar": {
      "type": "trust-bar",
      "blocks": {
        "trust_vet": {
          "type": "trust_item",
          "settings": {
            "icon": "vet-approved",
            "title": "Vet Approved",
            "subtitle": "Clinically recommended"
          }
        },
        "trust_shipping": {
          "type": "trust_item",
          "settings": {
            "icon": "shipping",
            "title": "Free Shipping",
            "subtitle": "On orders over $50"
          }
        },
        "trust_returns": {
          "type": "trust_item",
          "settings": {
            "icon": "returns",
            "title": "Easy Returns",
            "subtitle": "30-day hassle-free"
          }
        },
        "trust_paw": {
          "type": "trust_item",
          "settings": {
            "icon": "paw",
            "title": "5,000+ Happy Pets",
            "subtitle": "Trusted by pet parents"
          }
        }
      },
      "block_order": [
        "trust_vet",
        "trust_shipping",
        "trust_returns",
        "trust_paw"
      ],
      "settings": {}
    },
    "pet-type-nav": {
      "type": "pet-type-nav",
      "blocks": {
        "pet_dogs": {
          "type": "pet_category",
          "settings": {
            "image": "shopify://shop_images/cute-dog-for-thumbnail.png",
            "label": "Dogs",
            "link": ""
          }
        },
        "pet_cats": {
          "type": "pet_category",
          "settings": {
            "image": "shopify://shop_images/cute-cat-for-thumbnail.png",
            "label": "Cats",
            "link": ""
          }
        },
        "pet_small": {
          "type": "pet_category",
          "settings": {
            "image": "shopify://shop_images/cute-hamster-for-thumbnail.png",
            "label": "Small Animals",
            "link": ""
          }
        },
        "pet_fish": {
          "type": "pet_category",
          "settings": {
            "image": "shopify://shop_images/fish-for-thumbnail.png",
            "label": "Fish",
            "link": ""
          }
        }
      },
      "block_order": ["pet_dogs", "pet_cats", "pet_small", "pet_fish"],
      "settings": {
        "heading": "Shop by Pet",
        "subheading": ""
      }
    },
    "featured-collection": {
      "type": "featured-collection",
      "settings": {
        "heading": "Best Sellers",
        "subheading": "The products your pets keep coming back to",
        "view_all_label": "Shop All Best Sellers",
        "view_all_link": "shopify://collections/all",
        "collection": "",
        "products_to_show": 4
      }
    },
    "why-choose-us": {
      "type": "why-choose-us",
      "blocks": {
        "benefit_vet": {
          "type": "benefit",
          "settings": {
            "icon": "vet-approved",
            "title": "Vet Approved",
            "description": "Every product is reviewed and recommended by our in-house veterinary team"
          }
        },
        "benefit_shipping": {
          "type": "benefit",
          "settings": {
            "icon": "shipping",
            "title": "Free Shipping",
            "description": "Free delivery on all orders over $50 — fast, reliable, tracked"
          }
        },
        "benefit_returns": {
          "type": "benefit",
          "settings": {
            "icon": "returns",
            "title": "Easy Returns",
            "description": "Changed your mind? 30-day hassle-free returns, no questions asked"
          }
        },
        "benefit_clinic": {
          "type": "benefit",
          "settings": {
            "icon": "paw",
            "title": "Clinic-Backed Care",
            "description": "Products chosen by vets who treat pets daily — not just sourced for the shelf"
          }
        }
      },
      "block_order": [
        "benefit_vet",
        "benefit_shipping",
        "benefit_returns",
        "benefit_clinic"
      ],
      "settings": {
        "heading": "Why Pet Parents Choose Foofash",
        "subheading": "Care you can trust, backed by a real veterinary team"
      }
    },
    "homepage-bundles": {
      "type": "homepage-bundles",
      "settings": {
        "eyebrow": "Starter Kits",
        "heading": "Complete Care Kits",
        "subheading": "Everything your pet needs, curated by our vet team",
        "collection": "",
        "products_to_show": 3
      }
    },
    "testimonials": {
      "type": "testimonials",
      "blocks": {
        "testimonial_1": {
          "type": "testimonial",
          "settings": {
            "quote": "The only clinic where Barnaby feels at home. The staff's care for animals is truly heartwarming.",
            "author_name": "Sarah Jenkins",
            "author_meta": "Owner of two rescue kittens"
          }
        },
        "testimonial_2": {
          "type": "testimonial",
          "settings": {
            "quote": "Exquisite boutique products and world-class vets. They've helped Bella through so much with such grace.",
            "author_name": "Mark Thompson",
            "author_meta": "Labrador dad, since 2019"
          }
        },
        "testimonial_3": {
          "type": "testimonial",
          "settings": {
            "quote": "Booking an appointment is seamless. I appreciate the transparency and the joyful energy of the clinic.",
            "author_name": "Elena Rodriguez",
            "author_meta": "Cat mum and online shopper"
          }
        }
      },
      "block_order": ["testimonial_1", "testimonial_2", "testimonial_3"],
      "settings": {
        "heading": "Loved by Pets & Parents",
        "padding": "py-24"
      }
    },
    "cta": {
      "type": "cta",
      "settings": {
        "heading": "Your pet deserves the best. Start here.",
        "subheading": "Vet-approved products, fast shipping, and a team that genuinely cares.",
        "primary_cta_label": "Shop Now",
        "primary_cta_link": "shopify://collections/all",
        "secondary_cta_label": "Meet Our Vets",
        "secondary_cta_link": "shopify://pages/our-team",
        "padding": "py-24"
      }
    }
  },
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
}
```

- [ ] **Step 2: Push to Shopify and verify**

```bash
npm run push
```

Expected: Shopify CLI uploads all changed files without errors. If you see `[error] Invalid JSON` in the output, check `index.json` for syntax issues.

- [ ] **Step 3: Verify the homepage in a browser**

Open the Shopify preview URL (from `npm run dev` or the Shopify admin > Themes > Preview). Check each section in order:

1. **Hero** — "Shop Now" primary CTA, "Shop by Pet" secondary CTA, "Vet-Approved Pet Care" eyebrow
2. **Trust Bar** — 4 tiles: Vet Approved (green), Free Shipping (blue), Easy Returns (orange), 5,000+ Happy Pets (grey paw)
3. **Shop by Pet** — 2×2 grid on mobile, 4-col on desktop, each category is a card tile with label + `→` arrow, card lifts on hover
4. **Best Sellers** — "Customer Favorites" eyebrow, "Best Sellers" heading, "Free shipping over $50" chip, "Shop All Best Sellers" button
5. **Why Choose Us** — 4 benefit tiles on white cards with tinted icon circles
6. **Homepage Bundles** — skeleton placeholders with "No kits found" message (expected — no collection assigned yet). Assign a real "Starter Kits" collection in the Shopify admin to populate it
7. **Testimonials** — 3 review cards, "Loved by Pets & Parents" heading
8. **Final CTA** — dark primary banner with "Your pet deserves the best. Start here."

- [ ] **Step 4: Confirm clinic sections are gone**

Verify `Services Grid` and `Clinic Info` sections do not appear on the homepage. Their `.liquid` files should still exist:

```bash
ls shopify/sections/services_grid.liquid shopify/sections/clinic-info.liquid
```

Expected: both files listed (not deleted).

- [ ] **Step 5: Commit**

```bash
git add shopify/templates/index.json
git commit -m "feat: rewire homepage to CRO funnel — 8-section conversion flow"
```

---

## Post-Implementation Checklist

- [ ] Hero "Shop by Pet" CTA scrolls to `#categories` section smoothly
- [ ] No console errors on homepage load
- [ ] Trust bar icons render with correct tinted backgrounds (not grey fallback)
- [ ] Category cards lift on hover (desktop)
- [ ] Bundle section shows skeletons gracefully until a collection is assigned
- [ ] `services_grid.liquid` and `clinic-info.liquid` files still exist in `shopify/sections/`
- [ ] `npm run push` completes without errors
