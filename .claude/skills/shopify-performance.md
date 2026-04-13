# Shopify Performance Skill

Use this skill when building or reviewing Liquid, Tailwind, or JS for storefront performance.

## Objective

Keep this project fast, stable, and premium on real devices, especially mobile.

## Performance Targets

- Lighthouse mobile target: 90+
- Minimize layout shift
- Fast first render
- Keep JS small and purposeful
- Avoid unnecessary DOM complexity

## Core Rules

### Liquid
- Guard against rendering unnecessary markup
- Avoid duplicated expensive loops where possible
- Use snippets for reuse, but keep them efficient
- Only render optional UI when data exists

### Images
- Always provide width and height when possible
- Use lazy loading for non-critical images
- Preload only true LCP images
- Maintain stable image aspect ratios
- Ensure placeholders match final layout dimensions

### JavaScript
- No jQuery
- Use ES modules
- Prefer progressive enhancement
- Avoid attaching excessive listeners to repeated elements
- Use event delegation when appropriate
- Use IntersectionObserver for scroll-triggered features
- Defer logic until needed

### CSS / Tailwind
- Favor utilities over custom CSS
- Avoid huge nested wrappers
- Use consistent spacing to reduce layout thrash
- Avoid visually heavy effects that cost too much on mobile

## Theme-Specific Guidance

### Header
- Fixed/sticky behavior must not cause layout jumps
- Use a CSS variable for dynamic header offset when needed
- Avoid reflow-heavy scroll logic

### Product Cards
- Stable card height and media ratio
- Hover effects should be lightweight
- Avoid absolute positioning unless necessary
- Keep card DOM simple

### Recommendations / Async Content
- Skeletons must match final layout
- Remove loading placeholders cleanly
- Avoid duplicate wrappers after hydration
- Gracefully handle empty states

### Cart Drawer / Modals
- Render efficiently
- Trap focus accessibly
- Avoid blocking page interaction unnecessarily
- Do not over-render hidden components

### Predictive Search
- Debounce requests
- Cancel or ignore stale requests
- Keep result markup minimal and fast

## Common Performance Risks

- Oversized hero assets
- Too many nested wrappers
- Rendering hidden UI unnecessarily
- Layout shifts from missing dimensions
- Scroll handlers doing too much work
- Product cards with unstable content heights
- Large recommendation sections with mismatched skeletons

## Review Checklist

When using this skill, check:
1. Does this add unnecessary JS?
2. Can the UI be progressively enhanced?
3. Are images dimensioned correctly?
4. Will this cause CLS?
5. Is the DOM more complex than needed?
6. Will it still feel fast on mobile?

## Output Expectations

When applying this skill:
- Identify performance risks
- Suggest minimal fixes
- Preserve design quality
- Prefer simple, robust improvements over clever complexity