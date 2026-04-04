# Veterinary Clinic Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a veterinary clinic layer to FooFash — service page template, booking form, homepage services grid, and header navigation link.

**Architecture:** 4 new files (1 template, 3 sections), 1 extended snippet (`icon.liquid`), 2 updated files (`index.json`, `header.liquid`). Service pages are standard Shopify pages assigned `page.service`. Booking submits to Shopify's native contact form endpoint. Services grid follows the `trust-bar` block pattern with 4 preset cards.

**Tech Stack:** Shopify Liquid (OS 2.0), Tailwind CSS JIT (via Vite), no external JS libraries.

---

## File Map

| File                                      | Action                                           |
| ----------------------------------------- | ------------------------------------------------ |
| `shopify/snippets/icon.liquid`            | Modify — add 4 clinic icon cases                 |
| `shopify/sections/services-grid.liquid`   | Create                                           |
| `shopify/templates/index.json`            | Modify — add services-grid section               |
| `shopify/templates/page.service.json`     | Create                                           |
| `shopify/sections/main-service.liquid`    | Create                                           |
| `shopify/sections/service-booking.liquid` | Create                                           |
| `shopify/sections/header.liquid`          | Modify — add services nav link + schema settings |

---

## Task 1: Extend `icon.liquid` with 4 clinic icons

**Files:**

- Modify: `shopify/snippets/icon.liquid`

The existing file has a `{%- case icon -%}` block ending with `{%- endcase -%}` at line 103. Add 4 new `when` cases before `{%- endcase -%}`.

- [ ] **Step 1: Insert 4 new icon cases into `icon.liquid` before `{%- endcase -%}`**

Open `shopify/snippets/icon.liquid`. Replace `{%- endcase -%}` (line 103) with the following, then add the closing tag after:

```liquid
  {%- when 'stethoscope' -%}
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      <path d='M6 2v5a6 6 0 0 0 12 0V2'/>
      <line x1='12' y1='8' x2='12' y2='16'/>
      <circle cx='12' cy='19' r='3'/>
    </svg>

  {%- when 'scissors' -%}
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      <circle cx='6' cy='6' r='3'/>
      <circle cx='6' cy='18' r='3'/>
      <line x1='20' y1='4' x2='8.12' y2='15.88'/>
      <line x1='14.47' y1='14.48' x2='20' y2='20'/>
      <line x1='8.12' y1='8.12' x2='12' y2='12'/>
    </svg>

  {%- when 'syringe' -%}
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      <path d='M18 2l4 4'/>
      <path d='M14.5 5.5l-10 10a2 2 0 0 0 0 2.83l1.17 1.17a2 2 0 0 0 2.83 0l10-10'/>
      <line x1='11' y1='9' x2='15' y2='13'/>
      <line x1='9' y1='11' x2='13' y2='15'/>
      <line x1='2' y1='22' x2='6.5' y2='17.5'/>
    </svg>

  {%- when 'tooth' -%}
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
      aria-hidden='true'
      focusable='false'
    >
      <path d='M12 2c-2.8 0-5 2-5 4.5 0 1.3.4 2.5 1 3.5v8c0 1.1.9 2 2 2h.5c.3 0 .5-.2.5-.5V18a1 1 0 0 1 2 0v1.5c0 .3.2.5.5.5H14c1.1 0 2-.9 2-2v-8c.6-1 1-2.2 1-3.5C17 4 14.8 2 12 2z'/>
    </svg>
{%- endcase -%}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors. Vite compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add shopify/snippets/icon.liquid
git commit -m "feat(icons): add stethoscope, scissors, syringe, tooth icons"
```

---

## Task 2: Create `services-grid.liquid`

**Files:**

- Create: `shopify/sections/services-grid.liquid`

Block-based section following the `trust-bar` pattern. Each service card is a `service_card` block.

- [ ] **Step 1: Create `shopify/sections/services-grid.liquid`**

