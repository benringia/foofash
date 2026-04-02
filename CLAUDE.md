# FOOFASH – Claude Code Guide

A portfolio Shopify theme for a fictional veterinary clinic and pet store. Built to demonstrate professional Shopify OS 2.0 development: Liquid templating, CRO patterns, performance, and clean component architecture.

---

## Project Structure

```
foofash/
├── src/                        # Vite source files
│   ├── scripts/                # JS modules (main.js entry point)
│   └── styles/                 # main.css (Tailwind entry)
├── shopify/                    # Theme root (passed to Shopify CLI)
│   ├── assets/                 # Vite build output (do not edit manually)
│   ├── config/                 # settings_schema.json, settings_data.json
│   ├── layout/                 # theme.liquid, password.liquid
│   ├── sections/               # Section files
│   ├── snippets/               # Snippet files (vite-assets.liquid is generated)
│   └── templates/              # JSON templates
├── scripts/                    # Build scripts (generate-liquid-assets.mjs)
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Dev Workflow

```bash
# Install
npm install

# Dev — runs Vite in watch mode + Shopify CLI in parallel
npm run dev

# Production build
npm run build

# Push theme to store
npm run push

# Run tests
npm test
```

The `dev` script runs both Vite (`vite build --watch`) and `shopify theme dev` concurrently. Vite writes compiled assets to `shopify/assets/` and auto-regenerates `shopify/snippets/vite-assets.liquid` after each build via the `generateLiquidAssets` Vite plugin.

---

## Key Conventions

### JavaScript

- All JS lives in `src/scripts/` as ES modules
- Single entry point: `src/scripts/main.js`
- No jQuery — use native `fetch`, `querySelector`, `classList`
- Use `IntersectionObserver` for scroll-based features (sticky ATC, lazy load)
- Modules: `cart.js`, `cart-drawer.js`, `quick-view.js`, `predictive-search.js`, `sticky-atc.js`, `filters.js`, `header.js`, `utils.js`

### CSS / Tailwind

- Tailwind utility classes only — no inline styles
- No separate `.css` files except `src/styles/main.css`
- Design tokens (colors, typography) defined in `tailwind.config.js` and CSS custom properties in `theme.liquid`

### Liquid

- One snippet per component — no logic in templates or layouts
- Section schema settings use `t:` translation keys where possible
- `vite-assets.liquid` is auto-generated — never edit it directly
- Metafield namespace: `pet.*` (products) and `clinic.*` (shop)

### Asset Pipeline

- Vite compiles `src/scripts/main.js` → `shopify/assets/`
- Manifest at `shopify/assets/.vite/manifest.json`
- `scripts/generate-liquid-assets.mjs` reads the manifest and writes `shopify/snippets/vite-assets.liquid`
- `shopify/assets/` is the build output — do not manually place files there

---

## Sections & Snippets Reference

### Sections (`shopify/sections/`)

| File                           | Purpose                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `header.liquid`                | Sticky nav, mega menu, cart icon with count, search trigger |
| `footer.liquid`                | Links, social icons, newsletter signup, clinic info         |
| `hero-banner.liquid`           | Full-width hero with image/video support and CTA buttons    |
| `featured-collection.liquid`   | Product grid, configurable count and collection             |
| `promo-banner.liquid`          | Full-width announcement strip                               |
| `pet-type-nav.liquid`          | Icon-based pet category navigation                          |
| `vet-approved-products.liquid` | Curated product row with "Vet Approved" badge               |
| `testimonials.liquid`          | Dynamic blocks — star-rated customer reviews                |
| `clinic-info.liquid`           | Hours, address, contact, map embed                          |
| `service-booking.liquid`       | Service product cards with "Book Now" CTA                   |
| `blog-preview.liquid`          | Latest articles from pet care blog                          |
| `trust-bar.liquid`             | Icon + text strip for trust signals                         |
| `upsell-bundle.liquid`         | "Complete the Kit" cross-sell section                       |
| `image-with-text.liquid`       | Flexible storytelling section                               |
| `rich-text.liquid`             | Generic text content section                                |

### Snippets (`shopify/snippets/`)

| File                    | Purpose                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `product-card.liquid`   | Reusable card used in all grids                                 |
| `product-badge.liquid`  | "Vet Approved", "Low Stock", "New" badge logic                  |
| `price.liquid`          | Compare-at price, sale display, currency formatting             |
| `rating-stars.liquid`   | Star rating from metafield                                      |
| `pet-tag-filter.liquid` | Pet type tag pills for collection filtering                     |
| `cart-item.liquid`      | Single line item in cart drawer                                 |
| `icon.liquid`           | SVG icon system — accepts `icon` param                          |
| `vite-assets.liquid`    | **Auto-generated** — injects Vite CSS/JS                        |
| `meta-fields.liquid`    | Renders product metafields (ingredients, species, weight range) |

---

## Metafields

| Namespace.Key      | Type                          | Scope    |
| ------------------ | ----------------------------- | -------- |
| `pet.type`         | `list.single_line_text_field` | Products |
| `pet.weight_range` | `single_line_text_field`      | Products |
| `pet.ingredients`  | `multi_line_text_field`       | Products |
| `pet.vet_approved` | `boolean`                     | Products |
| `clinic.hours`     | `multi_line_text_field`       | Shop     |
| `clinic.phone`     | `single_line_text_field`      | Shop     |

---

## Performance Targets

- Lighthouse mobile score: 90+
- Hero image uses `<link rel="preload">` for LCP
- All images: `loading="lazy"` with explicit `width` and `height`
- Tailwind purge removes unused CSS in production builds

## Accessibility Requirements

- Skip-to-main-content link in `theme.liquid`
- Focus trap in cart drawer and quick view modal
- `aria-label` on all icon-only buttons
- Keyboard-navigable mega menu
- WCAG AA color contrast compliance

---

## Store Info

- **Store URL:** foofash.myshopify.com
- **Shopify CLI path flag:** `--path shopify`
- **Theme type:** Online Store 2.0 (JSON templates)

## Rules

- Never use jQuery or any DOM library — vanilla JS only
- Never write inline styles — Tailwind classes only
- Every section must have a schema with at minimum: a heading setting and a padding setting
- Check shopify/config/settings_schema.json before adding new global settings
- All Cart interactions go through src/cart.js — never fetch /cart directly in a section
- Liquid files get auto-formatted on save via Prettier hook — don't manually reformat
- When in doubt about a Shopify API, check docs.shopify.dev before implementing
