# Homepage CRO Funnel Redesign — Design Spec

**Date:** 2026-04-14
**Project:** Foofash Shopify Theme
**Approach:** Minimal-change, max-reuse (Approach A)

---

## Objective

Transform the homepage from a clinic-and-shop hybrid layout into a focused, conversion-driven product funnel. Remove clinic logistics (services booking, clinic address) from the homepage flow. Add two new sections (Why Choose Us, Homepage Bundles). Refine existing sections for stronger visual hierarchy and CRO clarity.

---

## Section Order (New)

| #   | Section Key           | File                         | Work Type                         |
| --- | --------------------- | ---------------------------- | --------------------------------- |
| 1   | `hero-banner`         | `hero-banner.liquid`         | Settings update                   |
| 2   | `trust-bar`           | `trust-bar.liquid`           | Block content update (index.json) |
| 3   | `pet-type-nav`        | `pet-type-nav.liquid`        | Liquid edit                       |
| 4   | `featured-collection` | `featured-collection.liquid` | Liquid edit + settings            |
| 5   | `why-choose-us`       | `why-choose-us.liquid`       | **New section file**              |
| 6   | `homepage-bundles`    | `homepage-bundles.liquid`    | **New section file**              |
| 7   | `testimonials`        | `testimonials.liquid`        | Settings only                     |
| 8   | `cta`                 | `cta.liquid`                 | Add to index.json                 |

**Removed from index.json (files kept):** `services-grid`, `clinic-info`

---

## Section Designs

### 1. Hero Banner (`hero-banner.liquid`)

Settings updated in `index.json`:

- `eyebrow`: "Vet-Approved Pet Care"
- `heading`: "Happy Paws," (keep)
- `heading_accent`: "Healthy Hearts" (keep)
- `subheading`: "Premium, vet-approved products for every pet in your family. Fast shipping, easy returns, and a team that genuinely cares."
- `primary_cta_label`: "Shop Now"
- `primary_cta_link`: `/collections/all`
- `secondary_cta_label`: "Shop by Pet"
- `secondary_cta_link`: `#categories`
- `trust_label`: "Trusted by 5,000+ Pet Parents" (keep)
- `stat_1_value`: "4.9★" (keep)
- `stat_1_label`: "Average Rating" (keep)
- `stat_2_value`: "5,000+" (keep)
- `stat_2_label`: "Happy Pets" (keep)

No Liquid file changes required.

---

### 2. Trust Bar (`trust-bar.liquid`)

Block content updated in `index.json` to replace clinic-heavy signals with e-commerce trust signals:

| Icon           | Title             | Subtitle               |
| -------------- | ----------------- | ---------------------- |
| `vet-approved` | Vet Approved      | Clinically recommended |
| `shipping`     | Free Shipping     | On orders over $50     |
| `returns`      | Easy Returns      | 30-day hassle-free     |
| `paw`          | 5,000+ Happy Pets | Trusted by pet parents |

Note: `shipping` and `returns` icons must be verified in `snippets/icon.liquid`. If missing, add SVG paths for both.

No Liquid file changes required beyond possible icon additions.

---

### 3. Shop by Category (`pet-type-nav.liquid`)

**Liquid changes:**

- Section heading: "Shop by Pet"
- Remove subheading (rendered conditionally — set to blank in index.json)
- Card layout: wrap each circle + label in a styled tile container (`bg-white rounded-3xl p-6 shadow-bubbly group`) so each category reads as a tappable card
- Label: larger font (`text-lg font-bold`), with a trailing `→` arrow icon to signal navigation
- Hover: lift the whole card (`hover:-translate-y-1 hover:shadow-bubbly-lg transition-all duration-300`) instead of only scaling the image
- Grid: change from `flex flex-wrap justify-center gap-12` to `grid grid-cols-2 gap-6 md:grid-cols-4`
- Add `id="categories"` to the `<section>` element to support the hero secondary CTA anchor link

Schema and block settings unchanged — no theme editor breaking changes.

---

### 4. Best Sellers (`featured-collection.liquid`)

**Liquid changes:**

- Eyebrow label: change hardcoded "Most-loved picks this week" → "Customer Favorites"
- Trust chips: replace "Fast dispatch" with "Free shipping over $50"
- "View All" button label: change default to "Shop All Best Sellers"

