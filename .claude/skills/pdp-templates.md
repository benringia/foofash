# PDP Templates Skill

Use this skill when building or refining product page layouts and product-detail UI.

## Objective

Create premium, high-converting PDPs that balance trust, clarity, merchandising, and performance.

## PDP Structure Order

Use this order unless there is a strong reason not to:

1. Media gallery
2. Product category / eyebrow
3. Product title
4. Rating / social proof
5. Price + compare-at + savings
6. Trust / urgency cues
7. Variant selector
8. Quantity + CTA
9. Shipping / returns microcopy
10. Accordion content
11. Upsell / bundle section
12. Recommendations
13. Sticky ATC support

## Required Behaviors

### Product Media
- Stable aspect ratio
- Main image + thumbnails if available
- Graceful fallback if image missing
- Premium surface treatment

### Product Title Block
- Strong hierarchy
- Product type or category can appear as a small eyebrow
- Long titles must wrap cleanly

### Social Proof
Allowed:
- real rating stars
- real review count
- editorial labels like “Clinic Pick”

If rating missing:
- hide numerical review UI
- optionally use a clearly non-numeric merchandising label

### Pricing
- Use `price.liquid`
- Show compare-at only when real
- Savings must be accurate
- Keep price highly visible

### Trust / Urgency
Allowed:
- Vet Approved
- Free shipping threshold
- Easy returns
- Only X left (tracked inventory only)
- dispatch messaging if configured

### Variants
Preferred:
- pill selectors for small option sets
Fallback:
- dropdown for large or complex option sets

Rules:
- active state must be clear
- unavailable options must be visually distinct
- do not break native product form behavior

### CTA Row
Preferred structure:
- quantity control
- primary Add to Cart button
- optional secondary action only if truly useful

Rules:
- CTA must dominate visually
- mobile CTA should be easy to tap
- out-of-stock state must be explicit

### Accordion Content
Common items:
- Description
- Ingredients
- Shipping & Returns
- Care / Usage

Rules:
- hide empty items
- maintain clean spacing
- do not overload top-of-page with long text

### Upsell / Recommendations
Good modules:
- Complete the Kit
- You may also like
- Frequently bought together

Rules:
- keep relevant
- keep count limited
- use product card patterns consistently

### Sticky ATC
Use when the main CTA scrolls out of view.

Sticky ATC should include:
- product image thumbnail
- title
- price
- CTA button

## Edge Cases

Always guard for:
- no variants
- single default variant
- no rating
- missing metafields
- no compare-at
- sold out product
- no secondary images
- long titles
- service products or products that require alternate CTA behavior

## Output Expectations

When using this skill:
1. Audit the current PDP structure
2. Identify missing trust / friction / merchandising
3. Improve hierarchy first
4. Add CRO only where it supports the decision flow
5. Keep the result premium and uncluttered