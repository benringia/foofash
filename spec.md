# FOOFASH – Shopify Theme Spec

> Veterinary clinic & pet store theme built to demonstrate professional Shopify development skills including CRO, performance, and modern theme architecture.

---

## Project Goal

Build a production-quality custom Shopify OS 2.0 theme for a fictional veterinary clinic and pet product store. This theme serves as a developer portfolio piece showcasing Liquid templating, CRO patterns, performance optimization, and clean component architecture.

---

## Tech Stack

- **Templating:** Liquid (Online Store 2.0)
- **CSS:** Tailwind CSS (via PostCSS)
- **JavaScript:** Vanilla JS, ES Modules
- **Build Tool:** Vite
- **CLI:** Shopify CLI 3.x (`shopify theme dev`)

---

## Brand

- **Store Name:** FOOFASH
- **Concept:** A modern veterinary clinic that also sells curated pet products online
- **Tone:** Friendly, trustworthy, professional — think "your neighborhood vet gone digital"
- **Color palette:** To be defined in `tailwind.config.js` as design tokens
- **Typography:** To be defined as CSS custom properties in `theme.liquid`

---

## Store Structure

### Product Catalog

- **Pet Food** — dry, wet, raw; filterable by pet type and brand
- **Supplements & Medicine** — vet-approved, metafield-heavy
- **Accessories** — collars, beds, toys, grooming tools
- **Clinic Services** — appointment bookings (service products, no shipping)

### Collections

- `all-products` — master collection
- `dogs`, `cats`, `birds`, `small-animals` — pet-type collections
- `vet-approved` — curated by clinic staff (tagged products)
- `new-arrivals` — automated by date
- `services` — clinic service products only

---

## Theme Architecture

### Layout

- `layout/theme.liquid` — base HTML shell, loads Vite assets via `{% render 'vite-assets' %}`
- `layout/password.liquid` — coming soon page

### Templates (JSON)

- `templates/index.json`
- `templates/product.json`
- `templates/collection.json`
- `templates/page.json`
- `templates/blog.json`
- `templates/article.json`
- `templates/cart.json`
- `templates/404.json`
- `templates/customers/login.json`
- `templates/customers/account.json`

### Sections

| Section                        | Description                                                             |
| ------------------------------ | ----------------------------------------------------------------------- |
| `header.liquid`                | Sticky nav, mega menu, cart icon with count, search trigger             |
| `footer.liquid`                | Links, social icons, newsletter signup, clinic info                     |
| `hero-banner.liquid`           | Full-width hero, supports image + video, CTA buttons                    |
| `featured-collection.liquid`   | Product grid with configurable count and collection picker              |
| `promo-banner.liquid`          | Full-width text/color strip for announcements                           |
| `pet-type-nav.liquid`          | Icon-based pet category navigation (dogs, cats, birds, etc.)            |
| `vet-approved-products.liquid` | Curated product row with "Vet Approved" badge                           |
| `testimonials.liquid`          | Dynamic blocks — customer reviews with star ratings                     |
| `clinic-info.liquid`           | Hours, address, contact, map embed                                      |
| `service-booking.liquid`       | Service product cards with "Book Now" CTA                               |
| `blog-preview.liquid`          | Latest articles from pet care blog                                      |
| `trust-bar.liquid`             | Icon + text strip: "Vet Approved", "Free Shipping", "Same Day Dispatch" |
| `upsell-bundle.liquid`         | "Complete the Kit" cross-sell section                                   |
| `image-with-text.liquid`       | Generic flexible section for storytelling                               |
| `rich-text.liquid`             | Generic text content section                                            |

### Snippets

| Snippet                 | Description                                                                |
| ----------------------- | -------------------------------------------------------------------------- |
| `product-card.liquid`   | Reusable card used across all collection/featured grids                    |
| `product-badge.liquid`  | "Vet Approved", "Low Stock", "New" badge logic                             |
| `price.liquid`          | Handles compare-at price, sale display, currency formatting                |
| `rating-stars.liquid`   | Star rating display from metafield                                         |
| `pet-tag-filter.liquid` | Pet type tag pills for collection filtering                                |
| `cart-item.liquid`      | Single line item in cart drawer                                            |
| `icon.liquid`           | SVG icon system — accepts `icon` param                                     |
| `vite-assets.liquid`    | Injects Vite-compiled CSS/JS in dev and prod                               |
| `meta-fields.liquid`    | Renders structured product metafields (ingredients, species, weight range) |

