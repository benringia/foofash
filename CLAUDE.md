# FOOFASH – Claude Code Guide (CRO-First Theme)

A production-quality Shopify OS 2.0 theme built for a veterinary clinic + pet product store.
This theme is designed not just as a storefront, but as a **conversion system** focused on increasing AOV, CVR, and user trust.

---

## Core Philosophy

FOOFASH is a **CRO-first, premium Shopify theme**.

- Every UI decision should support conversion
- Every component should have a purpose (trust, clarity, or action)
- Design must feel **premium, soft, and intentional**
- CRO elements must feel **integrated, not aggressive**

---

## Project Structure

```
foofash/
├── src/
│   ├── scripts/
│   └── styles/
├── shopify/
│   ├── assets/
│   ├── config/
│   ├── layout/
│   ├── sections/
│   ├── snippets/
│   └── templates/
├── scripts/
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Dev Workflow

```bash
npm install
npm run dev
npm run build
npm run push
npm test
```

- Vite compiles assets → `shopify/assets/`
- `vite-assets.liquid` is auto-generated — never edit manually

---

## JavaScript Rules

- All JS in `src/scripts/`
- ES Modules only
- No jQuery
- Use:
  - `fetch`
  - `IntersectionObserver`
  - `classList`

### Core Modules

- `cart.js` — all cart logic
- `cart-drawer.js` — UI + rendering
- `sticky-atc.js` — scroll-based ATC
- `quick-view.js`
- `predictive-search.js`
- `filters.js`
- `header.js`
- `utils.js`

---

## Styling Rules (Tailwind)

- Tailwind utilities only
- No inline styles
- No extra CSS files
- Use design tokens from config
- Use **tonal layering instead of borders**

---

## Design System (Joyful Boutique)

- Soft, rounded UI (`rounded-xl` and above)
- No harsh edges or borders
- Use spacing + background shifts for separation
- Subtle motion:
  - hover lift
  - scale effects

- Premium, editorial layout (not grid-heavy default Shopify)

---

## CRO Features (MANDATORY)

These are core to the theme — do not remove or bypass.

### Product Page (PDP)

- Sticky Add-to-Cart
- Variant UX (pill-based where possible)
- Rating stars (metafield-based)
- Low stock logic (≤5, tracked inventory only)
- Trust signals (shipping, returns, vet-approved)
- Accordion content (description, ingredients, shipping)

### Cart

- Cart drawer (no page reload)
- Upsell block (“You may also need”)
- Quantity controls
- Real-time updates via `cart.js`

### Collection Pages

- Filter + sort UX
- Merchandising blocks
- Trust strip
- Clean product grid with CRO cards

### Homepage

- Featured collection with CRO enhancements
- Trust sections
- Testimonials
- Category navigation
- Merchandising sections

---

## Product Card (Critical Component)

`product-card.liquid` is a **CRO component**, not just UI.

It must support:

- Product image (stable ratio)
- Title + category
- Price + compare-at
- Rating stars (conditional)
- Review count (if available)
- Badges:
  - Vet Approved
  - Sale
  - Low Stock

- Low stock text (“Only X left”)
- CTA interaction (hover scale)
- Graceful fallback when data is missing

---

## CRO Rules (STRICT)

- Never fake urgency (only show low stock if real)
- Never fake ratings or review counts
- Always conditionally render optional data
- All CRO elements must degrade gracefully
- Prioritize trust over manipulation

---

## Liquid Rules

- One snippet per component
- No heavy logic in templates
- Use snippets for reuse
- Always guard against missing data

---

## Metafields

| Namespace.Key      | Usage         |
| ------------------ | ------------- |
| `pet.type`         | filtering     |
| `pet.weight_range` | PDP info      |
| `pet.ingredients`  | PDP accordion |
| `pet.vet_approved` | badge         |
| `reviews.rating`   | stars         |
| `reviews.count`    | review count  |

---

## Performance Targets

- Lighthouse mobile: 90+
- Lazy load all images
- Preload hero image
- Keep JS minimal
- Avoid layout shift

---

## Accessibility

- Skip-to-content link
- Keyboard navigation
- aria-labels on icons
- Focus trap (cart drawer, modal)
- WCAG AA compliance

---

## Asset Pipeline

- Vite builds → `shopify/assets/`
- Manifest → `.vite/manifest.json`
- Auto-injected via `vite-assets.liquid`

---

## Store Info

- Store: foofash.myshopify.com
- Path: `--path shopify`
- Theme: OS 2.0

---

## Upcoming Features

- Sticky ATC improvements
- Cart upsell expansion
- Quick view modal
- Predictive search
- Bundle system

---

## Development Priorities

When building new features, prioritize:

1. Conversion impact
2. UX clarity
3. Performance
4. Maintainability

---

## Final Rule

This is not just a theme.

This is:

> **A high-converting Shopify system designed for premium DTC brands**

Every change must support that direction.