```liquid
{%- if section.blocks.size > 0 -%}
  <section class="services-grid {{ section.settings.padding }}">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {%- if section.settings.heading != blank
        or section.settings.subheading != blank
      -%}
        <div class="mb-10 text-center">
          {%- if section.settings.heading != blank -%}
            <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl">
              {{ section.settings.heading }}
            </h2>
          {%- endif -%}
          {%- if section.settings.subheading != blank -%}
            <p class="mt-3 text-lg text-gray-600">
              {{ section.settings.subheading }}
            </p>
          {%- endif -%}
        </div>
      {%- endif -%}

      <ul
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
      >
        {%- for block in section.blocks -%}
          <li
            class="flex flex-col rounded-xl bg-white p-6 shadow-sm"
            {{ block.shopify_attributes }}
          >
            {%- if block.settings.icon != blank -%}
              <span
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700"
                aria-hidden="true"
              >
                <span class="h-6 w-6">
                  {%- render 'icon', icon: block.settings.icon -%}
                </span>
              </span>
            {%- endif -%}

            {%- if block.settings.title != blank -%}
              <h3 class="text-base font-semibold text-gray-900">
                {{ block.settings.title }}
              </h3>
            {%- endif -%}

            {%- if block.settings.description != blank -%}
              <p class="mt-2 flex-1 text-sm text-gray-600">
                {{ block.settings.description }}
              </p>
            {%- endif -%}

            {%- if block.settings.cta_url != blank -%}
              <a
                href="{{ block.settings.cta_url }}"
                class="mt-5 inline-block rounded-lg border border-green-600 px-4 py-2 text-center text-sm font-semibold text-green-700 hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {{ block.settings.cta_label | default: 'Book Now' }}
              </a>
            {%- endif -%}
          </li>
        {%- endfor -%}
      </ul>
    </div>
  </section>
{%- else -%}
  <section class="services-grid {{ section.settings.padding }}">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-gray-400">
        Add service cards using the theme editor.
      </p>
    </div>
  </section>
{%- endif -%}

{% schema %}
{
  "name": "Services Grid",
  "max_blocks": 6,
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Our Services"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "Section padding",
      "options": [
        { "value": "py-8", "label": "Small" },
        { "value": "py-10 lg:py-16", "label": "Medium" },
        { "value": "py-16 lg:py-24", "label": "Large" }
      ],
      "default": "py-10 lg:py-16"
    }
  ],
  "blocks": [
    {
      "type": "service_card",
      "name": "Service card",
      "settings": [
        {
          "type": "text",
          "id": "icon",
          "label": "Icon name",
          "info": "Supported: stethoscope, scissors, syringe, tooth, paw, clock, phone"
        },
        {
          "type": "text",
          "id": "title",
          "label": "Title"
        },
        {
          "type": "text",
          "id": "description",
          "label": "Description"
        },
        {
          "type": "text",
          "id": "cta_label",
          "label": "Button label",
          "default": "Book Now"
        },
        {
          "type": "url",
          "id": "cta_url",
          "label": "Button link"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Services Grid",
      "blocks": [
        {
          "type": "service_card",
          "settings": {
            "icon": "stethoscope",
            "title": "Vet Consultation",
            "description": "Professional health checks and diagnostics for your pet.",
            "cta_label": "Book Now",
            "cta_url": "/pages/vet-consultation"
          }
        },
        {
          "type": "service_card",
          "settings": {
            "icon": "scissors",
            "title": "Grooming",
            "description": "Full grooming services including wash, cut, and nail trim.",
            "cta_label": "Book Now",
            "cta_url": "/pages/grooming"
          }
        },
        {
          "type": "service_card",
          "settings": {
            "icon": "syringe",
            "title": "Vaccination",
            "description": "Keep your pet protected with up-to-date vaccinations.",
            "cta_label": "Book Now",
            "cta_url": "/pages/vaccination"
          }
        },
        {
          "type": "service_card",
          "settings": {
            "icon": "tooth",
            "title": "Dental Care",
            "description": "Professional dental cleaning and oral health checks.",
            "cta_label": "Book Now",
            "cta_url": "/pages/dental-care"
          }
        }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add shopify/sections/services-grid.liquid
git commit -m "feat(sections): add block-based services grid with 4 clinic presets"
```

---

## Task 3: Update `index.json` — add services grid to homepage

**Files:**

- Modify: `shopify/templates/index.json`

Add `services-grid` between `trust-bar` and `featured-collection`.

- [ ] **Step 1: Replace `index.json` content**

```json
{
  "sections": {
    "hero-banner": {
      "type": "hero-banner",
      "settings": {}
    },
    "trust-bar": {
      "type": "trust-bar",
      "settings": {}
    },
    "services": {
      "type": "services-grid",
      "settings": {}
    },
    "featured-collection": {
      "type": "featured-collection",
      "settings": {}
    }
  },
  "order": ["hero-banner", "trust-bar", "services", "featured-collection"]
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add shopify/templates/index.json
git commit -m "feat(homepage): add services-grid section between trust-bar and featured-collection"
```

---

## Task 4: Create `page.service.json` template

**Files:**

- Create: `shopify/templates/page.service.json`

