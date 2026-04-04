# Veterinary Clinic Layer — Design Spec

**Date:** 2026-04-03  
**Status:** Approved  
**Scope:** New service pages, booking form, services grid, homepage + nav integration

---

## Context

The FooFash theme is a hybrid pet store + veterinary clinic. Currently the theme handles ecommerce well (products, cart, collection pages) but has no concept of clinic services. This spec covers the "clinic layer" — a lightweight set of sections and templates that let the store present and book veterinary services, integrated visually with the existing ecommerce theme.

No booking backend is required. All forms submit to Shopify's native contact form endpoint.

---

## Architecture

**6 files total. 4 new, 2 updated.**

| File                                      | Action | Purpose                                                     |
| ----------------------------------------- | ------ | ----------------------------------------------------------- |
| `shopify/templates/page.service.json`     | Create | Template for individual service pages                       |
| `shopify/sections/main-service.liquid`    | Create | Page title, content, optional service highlights            |
| `shopify/sections/service-booking.liquid` | Create | Booking form using Shopify contact form                     |
| `shopify/sections/services-grid.liquid`   | Create | Block-based services grid for homepage                      |
| `shopify/templates/index.json`            | Update | Add services-grid between trust-bar and featured-collection |
| `shopify/sections/header.liquid`          | Update | Add services_page URL setting + render nav link             |

**Data flow:** Individual service pages are standard Shopify pages assigned the `page.service` template in Admin. The booking form submits to Shopify's contact inbox via `{% form 'contact' %}`. The homepage services grid links to individual service pages via per-block URL settings.

---

## Section 1: Service Page Template (`page.service.json`)

```json
{
  "sections": {
    "main": { "type": "main-service" },
    "booking": { "type": "service-booking" }
  },
  "order": ["main", "booking"]
}
```

Service pages are created in Shopify Admin → Pages and assigned the `page.service` template.

Example pages to create:

- Vet Consultation → `/pages/vet-consultation`
- Grooming → `/pages/grooming`
- Vaccination → `/pages/vaccination`

---

## Section 2: Main Service Section (`main-service.liquid`)

### Layout

Two-column on desktop (`lg:grid-cols-2`), single column on mobile. Left: page title + content. Right: service highlights panel.

If no highlight settings are filled in, the right column does not render and content goes full-width.

### Schema Settings

| Setting     | Type   | Default | Notes                    |
| ----------- | ------ | ------- | ------------------------ |
| `price`     | text   | —       | e.g. "From £45"          |
| `duration`  | text   | —       | e.g. "30–60 mins"        |
| `benefit_1` | text   | —       | Optional benefit line    |
| `benefit_2` | text   | —       | Optional benefit line    |
| `benefit_3` | text   | —       | Optional benefit line    |
| `padding`   | select | `py-16` | `py-8`, `py-16`, `py-24` |

### Highlights Panel

Rendered in a `bg-green-50 rounded-xl` card only when at least one of `price`, `duration`, or a benefit is set. Each populated field renders with a small icon prefix.

### Typography

- h1: `text-4xl font-bold text-gray-900`
- Body: `text-gray-600`
- Panel heading: `font-semibold text-gray-900`

---

## Section 3: Booking Form (`service-booking.liquid`)

### Form

Uses `{% form 'contact' %}`. Includes hidden field:

```liquid
<input type="hidden" name="contact[service]" value="{{ page.title }}">
```

### Fields

| Field   | Element                  | Required | Notes                            |
| ------- | ------------------------ | -------- | -------------------------------- |
| Name    | `<input type="text">`    | Yes      | `name="contact[name]"`           |
| Email   | `<input type="email">`   | Yes      | `name="contact[email]"`          |
| Date    | `<input type="date">`    | Yes      | `min` set to today via inline JS |
| Time    | `<select>`               | Yes      | 9:00 AM – 5:00 PM, 1-hour slots  |
| Message | `<textarea>`             | No       | `name="contact[body]"`, 4 rows   |
| Submit  | `<button type="submit">` | —        | Green primary CTA                |

**Time slots:** 9:00 AM, 10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM, 2:00 PM, 3:00 PM, 4:00 PM, 5:00 PM

### Layout

Single column, `max-w-2xl mx-auto`. Date + time fields sit side-by-side on wider screens (`grid grid-cols-2 gap-4`).

### States

- **Success:** `form.posted_successfully` → green banner above form
- **Errors:** `form.errors` → field-level messages below each input

### Schema Settings

