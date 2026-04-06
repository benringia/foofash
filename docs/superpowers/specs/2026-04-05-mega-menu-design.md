# Mega Menu & Mobile Drawer — Design Spec

**Date:** 2026-04-05  
**Status:** Approved

---

## Context

The current header navigation is a flat loop of `<a>` tags — no dropdown support, no mobile menu (nav is simply hidden on small screens). This spec covers upgrading the header to:

1. A full mega menu on desktop for any nav item with child links (auto-detected via `link.links.size > 0`)
2. A slide-in mobile drawer with accordion support for nested items

The change follows the project convention of one snippet per component and introduces a dedicated `header.js` JS module.

---

## Architecture

### Files Changed

| File                                 | Change                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `shopify/sections/header.liquid`     | Replace inline nav loop with `render 'navigation'`; add hamburger button; add mobile drawer backdrop |
| `shopify/snippets/navigation.liquid` | **New** — full nav markup: desktop mega menu panels + mobile accordion drawer                        |
| `src/scripts/header.js`              | **New** — interaction module: mega menu hover/focus, mobile drawer, accordion                        |
| `src/scripts/main.js`                | Import and call `initHeader()`                                                                       |

### Data Flow

`header.liquid` passes the linklist handle to the navigation snippet:

```liquid
{% render 'navigation', menu: section.settings.menu %}
```

Inside `navigation.liquid`, the snippet iterates `linklists[menu].links` and branches on `link.links.size > 0`.

---

## Desktop Mega Menu

### Detection

Any top-level nav item with `link.links.size > 0` renders as a mega menu trigger. Items without children render as plain `<a>` links.

### Markup Structure

Mega panels are **direct children of `<header>`**, not nested inside the nav item `<div>`. The `<header>` is already full-width and establishes a positioning context via `sticky`, so `absolute top-full left-0 w-full` on each panel produces a true full-width dropdown flush below the header bar. Each trigger references its panel via `aria-controls`.

```
<!-- Inside <header> — nav triggers -->
<nav>
  {% for link in linklists[menu].links %}
    {% if link.links.size > 0 %}
      <div data-mega-menu>
        <button aria-expanded="false" aria-controls="mega-{{ link.handle }}" data-mega-trigger>
          {{ link.title }}
          <svg><!-- chevron --></svg>
        </button>
      </div>
    {% else %}
      <a href="{{ link.url }}">{{ link.title }}</a>
    {% endif %}
  {% endfor %}
</nav>

<!-- Also inside <header>, after <nav> — mega panels -->
{% for link in linklists[menu].links %}
  {% if link.links.size > 0 %}
    <div id="mega-{{ link.handle }}"
         class="absolute top-full left-0 w-full bg-white shadow-lg opacity-0 pointer-events-none transition-opacity duration-200"
         data-mega-panel>
      <div class="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-8">
        {% for child in link.links %}
          <div>
            <a href="{{ child.url }}" class="font-semibold text-gray-900">{{ child.title }}</a>
            {% if child.links.size > 0 %}
              <ul>
                {% for grandchild in child.links %}
                  <li><a href="{{ grandchild.url }}">{{ grandchild.title }}</a></li>
                {% endfor %}
              </ul>
            {% endif %}
          </div>
        {% endfor %}
      </div>
    </div>
  {% endif %}
{% endfor %}
```

### Column Layout

- `grid grid-cols-4 gap-8` — up to 4 columns; CSS grid fills naturally with fewer items
- Each child link is a column: its title as a bold header link, its own children (if any) as sub-links beneath it
- Supports 2-level hierarchy natively; a 3rd level (grandchildren) renders as sub-links under the column header

### Open/Close State

- **Closed:** `opacity-0 pointer-events-none`
- **Open:** `opacity-100 pointer-events-auto`
- Transition: `transition-opacity duration-200`
- JS drives the class swap and `aria-expanded` on every state change

---

## Mobile Drawer

### Trigger

Hamburger button, visible only on `md:hidden`. Uses a 3-line SVG icon that swaps to an X when the drawer is open. Has `aria-expanded` and `aria-controls="mobile-nav-drawer"`.

### Drawer

- Fixed panel, `w-72 h-full`, slides from left
- **Closed:** `translate-x-[-100%]`
- **Open:** `translate-x-0`
- Transition: `transition-transform duration-300`
- `z-50`, white background, overflow-y scrollable

### Backdrop

- Fixed overlay `bg-black/40`, hidden when closed
- Clicking backdrop closes the drawer

### Nav Tree

Loops the same linklist as desktop:

- **Plain links** → simple `<a>` rows with `py-3 px-6 border-b` styling
- **Items with children** → `<button data-mobile-accordion>` with `aria-expanded`; child list toggles `hidden`/`block`; child links indented with `pl-8`
- Only one accordion section open at a time (JS collapses siblings on open)

### Focus Trap

- While open: Tab/Shift+Tab cycle only within focusable elements inside the drawer
- Escape closes drawer and returns focus to the hamburger button

---

## JavaScript — `src/scripts/header.js`

Exports a single `initHeader()` function. ~80–100 lines. All state via `data-*` attributes and CSS classes — no JS state object.

### Mega Menu

```js
// For each [data-mega-menu]:
//   trigger mouseenter → open panel (add opacity-100, remove opacity-0/pointer-events-none, set aria-expanded=true)
//   container mouseleave → close panel
//   trigger focus → open panel
//   focusout (when focus leaves container) → close panel
//   Escape → close active panel, return focus to trigger
```

### Mobile Drawer

```js
// Hamburger click → toggle translate classes, aria-expanded, backdrop visibility
// Backdrop click → close
// Escape → close, return focus to hamburger
// Focus trap on Tab/Shift+Tab while open
```

### Mobile Accordion

```js
// [data-mobile-accordion] click → toggle child list hidden/block, aria-expanded
// Collapse all other open accordions on open
```

---

## Accessibility

- All interactive triggers are `<button>` elements (keyboard focusable by default)
- `aria-expanded` updated on every open/close
- `aria-controls` links triggers to their panels/drawers
- Escape closes any open panel/drawer and returns focus to the trigger
- Focus trap in mobile drawer
- Mega menu panels have `pointer-events-none` when closed (avoids phantom hover areas)

---

## Constraints & Non-Goals

- No hardcoded category names — detection is purely `link.links.size > 0`
- No jQuery or DOM libraries — vanilla JS only
- No inline styles — Tailwind classes only
- Mobile mega menu is an accordion, not a nested mega layout
- No icons or images in mega menu columns at this stage (can be added later via metafields or section blocks)

---

## Extending Later

**Adding icons/images to mega menu columns:**  
Each column maps to a `child` link. Images could be sourced from a collection's `featured_image` if the child URL points to a collection — add a `{% if collections[child.handle].featured_image %}` branch inside the column loop.

**Section block overrides:**  
Add `type: "mega_column"` blocks to the header schema to allow merchants to pin an image or promotional card into a specific mega menu column via the Shopify theme editor.

---

## Verification

1. `npm run dev` — confirm no Liquid render errors in the theme preview
2. Desktop: hover a nav item with children → mega panel appears; mouse off → closes; Tab into trigger → opens; Tab out → closes; Escape → closes
3. Desktop: nav items without children → plain links, no panel rendered
4. Mobile (≤768px): hamburger visible; click → drawer slides in; click backdrop or Escape → closes
5. Mobile accordion: tap item with children → child list expands; tap another → first collapses
6. Keyboard-only navigation: all interactions reachable without a mouse
7. `aria-expanded` reflects state correctly in browser DevTools accessibility tree