- [ ] **Step 1: Create `shopify/templates/page.service.json`**

```json
{
  "sections": {
    "main": {
      "type": "main-service",
      "settings": {}
    },
    "booking": {
      "type": "service-booking",
      "settings": {}
    }
  },
  "order": ["main", "booking"]
}
```

- [ ] **Step 2: Commit**

```bash
git add shopify/templates/page.service.json
git commit -m "feat(templates): add page.service template for clinic service pages"
```

---

## Task 5: Create `main-service.liquid`

**Files:**

- Create: `shopify/sections/main-service.liquid`

Two-column layout on desktop (page content left, highlights panel right). Right column only renders when at least one highlight setting is filled. Falls back to full-width single column when no highlights are set.

- [ ] **Step 1: Create `shopify/sections/main-service.liquid`**

```liquid
{%- assign has_highlights = false -%}
{%- if section.settings.price != blank
  or section.settings.duration != blank
  or section.settings.benefit_1 != blank
  or section.settings.benefit_2 != blank
  or section.settings.benefit_3 != blank
-%}
  {%- assign has_highlights = true -%}
{%- endif -%}

<section class="main-service {{ section.settings.padding }} border-b border-gray-100">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {%- if section.settings.eyebrow != blank -%}
      <p class="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600">
        {{ section.settings.eyebrow }}
      </p>
    {%- endif -%}

    <div class="{% if has_highlights %}grid gap-12 lg:grid-cols-2 lg:items-start{% endif %}">
      <div>
        <h1 class="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
          {{ page.title }}
        </h1>

        {%- if page.content != blank -%}
          <div class="mt-6 text-lg leading-relaxed text-gray-600">
            {{ page.content }}
          </div>
        {%- endif -%}
      </div>

      {%- if has_highlights -%}
        <div class="rounded-xl bg-green-50 p-6">
          <h2 class="text-lg font-semibold text-gray-900">Service Details</h2>

          {%- if section.settings.price != blank
            or section.settings.duration != blank
          -%}
            <dl class="mt-4 divide-y divide-green-100">
              {%- if section.settings.price != blank -%}
                <div class="flex items-center justify-between py-3 text-sm">
                  <dt class="text-gray-500">Price</dt>
                  <dd class="font-medium text-gray-900">
                    {{ section.settings.price }}
                  </dd>
                </div>
              {%- endif -%}
              {%- if section.settings.duration != blank -%}
                <div class="flex items-center justify-between py-3 text-sm">
                  <dt class="text-gray-500">Duration</dt>
                  <dd class="font-medium text-gray-900">
                    {{ section.settings.duration }}
                  </dd>
                </div>
              {%- endif -%}
            </dl>
          {%- endif -%}

          {%- if section.settings.benefit_1 != blank
            or section.settings.benefit_2 != blank
            or section.settings.benefit_3 != blank
          -%}
            <ul class="mt-4 space-y-2">
              {%- if section.settings.benefit_1 != blank -%}
                <li class="flex items-start gap-2 text-sm text-gray-700">
                  <span
                    class="mt-0.5 flex-none font-semibold text-green-600"
                    aria-hidden="true"
                    >&check;</span
                  >
                  {{ section.settings.benefit_1 }}
                </li>
              {%- endif -%}
              {%- if section.settings.benefit_2 != blank -%}
                <li class="flex items-start gap-2 text-sm text-gray-700">
                  <span
                    class="mt-0.5 flex-none font-semibold text-green-600"
                    aria-hidden="true"
                    >&check;</span
                  >
                  {{ section.settings.benefit_2 }}
                </li>
              {%- endif -%}
              {%- if section.settings.benefit_3 != blank -%}
                <li class="flex items-start gap-2 text-sm text-gray-700">
                  <span
                    class="mt-0.5 flex-none font-semibold text-green-600"
                    aria-hidden="true"
                    >&check;</span
                  >
                  {{ section.settings.benefit_3 }}
                </li>
              {%- endif -%}
            </ul>
          {%- endif -%}
        </div>
      {%- endif -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Main Service",
  "settings": [
    {
      "type": "text",
      "id": "eyebrow",
      "label": "Eyebrow text",
      "info": "Small label above the page title, e.g. 'Veterinary Services'"
    },
    {
      "type": "header",
      "content": "Service highlights"
    },
    {
      "type": "text",
      "id": "price",
      "label": "Price",
      "info": "e.g. 'From £45'"
    },
    {
      "type": "text",
      "id": "duration",
      "label": "Duration",
      "info": "e.g. '30–60 mins'"
    },
    {
      "type": "text",
      "id": "benefit_1",
      "label": "Benefit 1"
    },
    {
      "type": "text",
      "id": "benefit_2",
      "label": "Benefit 2"
    },
    {
      "type": "text",
      "id": "benefit_3",
      "label": "Benefit 3"
    },
    {
      "type": "header",
      "content": "Layout"
    },
    {
      "type": "select",
      "id": "padding",
      "label": "Section padding",
      "options": [
        { "value": "py-8", "label": "Small" },
        { "value": "py-10 lg:py-16", "label": "Medium" },
        { "value": "py-16 lg:py-24", "label": "Large" }
      ],
      "default": "py-10 lg:py-16"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add shopify/sections/main-service.liquid
git commit -m "feat(sections): add main-service section with optional highlights panel"
```

