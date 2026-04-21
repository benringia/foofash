# Clinic Services Homepage Section — Design Spec

**Date:** 2026-04-21
**Status:** Approved

---

## Context

FOOFASH is a CRO-first Shopify theme for a veterinary clinic + pet product store. The homepage currently surfaces only physical products, leaving the clinic's service offering (checkups, vaccinations, grooming, etc.) invisible to homepage visitors.

The goal is to surface service products directly on the homepage as a clear second conversion path — driving users into the booking flow while keeping the section visually distinct from the product merchandising sections.

---

## Architecture

### New file

`shopify/sections/clinic-services.liquid`

### Modified file

`shopify/templates/index.json` — insert `clinic-services` between `why-choose-us` and `homepage-bundles`

### Homepage section order (after change)

1. hero-banner
2. trust-bar
3. pet-type-nav
4. featured-collection
5. why-choose-us
6. **clinic-services** ← new
7. homepage-bundles
8. testimonials
9. cta

---

## Section Layout

Three vertical layers:

### 1. Header

Centered. Matches the style of `why-choose-us` and `homepage-bundles`.

- Eyebrow label — small caps, `text-xs font-semibold uppercase tracking-widest text-secondary`
- `h2` heading — `font-display text-4xl font-extrabold text-primary`
- Subheading — `text-on-surface-variant` paragraph

### 2. Card Grid

- Mobile: 1 column
- md: 2 columns
- lg: 4 columns
- Gap: `gap-6`
- Renders via `{% for block in section.blocks limit: 4 %}` — only first 4 blocks display regardless of how many the merchant adds

### 3. Footer Row

Optional "View all services" link. Hidden when `cta_url` is blank.

- Centered. Style: `inline-flex items-center gap-2 rounded-xl border border-primary px-6 py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-colors duration-200`

---

## Service Card Design

White card: `bg-white rounded-3xl shadow-bubbly hover:-translate-y-1 transition-all duration-300 overflow-hidden`

### Image area

- Aspect ratio: `aspect-[3/2]`
- `object-cover rounded-2xl` inside the card top
- Fallback (no image): `bg-surface-container` with centered stethoscope SVG icon in `text-primary`

### Icon badge (overlaid bottom-left of image)

- Positioned absolute, bottom-left of the image container
- Style: `bg-white rounded-xl shadow-ambient px-3 py-1.5 flex items-center gap-1.5`
- Contains: small SVG icon (per block setting) + product type text in `text-xs font-semibold text-on-surface-variant`

### Content area (`p-5`, below image)

| Element                                                                   | Classes                                                                                                                                                     |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title (product.title)                                                     | `font-bold text-primary text-lg leading-snug`                                                                                                               |
| Descriptor (`service.tagline` metafield or truncated product description) | `text-sm text-on-surface-variant mt-1`                                                                                                                      |
| Price row (`service.price_prefix` + formatted price)                      | `text-sm font-semibold text-on-surface mt-3`                                                                                                                |
| CTA button                                                                | `bg-primary-gradient text-white rounded-xl w-full mt-4 py-3 text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200` |

CTA links to the service product page (`product.url`).

---

## Schema

### Section settings

| Key          | Type     | Default                                                           |
| ------------ | -------- | ----------------------------------------------------------------- |
| `eyebrow`    | text     | `"Our Clinic Services"`                                           |
| `heading`    | text     | `"Care Your Pet Deserves"`                                        |
| `subheading` | textarea | `"Book a clinic visit for expert care from our veterinary team."` |
| `cta_label`  | text     | `"View all services"`                                             |
| `cta_url`    | url      | _(empty)_                                                         |

### Block type: `"service"` (no max_blocks)

| Key         | Type    | Default         |
| ----------- | ------- | --------------- |
| `product`   | product | _(none)_        |
| `icon`      | select  | `"stethoscope"` |
| `cta_label` | text    | `"Book Now"`    |

**Icon options:** `stethoscope`, `paw`, `tooth`, `scissors`, `syringe`

Product data is resolved via `all_products[block.settings.product]` to keep price and URL live.

---

## Edge Cases

| Scenario                                 | Handling                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------ | ---------- | ------------- |
| No product image                         | Fallback placeholder: `bg-surface-container` + centered stethoscope icon |
| `service.tagline` metafield missing      | Fall back to `product.description                                        | strip_html | truncate: 80` |
| `service.price_prefix` metafield missing | Show price without prefix                                                |
| Block has no product selected            | Skip rendering that card entirely                                        |
| Merchant adds >4 blocks                  | Only first 4 render via `limit: 4`; rest are available in customizer     |
| `cta_url` is blank                       | Footer CTA row is hidden                                                 |
| Fewer than 4 blocks                      | Grid renders however many blocks are configured                          |

---

## Design Tokens Used

From `tailwind.config.js`:

- Colors: `primary` (#2D6A4F), `secondary` (#F4A261), `surface-container` (#F2F4F0), `on-surface-variant` (#44474E), `medical-green` (#E8F5E9)
- Shadows: `shadow-bubbly`, `shadow-ambient`
- Gradient: `bg-primary-gradient`
- Border radius: `rounded-3xl`, `rounded-2xl`, `rounded-xl`

---

## Existing Patterns Reused

- Card hover lift: `hover:-translate-y-1 transition-all duration-300` (from `why-choose-us.liquid`)
- Icon badge pill style: `shadow-ambient` + white bg (from `main-product-service.liquid` reassurance chips)
- Section header structure: eyebrow + h2 + subheading, centered (from `homepage-bundles.liquid`)
- Product resolution: `all_products[block.settings.product]` (from `homepage-bundles.liquid`)
- Image fallback pattern: placeholder bg + centered icon (from `product-card` snippet)

---

## Verification

1. Run `npm run dev` and open the theme preview
2. In the Shopify customizer, add the Clinic Services section — confirm it appears between Why Choose Us and Bundles
3. Add 4 service product blocks — confirm cards render with image, badge, title, descriptor, price, and CTA
4. Test with a product that has no image — confirm placeholder renders
5. Test with a product missing `service.tagline` — confirm description fallback truncates cleanly
6. Add a 5th block — confirm only 4 cards render on the homepage
7. Leave `cta_url` blank — confirm footer CTA row is hidden
8. Set `cta_url` — confirm footer CTA appears with correct label and link
9. Verify responsive layout: 1-col mobile, 2-col tablet, 4-col desktop
10. Verify "Book Now" links to the correct service product page