**index.json settings:**

- `heading`: "Best Sellers"
- `subheading`: "The products your pets keep coming back to"
- `view_all_label`: "Shop All Best Sellers"
- `products_to_show`: 4 (keep)

---

### 5. Why Choose Us (`why-choose-us.liquid`) — NEW

**Layout:** Full-width `bg-surface` section. Centered heading block above a 4-column tile grid.

**Heading:** "Why Pet Parents Choose Foofash"
**Subheading:** "Care you can trust, backed by a real veterinary team"

**4 benefit tiles:**

| Icon           | Title              | Description                                                                   |
| -------------- | ------------------ | ----------------------------------------------------------------------------- |
| `vet-approved` | Vet Approved       | Every product is reviewed and recommended by our in-house veterinary team     |
| `shipping`     | Free Shipping      | Free delivery on all orders over $50 — fast, reliable, tracked                |
| `returns`      | Easy Returns       | Changed your mind? 30-day hassle-free returns, no questions asked             |
| `paw`          | Clinic-Backed Care | Products chosen by vets who treat pets daily — not just sourced for the shelf |

**Tile design:**

- `bg-white rounded-3xl p-8 shadow-bubbly` container
- Icon in a tinted circle (`bg-medical-green` for vet-approved, `bg-surface-container` for others)
- `text-xl font-bold text-primary` title
- `text-on-surface-variant` description
- Hover: `hover:-translate-y-1 transition-all duration-300`
- Grid: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4`

**Schema:** Block-based. Each tile is a `benefit` block with `icon` (text), `title` (text), `description` (textarea) fields. Max 4 blocks. Section has `heading` and `subheading` text settings.

---

### 6. Homepage Bundles (`homepage-bundles.liquid`) — NEW

**Data source:** Shopify collection picker. Merchant creates a "Starter Kits" collection and assigns it. Shows 2–3 products max.

**Heading:** "Complete Care Kits"
**Subheading:** "Everything your pet needs, curated by our vet team"
**Eyebrow:** "Starter Kits"

**Layout:** `grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3`

**Kit card anatomy:**

- Product image: `aspect-video` (16:9) ratio — wider, more editorial than standard product cards
- "Starter Kit" badge pill: `absolute top-4 left-4` on image, `bg-secondary text-white`
- Product title: `text-xl font-bold text-primary`
- Short description: first 100 chars of `product.description` with HTML stripped
- Price with compare-at if available
- "Shop This Kit" button: full-width, primary style, links to `product.url` (PDP) — kits may have variants or require context before adding to cart
- "What's included →" link: also links to `product.url`, rendered as a subtle text link below the button

**Fallback:** If no collection assigned or collection is empty, render 3 skeleton placeholder cards with "Assign a Starter Kits collection in the theme editor" message. Matches `featured-collection.liquid` pattern.

**Schema settings:** `collection` (collection picker), `heading` (text), `subheading` (text), `products_to_show` (range, 2–3, default 3).

---

### 7. Testimonials (`testimonials.liquid`)

No Liquid changes. `index.json` settings:

- `heading`: "Loved by Pets & Parents" (keep)
- `padding`: `py-24` (keep)
- Keep existing 3 testimonial blocks unchanged

---

### 8. Final CTA (`cta.liquid`)

Add to `index.json` with settings:

- `heading`: "Your pet deserves the best. Start here."
- `subheading`: "Vet-approved products, fast shipping, and a team that genuinely cares."
- `primary_cta_label`: "Shop Now"
- `primary_cta_link`: `/collections/all`
- `secondary_cta_label`: "Meet Our Vets"
- `secondary_cta_link`: `/pages/our-team`
- `padding`: `py-24`

---

## Icon Verification Checklist

Before implementation, verify `snippets/icon.liquid` supports:

- `shipping` — if missing, add inline SVG (truck/box icon)
- `returns` — if missing, add inline SVG (return arrow icon)

---

## Constraints

- Tailwind utilities only — no inline styles, no new CSS files
- No fake urgency, no fake reviews
- All CRO elements degrade gracefully when data is missing
- Mobile-first — all new sections use responsive grid breakpoints
- Lighthouse mobile target: 90+ (lazy-load all non-hero images)
- `services-grid.liquid` and `clinic-info.liquid` files are NOT deleted — only removed from `index.json`