---

## Task 6: Create `service-booking.liquid`

**Files:**

- Create: `shopify/sections/service-booking.liquid`

Uses `{% form 'contact' %}`. Mirrors styling from `contact-form.liquid`. Adds date picker, time slot select, and hidden service field.

- [ ] **Step 1: Create `shopify/sections/service-booking.liquid`**

```liquid
<section class="service-booking {{ section.settings.padding }} border-t border-gray-100">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8">
        {%- if section.settings.heading != blank -%}
          <h2 class="text-2xl font-bold text-gray-900 sm:text-3xl">
            {{ section.settings.heading }}
          </h2>
        {%- endif -%}
        {%- if section.settings.subheading != blank -%}
          <p class="mt-2 text-gray-600">{{ section.settings.subheading }}</p>
        {%- endif -%}
      </div>

      {%- form 'contact' -%}
        <input type="hidden" name="contact[service]" value="{{ page.title }}">

        {%- if form.posted_successfully -%}
          <div
            class="rounded-lg border border-green-200 bg-green-50 p-4"
            role="alert"
          >
            <p class="text-sm font-medium text-green-800">
              Thanks! We&rsquo;ll confirm your appointment for
              {{ page.title }} soon.
            </p>
          </div>

        {%- else -%}
          {%- if form.errors -%}
            <div
              class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <p class="mb-2 text-sm font-medium text-red-700">
                Please fix the following errors:
              </p>
              <ul class="list-inside list-disc text-sm text-red-600">
                {%- for field in form.errors.translated_fields -%}
                  <li>
                    {{ field | capitalize }}
                    {{ form.errors.messages[field] }}
                  </li>
                {%- endfor -%}
              </ul>
            </div>
          {%- endif -%}

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-1">
              <label
                for="booking-name"
                class="text-sm font-medium text-gray-700"
              >
                Name <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="booking-name"
                type="text"
                name="contact[name]"
                value="{{ form.name }}"
                required
                autocomplete="name"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="booking-email"
                class="text-sm font-medium text-gray-700"
              >
                Email <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="booking-email"
                type="email"
                name="contact[email]"
                value="{{ form.email }}"
                required
                autocomplete="email"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label
                  for="booking-date"
                  class="text-sm font-medium text-gray-700"
                >
                  Date <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="booking-date"
                  type="date"
                  name="contact[preferred_date]"
                  required
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                <script>
                  document.getElementById('booking-date').min = new Date()
                    .toISOString()
                    .split('T')[0];
                </script>
              </div>

              <div class="flex flex-col gap-1">
                <label
                  for="booking-time"
                  class="text-sm font-medium text-gray-700"
                >
                  Time <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="booking-time"
                  name="contact[preferred_time]"
                  required
                  class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select a time</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="booking-message"
                class="text-sm font-medium text-gray-700"
                >Message</label
              >
              <textarea
                id="booking-message"
                name="contact[body]"
                rows="4"
                class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              >{{ form.body }}</textarea>
            </div>

            <button
              type="submit"
              class="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Request Appointment
            </button>
          </div>
        {%- endif -%}
      {%- endform -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Service Booking",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Book an Appointment"
    },
    {
      "type": "text",
      "id": "subheading",
      "label": "Subheading",
      "default": "Fill in the form below and we'll confirm your booking within 24 hours."
    },
    {
      "type": "select",
      "id": "padding",
      "label": "Section padding",
      "options": [
        { "value": "py-8", "label": "Small" },
        { "value": "py-10 lg:py-16", "label": "Medium" },
        { "value": "py-16 lg:py-24", "label": "Large" }
      ],
      "default": "py-10 lg:py-16"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add shopify/sections/service-booking.liquid
git commit -m "feat(sections): add service-booking form section with date/time slots"
```

