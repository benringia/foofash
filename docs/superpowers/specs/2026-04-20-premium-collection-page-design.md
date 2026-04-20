# Premium Collection Page Redesign

**Date:** 2026-04-20
**Status:** Implemented

## Problem

The collection page was functional but utilitarian. Product cards had wasted inner padding, the controls bar lacked visual presence and scrolled away, and the hero's collection image treatment was a floated thumbnail rather than something editorial.

## Decisions

| Area          | Decision                                                      | Rationale                                                           |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Product card  | Edge-to-edge image, hover overlay with "Quick view" CTA       | Matches ThemeForest-quality themes (Prestige, Broadcast pattern)    |
| Controls bar  | Sticky below header, frosted `bg-surface/95 backdrop-blur-sm` | Always accessible mid-scroll; results count reflects filtered state |
| Hero image    | Tinted full-bleed background wash at `opacity-10`             | Editorial presence without fighting the text hierarchy              |
| Hero fallback | Compact text-only block with blur orbs                        | Clean and intentional rather than empty                             |
| Grid density  | `xl:grid-cols-4` added                                        | Better use of wide screens next to the sidebar                      |
| Sidebar width | `w-64` (up from `w-60`)                                       | Standard premium sidebar width                                      |

## Files Changed

- `shopify/sections/main-collection.liquid` — hero, controls bar, sidebar, grid, pagination
- `shopify/snippets/product-card.liquid` — full card rebuild

## Key Implementation Notes

- `paginate.items` used for results count (reflects filtered state, not total catalogue count)
- Sidebar sticky offset updated to `top-40` (160px) to clear new controls bar height
- Hover overlay gradient uses `pointer-events-none` — only the Quick view button is interactive
- Image link uses `tabindex='-1' aria-hidden='true'` — title link is the accessible navigation target
- Mobile filter drawer unchanged; `lg:hidden` guards prevent any desktop sticky behaviour leaking to mobile