---

## Key Features to Build

### CRO Features

- [ ] **Sticky Add-to-Cart bar** — appears after scrolling past ATC button on PDP
- [ ] **Cart drawer** — slide-in cart via Fetch Cart API, no page redirect
- [ ] **Upsell slot in cart drawer** — "You might also need" single product recommendation
- [ ] **Low stock badge** — shows "Only X left!" when inventory ≤ 5
- [ ] **Urgency messaging** — configurable text in section schema (e.g. "Order before 3pm for same-day dispatch")
- [ ] **Quick view modal** — opens product info overlay from collection grid
- [ ] **Predictive search** — live results via Shopify Search & Discovery API
- [ ] **Sticky header** — shrinks on scroll, stays accessible
- [ ] **Trust badges** — vet-approved, free shipping, returns policy

### Shopify-Specific

- [ ] **Metafields** — `pet_type`, `weight_range`, `ingredients`, `vet_approved` (boolean), `suitable_for`
- [ ] **Native collection filtering** — using `url_filters` with pet type, price range, brand
- [ ] **Product recommendations** — via `recommendations.products` endpoint on PDP
- [ ] **Cart API** — all cart interactions via `fetch` (add, update, remove)
- [ ] **Section schema** — every section fully configurable from Shopify Customizer
- [ ] **Dynamic blocks** — testimonials, pet nav icons, trust bar items all use blocks
- [ ] **Service products** — no shipping, booking CTA instead of standard ATC

### Performance

- [ ] Hero image uses `preload` link tag for LCP
- [ ] All images use `loading="lazy"` with explicit `width` and `height`
- [ ] Vite handles JS bundling and tree-shaking
- [ ] No jQuery — native fetch, querySelector, classList
- [ ] Tailwind purge configured to strip unused CSS in prod
- [ ] Target Lighthouse score: 90+ on mobile

### Accessibility

- [ ] Skip to main content link
- [ ] Focus trap in cart drawer and quick view modal
- [ ] `aria-label` on all icon-only buttons
- [ ] Keyboard navigable mega menu
- [ ] Color contrast AA compliant

---

## JavaScript Modules (`src/`)

| Module                 | Responsibility                                           |
| ---------------------- | -------------------------------------------------------- |
| `cart.js`              | Cart API wrapper — add, update, remove, fetch            |
| `cart-drawer.js`       | Open/close drawer, render cart items, handle upsell      |
| `quick-view.js`        | Fetch product HTML and render in modal                   |
| `predictive-search.js` | Debounced search input → Shopify Search API              |
| `sticky-atc.js`        | IntersectionObserver on ATC button, show/hide sticky bar |
| `filters.js`           | Collection filter UI — URL param sync, active state      |
| `header.js`            | Scroll-shrink, mega menu open/close                      |
| `utils.js`             | Shared helpers: `formatMoney`, `debounce`, `fetchJSON`   |

---

## Metafield Definitions

| Namespace + Key    | Type                          | Used On  |
| ------------------ | ----------------------------- | -------- |
| `pet.type`         | `list.single_line_text_field` | Products |
| `pet.weight_range` | `single_line_text_field`      | Products |
| `pet.ingredients`  | `multi_line_text_field`       | Products |
| `pet.vet_approved` | `boolean`                     | Products |
| `clinic.hours`     | `multi_line_text_field`       | Shop     |
| `clinic.phone`     | `single_line_text_field`      | Shop     |

---

## Dev Workflow

```bash
# Install dependencies
npm install

# Start Shopify CLI + Vite in parallel
shopify theme dev --store=your-store.myshopify.com
npm run dev

# Build for production
npm run build
shopify theme push
```

---

## Folder Conventions

- All JS modules live in `src/` and are imported via `vite-assets` snippet
- Tailwind classes only — no inline styles, no separate `.css` files except `src/main.css`
- One snippet per component — no logic in templates
- Section schema settings use `t:` translation keys where possible

---

## Portfolio Notes (for README / store front page)

- Display Lighthouse score badge
- Add "Developer Notes" overlay on key sections explaining CRO rationale
- Include a `/pages/style-guide` page showing typography, colors, and components
- Document which features were built with Claude Code assistance

---

_Generated as initial spec for `CLAUDE.md` bootstrap — update as features are completed._