---

## Task 7: Update `header.liquid` — add Services nav link

**Files:**

- Modify: `shopify/sections/header.liquid`

Add `services_label` (text) and `services_page` (url) settings to the schema. Conditionally render a "Services" link after the linklist loop in the desktop nav.

- [ ] **Step 1: Add the Services link after the nav's `{%- endfor -%}`**

In `shopify/sections/header.liquid`, the nav block is on lines 11–20:

```liquid
<nav aria-label="Main navigation" class="hidden items-center gap-6 md:flex">
  {%- for link in linklists[section.settings.menu].links -%}
    <a
      href="{{ link.url }}"
      class="text-sm font-medium text-gray-700 hover:text-green-700"
    >
      {{- link.title -}}
    </a>
  {%- endfor -%}
</nav>
```

Replace with:

```liquid
<nav aria-label="Main navigation" class="hidden items-center gap-6 md:flex">
  {%- for link in linklists[section.settings.menu].links -%}
    <a
      href="{{ link.url }}"
      class="text-sm font-medium text-gray-700 hover:text-green-700"
    >
      {{- link.title -}}
    </a>
  {%- endfor -%}
  {%- if section.settings.services_page != blank -%}
    <a
      href="{{ section.settings.services_page }}"
      class="text-sm font-medium text-gray-700 hover:text-green-700"
    >
      {{ section.settings.services_label | default: 'Services' }}
    </a>
  {%- endif -%}
</nav>
```

- [ ] **Step 2: Add 2 new settings to the schema**

The current schema (lines 58–75) ends with:

```liquid
{ "type": "link_list", "id": "menu", "label": "Navigation menu", "default":
"main-menu" } ] } {% endschema %}
```

Replace with:

```liquid
{ "type": "link_list", "id": "menu", "label": "Navigation menu", "default":
"main-menu" }, { "type": "text", "id": "services_label", "label": "Services link
label", "default": "Services" }, { "type": "url", "id": "services_page",
"label": "Services link URL", "info": "Link to your main service page, e.g.
/pages/vet-consultation. Leave blank to hide the link." } ] } {% endschema %}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add shopify/sections/header.liquid
git commit -m "feat(header): add configurable Services nav link via schema settings"
```

---

## Task 8: End-to-end verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: Vite starts in watch mode and Shopify CLI serves the theme at the local URL printed in the terminal.

- [ ] **Step 2: Verify homepage**

Open the store homepage. Check:

- Services grid appears between the trust bar and featured collection
- 4 preset cards render: Vet Consultation, Grooming, Vaccination, Dental Care
- Each card shows its icon in a green pill, title, description, and "Book Now" button
- Grid is 4 columns on desktop, 2 on tablet, 1 on mobile

- [ ] **Step 3: Verify header nav**

Go to Shopify theme Customizer → Header section. Set "Services link URL" to `/pages/vet-consultation`. Check:

- "Services" link appears in the desktop nav after the linklist items
- Link is styled identically to other nav links

- [ ] **Step 4: Create a test service page in Shopify Admin**

In Shopify Admin → Online Store → Pages:

- Create a page titled "Vet Consultation"
- Add body content in the rich text editor
- In "Theme template" dropdown, select `page.service`
- Save

Visit `/pages/vet-consultation`. Check:

- Page title renders as h1
- Page content renders below the title
- "Book an Appointment" section appears below with the full form
- No highlights panel visible (expected — no schema settings filled yet)

- [ ] **Step 5: Verify highlights panel**

In Shopify theme Customizer, open the Vet Consultation page. Select "Main Service" section. Fill in:

- Price: `From £45`
- Duration: `45 mins`
- Benefit 1: `Full health examination`

Check:

- Two-column layout appears
- Highlights panel renders on the right with price, duration, and the benefit with a green check

- [ ] **Step 6: Verify booking form submission**

Fill in the booking form with test data and submit. Check:

- Green success banner appears: "Thanks! We'll confirm your appointment for Vet Consultation soon."
- No console errors

- [ ] **Step 7: Verify booking form on mobile**

Resize to 375px width. Check:

- Date and time fields stack vertically (not side by side)
- Form is readable and usable
- No horizontal overflow

- [ ] **Step 8: Verify no-content edge case**

In Shopify Admin, create a second page with no body content, assigned to `page.service`. Visit it. Check:

- Page title renders
- Booking section still renders below
- No broken layout or Liquid errors in source

- [ ] **Step 9: Check browser console**

On all pages created above, open DevTools → Console. Expected: zero errors.