| Setting      | Type   | Default                                                  |
| ------------ | ------ | -------------------------------------------------------- |
| `heading`    | text   | "Book an Appointment"                                    |
| `subheading` | text   | "Fill in the form below and we'll confirm your booking." |
| `padding`    | select | `py-16`                                                  |

---

## Section 4: Services Grid (`services-grid.liquid`)

### Block Architecture

Follows `trust-bar` pattern. Each service card is a theme editor block of type `service_card`.

**Section settings:**

| Setting      | Type   | Default        |
| ------------ | ------ | -------------- |
| `heading`    | text   | "Our Services" |
| `subheading` | text   | —              |
| `padding`    | select | `py-16`        |

**Block settings (per card):**

| Setting       | Type | Notes                                     |
| ------------- | ---- | ----------------------------------------- |
| `icon`        | text | Icon name passed to `{% render 'icon' %}` |
| `title`       | text | e.g. "Vet Consultation"                   |
| `description` | text | 1–2 sentence description                  |
| `cta_label`   | text | Default: "Book Now"                       |
| `cta_url`     | url  | Links to service page                     |

**Max blocks:** 6

### Icons

`icon.liquid` currently supports: `vet-approved`, `shipping`, `returns`, `paw`, `clock`, `phone`. Four new clinic icons must be added to `icon.liquid` as part of this implementation:

| Icon name     | Represents       |
| ------------- | ---------------- |
| `stethoscope` | Vet Consultation |
| `scissors`    | Grooming         |
| `syringe`     | Vaccination      |
| `tooth`       | Dental Care      |

Each new icon follows the same inline SVG pattern as existing icons (stroke-based, `aria-hidden="true"`, `focusable="false"`).

### Layout

`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Each card: `bg-white rounded-xl shadow-sm p-6`, icon in `bg-green-100 rounded-full` pill, `font-semibold text-gray-900` title, `text-gray-600 text-sm` description, green outlined CTA button at bottom.

### Presets

4 pre-configured blocks:

| Title            | Icon          | Description                                                |
| ---------------- | ------------- | ---------------------------------------------------------- |
| Vet Consultation | `stethoscope` | Professional health checks and diagnostics for your pet.   |
| Grooming         | `scissors`    | Full grooming services including wash, cut, and nail trim. |
| Vaccination      | `syringe`     | Keep your pet protected with up-to-date vaccinations.      |
| Dental Care      | `tooth`       | Professional dental cleaning and oral health checks.       |

### Empty State

If no blocks are present, render a placeholder message so the section is visible in the theme editor.

---

## Section 5: Homepage Integration (`index.json`)

**Updated section order:**

```
hero-banner → trust-bar → services-grid → featured-collection
```

Services grid sits between trust signals and the product grid — after establishing credibility, before promoting products.

---

## Section 6: Header Navigation (`header.liquid`)

### New Schema Settings

| Setting          | Type | Default                   | Label               |
| ---------------- | ---- | ------------------------- | ------------------- |
| `services_label` | text | "Services"                | Services link label |
| `services_page`  | url  | `/pages/vet-consultation` | Services link URL   |

### Rendering

After the linklist loop in the desktop nav, conditionally render:

```liquid
{%- if section.settings.services_page != blank -%}
  <a
    href="{{ section.settings.services_page }}"
    class="text-sm font-medium text-gray-700 hover:text-green-700"
  >
    {{ section.settings.services_label | default: 'Services' }}
  </a>
{%- endif -%}
```

The header has no mobile nav currently — no additional changes are needed for mobile. Degrades gracefully — no link renders if the setting is blank.

---

## Constraints

- No booking backend
- No external APIs
- No inline styles — Tailwind classes only
- No jQuery or DOM libraries
- Every section schema includes at minimum: heading setting + padding setting
- All cart interactions remain in `src/scripts/cart.js` (not relevant here but noted)

---

## Verification

1. Create a test page in Shopify Admin, assign template `page.service`, visit it — title, content, highlights panel, and booking form should all render
2. Submit the booking form — Shopify Admin → Orders → Customer contacts should receive the submission with the service name in the subject
3. Add `services-grid` to homepage via theme Customizer — 4 preset cards should appear
4. Set `services_page` in header settings — "Services" link appears in nav on desktop
5. Resize to mobile — booking form date/time fields stack, services grid goes single column
6. Leave all highlight settings blank on a service page — content goes full-width, no broken layout
7. Check browser console — no Liquid errors, no JS errors
