# Clinic / Service PDP — CRO Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated, booking-focused product page for clinic/service products that drives conversion through clear value communication, clinical trust signals, and a strong booking flow — without touching the ecommerce PDP.

**Architecture:** Shopify OS 2.0 alternate product template (`product.service.json`) pointing to a new section (`main-product-service.liquid`). Service-specific structured content is stored in `service.*` metafields and rendered into dedicated, visually distinct page sections. The sticky ATC snippet receives a minimal, backward-compatible update to support a configurable CTA label.

**Tech Stack:** Shopify OS 2.0, Liquid, Tailwind CSS (utility-first, no inline styles), Vanilla JS (ES Modules), Vite asset pipeline.

---

## Audit Findings (Phase 1)

- `main-product.liquid` has **zero** existing service/clinic conditional logic.
- No service-specific templates, sections, or snippets exist.
- The ecommerce PDP is the only product page — services currently use it unmodified.
- Icon library already includes `stethoscope`, `scissors`, `syringe`, `tooth`, `clock`, `paw` — useful for clinic UI.
- `sticky-atc.liquid` hardcodes "Add to Cart"/"Sold Out" — needs a `cta_label` param.
- Design tokens (`medical-green`, `medical-blue`, `primary`, `tertiary`) are ideal for clinical UI.

---

## File Map

| Action     | File                                           | Responsibility                                  |
| ---------- | ---------------------------------------------- | ----------------------------------------------- |
| Modify     | `shopify/snippets/icon.liquid`                 | Add `calendar`, `check-circle` icons            |
| Modify     | `shopify/snippets/sticky-atc.liquid`           | Accept optional `cta_label` parameter           |
| **Create** | `shopify/sections/main-product-service.liquid` | Full service PDP section                        |
| **Create** | `shopify/templates/product.service.json`       | Alternate product template for service products |

---

## Metafields Reference

These are `service.*` namespace metafields merchants set on service products in Shopify Admin. All are optional — every render is guarded.

| Metafield key               | Type             | Example value                                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `service.tagline`           | single_line_text | "Personalised care from our qualified team"                                           |
| `service.duration`          | single_line_text | "45 minutes"                                                                          |
| `service.who_for`           | single_line_text | "Dogs and cats of all ages"                                                           |
| `service.availability_note` | single_line_text | "Tuesday – Saturday, 9am–5pm"                                                         |
| `service.price_prefix`      | single_line_text | "From"                                                                                |
| `service.includes`          | multi_line_text  | One inclusion per line, e.g. "Full health check\nVaccination record\nFollowup advice" |
| `service.what_to_expect`    | multi_line_text  | Prose or HTML about the appointment experience                                        |
| `service.aftercare`         | multi_line_text  | Prose or HTML about post-appointment care                                             |

---

## Task 1 — Add `calendar` and `check-circle` icons to `icon.liquid`

**Files:**

- Modify: `shopify/snippets/icon.liquid`

- [ ] **Step 1: Open icon.liquid and locate the last `{%- when '...' -%}` block before `{%- endcase -%}`**

  The file ends at line 284 with `{%- endcase -%}`. Insert two new `when` blocks immediately before it.

- [ ] **Step 2: Add the two new icon cases**

  In `shopify/snippets/icon.liquid`, replace the closing `{%- endcase -%}` on line 284 with:

  ```liquid
    {%- when 'calendar' -%}
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
        <rect x='3' y='4' width='18' height='18' rx='2' ry='2'/>
        <line x1='16' y1='2' x2='16' y2='6'/>
        <line x1='8' y1='2' x2='8' y2='6'/>
        <line x1='3' y1='10' x2='21' y2='10'/>
      </svg>

    {%- when 'check-circle' -%}
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        stroke-width='2.5'
        stroke-linecap='round'
        stroke-linejoin='round'
        aria-hidden='true'
        focusable='false'
      >
        <path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/>
        <polyline points='22 4 12 14.01 9 11.01'/>
      </svg>

  {%- endcase -%}
  ```

  The comment header on line 4 should also be updated to list the new icons:
  Replace:

  ```
  {%- comment -%}
    Renders an inline SVG icon.
    Usage: {% render 'icon', icon: 'vet-approved' %}
    Supported: vet-approved, shipping, returns, paw, clock, phone, stethoscope, scissors, syringe, tooth
  {%- endcomment -%}
  ```

  With:

  ```
  {%- comment -%}
    Renders an inline SVG icon.
    Usage: {% render 'icon', icon: 'vet-approved' %}
    Supported: vet-approved, shipping, returns, paw, clock, phone, stethoscope, scissors, syringe, tooth, calendar, check-circle
  {%- endcomment -%}
  ```

- [ ] **Step 3: Verify**

  Run `npm run dev` and check no build errors. The icons will be verified visually in later tasks.

- [ ] **Step 4: Commit**

  ```bash
  git add shopify/snippets/icon.liquid
  git commit -m "feat: add calendar and check-circle icons for service PDP"
  ```

---

## Task 2 — Parameterise `sticky-atc.liquid` CTA label

**Files:**

- Modify: `shopify/snippets/sticky-atc.liquid`

- [ ] **Step 1: Add `cta_label` variable assignment after the existing `assign variant` line**

  After line 9 (`{%- assign variant = product.selected_or_first_available_variant -%}`), add:

  ```liquid
  {%- assign sticky_btn_label = cta_label | default: 'Add to Cart' -%}
  {%- assign sticky_btn_sold_out = cta_sold_out_label | default: 'Sold Out' -%}
  ```

- [ ] **Step 2: Replace the hardcoded button text in the CTA button**

  Find the button content block (lines 59–63):

  ```liquid
  {%- if variant.available -%}
    Add to Cart
  {%- else -%}
    Sold Out
  {%- endif -%}
  ```

  Replace with:

  ```liquid
  {%- if variant.available -%}
    {{ sticky_btn_label }}
  {%- else -%}
    {{ sticky_btn_sold_out }}
  {%- endif -%}
  ```

- [ ] **Step 3: Verify the ecommerce PDP sticky bar is unaffected**

  Open a standard product page in the dev theme. The sticky bar should still read "Add to Cart" (default is preserved). Open a service product page (once template exists) — it will read the `cta_label` passed from the section.

- [ ] **Step 4: Commit**

  ```bash
  git add shopify/snippets/sticky-atc.liquid
  git commit -m "feat: sticky-atc accepts optional cta_label and cta_sold_out_label params"
  ```

---

## Task 3 — Create `main-product-service.liquid`: scaffold + above-fold image column

**Files:**

- Create: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Create the file with the section wrapper and image column**

  Create `shopify/sections/main-product-service.liquid` with this content:

  ```liquid
  {%- comment -%}
    Service / Clinic Product Page — main-product-service.liquid
    Used by templates/product.service.json.
    Differentiated from main-product.liquid by:
      - Booking-focused CTA language
      - Service summary card (duration, who for, availability)
      - What's included section from service.includes metafield
      - Clinical trust strip (licensed vets, tailored care, follow-up)
      - What to expect / aftercare sections
      - FAQ accordion (schema-controlled)
      - No ecommerce patterns (no low-stock urgency, no shipping/returns copy)
  {%- endcomment -%}

  {%- assign variant = product.selected_or_first_available_variant -%}

  {%- comment -%} Service metafields {%- endcomment -%}
  {%- assign service_tagline = product.metafields.service.tagline.value -%}
  {%- assign service_duration = product.metafields.service.duration.value -%}
  {%- assign service_who_for = product.metafields.service.who_for.value -%}
  {%- assign service_availability = product.metafields.service.availability_note.value -%}
  {%- assign service_price_prefix = product.metafields.service.price_prefix.value -%}
  {%- assign service_includes = product.metafields.service.includes.value -%}
  {%- assign service_expect = product.metafields.service.what_to_expect.value -%}
  {%- assign service_aftercare = product.metafields.service.aftercare.value -%}

  <section
    class="main-product-service bg-surface-container-low"
    style="padding-top: {{ section.settings.padding_top }}px; padding-bottom: {{ section.settings.padding_bottom }}px;"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {%- comment -%} ── Above-fold: 60/40 two-column grid ── {%- endcomment -%}
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr] lg:items-start lg:gap-16">
        {%- comment -%} ══ LEFT — service image ══ {%- endcomment -%}
        <div class="service-media relative">
          {%- comment -%} Ambient glow {%- endcomment -%}
          <div
            class="pointer-events-none absolute -inset-8 rounded-full bg-primary/5 blur-3xl"
            aria-hidden="true"
          ></div>

          <div class="group relative overflow-hidden rounded-[3rem] bg-surface shadow-bubbly-lg">
            {%- if product.featured_image != blank -%}
              {%- assign main_img_alt = product.featured_image.alt
                | default: product.title
              -%}
              {{
                product.featured_image
                | image_url: width: 900
                | image_tag:
                  loading: 'eager',
                  fetchpriority: 'high',
                  width: 900,
                  height: 900,
                  class: 'h-full w-full object-cover transition-transform duration-700 group-hover:scale-105',
                  alt: main_img_alt,
                  data-main-image: ''
              }}
            {%- else -%}
              {%- comment -%} No image fallback — stethoscope illustration {%- endcomment -%}
              <div
                class="flex aspect-square w-full items-center justify-center bg-medical-green text-primary/40"
                aria-hidden="true"
                data-main-image
              >
                <span class="block h-32 w-32">
                  {%- render 'icon', icon: 'stethoscope' -%}
                </span>
              </div>
            {%- endif -%}

            {%- comment -%} Service type badge overlaid on image {%- endcomment -%}
            {%- if product.type != blank -%}
              <div class="absolute left-4 top-4">
                <span class="rounded-full bg-surface/90 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-bubbly backdrop-blur-sm">
                  {{ product.type }}
                </span>
              </div>
            {%- endif -%}
          </div>

          {%- comment -%} Thumbnail strip — only when multiple images {%- endcomment -%}
          {%- if product.images.size > 1 -%}
            <div
              class="mt-4 flex gap-3 overflow-x-auto pb-2"
              role="list"
              aria-label="Service images"
            >
              {%- for image in product.images -%}
                <button
                  type="button"
                  role="listitem"
                  data-thumbnail
                  data-image-url="{{ image | image_url: width: 900 }}"
                  class="h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary {% if forloop.first %}ring-2 ring-primary{% else %}ring-2 ring-transparent{% endif %}"
                  aria-label="View image {{ forloop.index }} of {{ product.images.size }}"
                  {% if forloop.first %}
                    aria-pressed="true"
                  {% else %}
                    aria-pressed="false"
                  {% endif %}
                >
                  {{
                    image
                    | image_url: width: 160
                    | image_tag:
                      loading: 'lazy',
                      width: 80,
                      height: 80,
                      class: 'h-full w-full object-cover'
                  }}
                </button>
              {%- endfor -%}
            </div>
          {%- endif -%}
        </div>

        {%- comment -%} ══ RIGHT — service info (Tasks 4 & 5) ══ {%- endcomment -%}
        <div class="service-info flex flex-col">
          {{- 'service-info-placeholder' -}}
        </div>
      </div>
      {%- comment -%} ── Below-fold sections (Tasks 6–10) ── {%- endcomment -%}
    </div>
  </section>

  {%- comment -%} Variant JSON for client-side price updates {%- endcomment -%}
  <script id="product-variants-json" type="application/json">
    [
      {%- for v in product.variants -%}
        {
          "id": {{ v.id }},
          "price": {{ v.price }},
          "compare_at_price": {{ v.compare_at_price | default: 0 }},
          "available": {{ v.available }}
        }{%- unless forloop.last -%},{%- endunless -%}
      {%- endfor -%}
    ]
  </script>

  {%- render 'sticky-atc',
    product: product,
    cta_label: section.settings.cta_label,
    cta_sold_out_label: 'Unavailable'
  -%}

  {% schema %}
  {
    "name": "Service Product",
    "settings": []
  }
  {% endschema %}
  ```

  > Note: The schema is a stub — it will be replaced in full in Task 10. This allows pushing an intermediate commit that can be assigned to a product for visual testing.

- [ ] **Step 2: Verify the section compiles**

  Run `npm run build`. No Liquid errors should appear.

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: scaffold main-product-service section with image column"
  ```

---

## Task 4 — Service info column: eyebrow, title, tagline, summary card, price

**Files:**

- Modify: `shopify/sections/main-product-service.liquid` (replace the `service-info-placeholder` comment with real content)

- [ ] **Step 1: Replace the `{{- 'service-info-placeholder' -}}` line with the full info column**

  Find:

  ```liquid
  {{- 'service-info-placeholder' -}}
  ```

  Replace with:

  ```liquid
  {%- comment -%} ── Cluster 1: Title group ── {%- endcomment -%}
  <div class="flex flex-col gap-2">
    <h1 class="text-3xl font-extrabold leading-[1.15] text-on-surface lg:text-4xl xl:text-[2.75rem]">
      {{ product.title }}
    </h1>
    {%- if service_tagline != blank -%}
      <p class="text-base font-medium text-on-surface-variant">
        {{ service_tagline }}
      </p>
    {%- endif -%}
    {%- render 'rating-stars', product: product -%}
  </div>

  {%- comment -%} ── Cluster 2: Price ── {%- endcomment -%}
  <div class="mt-5 flex flex-wrap items-baseline gap-3" data-pdp-price>
    {%- if service_price_prefix != blank -%}
      <span class="text-sm font-semibold text-on-surface-variant">
        {{- service_price_prefix -}}
      </span>
    {%- endif -%}
    <div class="text-3xl font-black leading-none">
      {%- render 'price', product: product -%}
    </div>
    {%- if variant.compare_at_price > variant.price -%}
      {%- assign savings = variant.compare_at_price | minus: variant.price -%}
      <span class="rounded-full bg-secondary/15 px-3 py-1 text-sm font-bold text-secondary">
        Save {{ savings | money }}
      </span>
    {%- endif -%}
  </div>

  {%- comment -%} ── Cluster 3: Service summary card ── {%- endcomment -%}
  {%- assign has_summary = false -%}
  {%- if service_duration != blank
    or service_who_for != blank
    or service_availability != blank
  -%}
    {%- assign has_summary = true -%}
  {%- endif -%}
  {%- if has_summary -%}
    <div class="mt-5 rounded-3xl bg-surface p-5 shadow-ambient">
      <dl class="flex flex-col gap-4">
        {%- if service_duration != blank -%}
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-medical-green text-primary"
              aria-hidden="true"
            >
              <span class="block h-4 w-4">
                {%- render 'icon', icon: 'clock' -%}
              </span>
            </span>
            <div>
              <dt class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Duration
              </dt>
              <dd class="text-sm font-semibold text-on-surface">
                {{ service_duration }}
              </dd>
            </div>
          </div>
        {%- endif -%}
        {%- if service_who_for != blank -%}
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-medical-green text-primary"
              aria-hidden="true"
            >
              <span class="block h-4 w-4">
                {%- render 'icon', icon: 'paw' -%}
              </span>
            </span>
            <div>
              <dt class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Suitable for
              </dt>
              <dd class="text-sm font-semibold text-on-surface">
                {{ service_who_for }}
              </dd>
            </div>
          </div>
        {%- endif -%}
        {%- if service_availability != blank -%}
          <div class="flex items-center gap-3">
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-medical-blue text-tertiary"
              aria-hidden="true"
            >
              <span class="block h-4 w-4">
                {%- render 'icon', icon: 'calendar' -%}
              </span>
            </span>
            <div>
              <dt class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Availability
              </dt>
              <dd class="text-sm font-semibold text-on-surface">
                {{ service_availability }}
              </dd>
            </div>
          </div>
        {%- endif -%}
      </dl>
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Verify build is clean**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service info column — title, tagline, price, summary card"
  ```

---

## Task 5 — Service info column: booking form, CTA, microcopy, accordion

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Add the booking form block immediately after the summary card `{%- endif -%}` (end of Cluster 3)**

  Find the comment `{%- comment -%} ── Cluster 3: Service summary card ── {%- endcomment -%}` block — after its closing `{%- endif -%}`, append:

  ```liquid
  {%- comment -%} ── Cluster 4: Booking form ── {%- endcomment -%}
  {%- form 'product', product, data-cart-form: '' -%}
    <div class="mt-6 flex flex-col gap-4">
      {%- comment -%} Variant selector — only when product has meaningful variants {%- endcomment -%}
      {%- unless product.has_only_default_variant -%}
        <div class="flex flex-col gap-2.5">
          <p class="text-sm font-semibold text-on-surface-variant">
            {{ product.options.first }}:
            <span
              class="font-semibold text-on-surface"
              data-selected-variant-label
            >
              {{- variant.title -}}
            </span>
          </p>
          <select
            name="id"
            data-variant-selector
            class="sr-only"
            aria-label="{{ product.options.first }}"
          >
            {%- for v in product.variants -%}
              <option
                value="{{ v.id }}"
                {%- unless v.available -%}
                  disabled
                {%- endunless -%}
              >
                {{ v.title }}
              </option>
            {%- endfor -%}
          </select>
          <div
            class="flex flex-wrap gap-2"
            role="group"
            aria-label="{{ product.options.first }}"
          >
            {%- for v in product.variants -%}
              <button
                type="button"
                data-variant-pill
                data-variant-id="{{ v.id }}"
                data-available="{{ v.available }}"
                aria-pressed="{% if forloop.first %}true{% else %}false{% endif %}"
                class="rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 {% if forloop.first %}bg-primary text-on-primary shadow-bubbly{% else %}bg-surface text-on-surface shadow-ambient hover:bg-primary/10{% endif %} {% unless v.available %}cursor-not-allowed opacity-40{% endunless %}"
              >
                {{ v.title }}
              </button>
            {%- endfor -%}
          </div>
        </div>
      {%- else -%}
        <input type="hidden" name="id" value="{{ variant.id }}">
      {%- endunless -%}

      {%- comment -%} Primary booking CTA — full width, no qty stepper for services {%- endcomment -%}
      <button
        type="submit"
        data-add-to-cart
        data-main-atc
        {%- unless variant.available -%}
          disabled
          aria-disabled="true"
        {%- endunless -%}
        class="w-full rounded-2xl bg-primary-gradient py-5 text-base font-bold text-on-primary transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {%- if variant.available -%}
          {{ section.settings.cta_label | default: 'Book Appointment' }}
        {%- else -%}
          Unavailable
        {%- endif -%}
      </button>

      {%- comment -%} Clinical microcopy — 3 reassurance items {%- endcomment -%}
      <div class="flex flex-wrap gap-x-5 gap-y-2 text-xs text-on-surface-variant">
        <span class="flex items-center gap-1.5">
          <span class="block h-3.5 w-3.5 shrink-0" aria-hidden="true">
            {%- render 'icon', icon: 'vet-approved' -%}
          </span>
          {{
            section.settings.microcopy_1
            | default: 'Licensed veterinary professionals'
          }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="block h-3.5 w-3.5 shrink-0" aria-hidden="true">
            {%- render 'icon', icon: 'stethoscope' -%}
          </span>
          {{
            section.settings.microcopy_2
            | default: 'Tailored care plan for your pet'
          }}
        </span>
        <span class="flex items-center gap-1.5">
          <span class="block h-3.5 w-3.5 shrink-0" aria-hidden="true">
            {%- render 'icon', icon: 'returns' -%}
          </span>
          {{
            section.settings.microcopy_3
            | default: 'Follow-up support included'
          }}
        </span>
      </div>
    </div>
  {%- endform -%}

  {%- comment -%} ── Cluster 5: About this service accordion ── {%- endcomment -%}
  {%- if product.description != blank -%}
    <div class="mt-6 flex flex-col divide-y divide-on-surface/8">
      <div data-accordion>
        <button
          type="button"
          data-accordion-trigger
          aria-expanded="false"
          class="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-on-surface transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        >
          <span class="flex items-center gap-2">
            <svg
              class="h-4 w-4 shrink-0 text-on-surface-variant"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x='2' y='2' width='12' height='12' rx='2'/><path d='M5 5h6M5 8h6M5 11h4'/>
            </svg>
            About this service
          </span>
          <span
            class="block h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-200 [[aria-expanded=true]_&]:rotate-180"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d='M5 7.5l5 5 5-5'/>
            </svg>
          </span>
        </button>
        <div
          data-accordion-panel
          hidden
          class="prose prose-sm max-w-none pb-5 text-on-surface-variant"
        >
          {{ product.description }}
        </div>
      </div>
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Build and verify**

  ```bash
  npm run build
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service info column — booking CTA, clinical microcopy, description accordion"
  ```

---

## Task 6 — Below-fold: What's Included section

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Find the below-fold comment placeholder and replace it with the inclusions section**

  Find:

  ```liquid
  {%- comment -%} ── Below-fold sections (Tasks 6–10) ── {%- endcomment -%}
  ```

  Replace with:

  ```liquid
  {%- comment -%} ── Below-fold sections ── {%- endcomment -%}

  {%- comment -%} ── What's Included ── {%- endcomment -%}
  {%- if service_includes != blank -%}
    {%- assign includes_lines = service_includes
      | split: '
  '
    -%}
    <div class="mt-16">
      <div class="rounded-3xl bg-surface p-8 shadow-ambient lg:p-12">
        <h2 class="text-2xl font-extrabold text-on-surface">What's Included</h2>
        <p class="mt-1 text-sm text-on-surface-variant">
          Everything covered in this appointment
        </p>
        <ul
          class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
          aria-label="What's included in this service"
        >
          {%- for item in includes_lines -%}
            {%- assign clean_item = item | strip -%}
            {%- if clean_item != blank -%}
              <li class="flex items-start gap-3">
                <span
                  class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-medical-green text-primary"
                  aria-hidden="true"
                >
                  <span class="block h-3 w-3">
                    {%- render 'icon', icon: 'check-circle' -%}
                  </span>
                </span>
                <span class="text-sm text-on-surface">{{ clean_item }}</span>
              </li>
            {%- endif -%}
          {%- endfor -%}
        </ul>
      </div>
    </div>
  {%- endif -%}
  ```

  > Note: The newline split `split: '\n'` must use a literal newline inside the quotes (not `\n` as escape) because Liquid does not interpret `\n` in string literals. The template above shows a literal newline between `'` characters.

- [ ] **Step 2: Verify**

  ```bash
  npm run build
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service PDP — what's included section from metafield"
  ```

---

## Task 7 — Below-fold: Who It's For + What to Expect sections

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Append after the `{%- endif -%}` that closes the `service_includes` block**

  ```liquid
  {%- comment -%} ── Who It's For + What to Expect (side-by-side on desktop) ── {%- endcomment -%}
  {%- assign has_who_or_expect = false -%}
  {%- if service_who_for != blank or service_expect != blank -%}
    {%- assign has_who_or_expect = true -%}
  {%- endif -%}
  {%- if has_who_or_expect -%}
    <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {%- if service_who_for != blank -%}
        <div class="rounded-3xl bg-surface p-7 shadow-ambient">
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-medical-green text-primary"
              aria-hidden="true"
            >
              <span class="block h-5 w-5">
                {%- render 'icon', icon: 'paw' -%}
              </span>
            </span>
            <h2 class="text-lg font-extrabold text-on-surface">
              Who This Service Is For
            </h2>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-on-surface-variant">
            {{ service_who_for }}
          </p>
        </div>
      {%- endif -%}

      {%- if service_expect != blank -%}
        <div class="rounded-3xl bg-medical-blue/40 p-7 shadow-ambient">
          <div class="flex items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-medical-blue text-tertiary"
              aria-hidden="true"
            >
              <span class="block h-5 w-5">
                {%- render 'icon', icon: 'stethoscope' -%}
              </span>
            </span>
            <h2 class="text-lg font-extrabold text-on-surface">
              What to Expect
            </h2>
          </div>
          <div class="prose prose-sm mt-4 max-w-none text-on-surface-variant">
            {{ service_expect }}
          </div>
        </div>
      {%- endif -%}
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Build and verify**

  ```bash
  npm run build
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service PDP — who it's for and what to expect sections"
  ```

---

## Task 8 — Below-fold: Clinical trust strip

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Append the clinical trust strip after the who/expect `{%- endif -%}`**

  ```liquid
  {%- comment -%} ── Clinical trust strip ── {%- endcomment -%}
  <div class="mt-12 grid grid-cols-1 gap-4 rounded-3xl bg-surface p-8 shadow-ambient sm:grid-cols-2 lg:grid-cols-4">
    <div class="flex items-start gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-medical-green text-primary"
        aria-hidden="true"
      >
        <span class="block h-6 w-6">
          {%- render 'icon', icon: 'vet-approved' -%}
        </span>
      </span>
      <div>
        <p class="font-semibold text-on-surface">
          {{ section.settings.trust_1_title }}
        </p>
        <p class="mt-0.5 text-sm text-on-surface-variant">
          {{ section.settings.trust_1_desc }}
        </p>
      </div>
    </div>
    <div class="flex items-start gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-medical-blue text-tertiary"
        aria-hidden="true"
      >
        <span class="block h-6 w-6">
          {%- render 'icon', icon: 'stethoscope' -%}
        </span>
      </span>
      <div>
        <p class="font-semibold text-on-surface">
          {{ section.settings.trust_2_title }}
        </p>
        <p class="mt-0.5 text-sm text-on-surface-variant">
          {{ section.settings.trust_2_desc }}
        </p>
      </div>
    </div>
    <div class="flex items-start gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary"
        aria-hidden="true"
      >
        <span class="block h-6 w-6">
          {%- render 'icon', icon: 'returns' -%}
        </span>
      </span>
      <div>
        <p class="font-semibold text-on-surface">
          {{ section.settings.trust_3_title }}
        </p>
        <p class="mt-0.5 text-sm text-on-surface-variant">
          {{ section.settings.trust_3_desc }}
        </p>
      </div>
    </div>
    <div class="flex items-start gap-4">
      <span
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-medical-green text-primary"
        aria-hidden="true"
      >
        <span class="block h-6 w-6">{%- render 'icon', icon: 'phone' -%}</span>
      </span>
      <div>
        <p class="font-semibold text-on-surface">
          {{ section.settings.trust_4_title }}
        </p>
        <p class="mt-0.5 text-sm text-on-surface-variant">
          {{ section.settings.trust_4_desc }}
        </p>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: Build and verify**

  ```bash
  npm run build
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service PDP — clinical trust strip (4 items)"
  ```

---

## Task 9 — Below-fold: Aftercare section + FAQ accordion

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Append aftercare section immediately after the trust strip**

  ```liquid
  {%- comment -%} ── Aftercare / Follow-up (optional) ── {%- endcomment -%}
  {%- if service_aftercare != blank -%}
    <div class="mt-10 rounded-3xl bg-surface-container p-8 shadow-ambient lg:p-10">
      <div class="flex items-center gap-3">
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-medical-green text-primary"
          aria-hidden="true"
        >
          <span class="block h-5 w-5">
            {%- render 'icon', icon: 'vet-approved' -%}
          </span>
        </span>
        <h2 class="text-lg font-extrabold text-on-surface">
          Aftercare &amp; Follow-up
        </h2>
      </div>
      <div class="prose prose-sm mt-4 max-w-none text-on-surface-variant">
        {{ service_aftercare }}
      </div>
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Append the FAQ accordion section immediately after the aftercare block**

  ```liquid
  {%- comment -%} ── FAQ accordion (schema-controlled, up to 5 Q&A pairs) ── {%- endcomment -%}
  {%- assign has_faq = false -%}
  {%- if section.settings.faq_q_1 != blank
    or section.settings.faq_q_2 != blank
    or section.settings.faq_q_3 != blank
    or section.settings.faq_q_4 != blank
    or section.settings.faq_q_5 != blank
  -%}
    {%- assign has_faq = true -%}
  {%- endif -%}

  {%- if has_faq -%}
    <div class="mt-12">
      <h2 class="text-2xl font-extrabold text-on-surface">
        Frequently Asked Questions
      </h2>
      <div class="mt-6 flex flex-col divide-y divide-on-surface/8 rounded-3xl bg-surface px-6 shadow-ambient">
        {%- assign faq_pairs = 'faq_q_1,faq_q_2,faq_q_3,faq_q_4,faq_q_5'
          | split: ','
        -%}
        {%- for faq_key in faq_pairs -%}
          {%- assign faq_index = forloop.index -%}
          {%- assign q_key = faq_key -%}
          {%- assign a_key = faq_key | replace: 'faq_q_', 'faq_a_' -%}
          {%- assign q_val = section.settings[q_key] -%}
          {%- assign a_val = section.settings[a_key] -%}
          {%- if q_val != blank and a_val != blank -%}
            <div data-accordion>
              <button
                type="button"
                data-accordion-trigger
                aria-expanded="false"
                class="flex w-full items-center justify-between py-5 text-left text-sm font-semibold text-on-surface transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <span>{{ q_val }}</span>
                <span
                  class="ml-4 block h-5 w-5 shrink-0 text-on-surface-variant transition-transform duration-200 [[aria-expanded=true]_&]:rotate-180"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d='M5 7.5l5 5 5-5'/>
                  </svg>
                </span>
              </button>
              <div
                data-accordion-panel
                hidden
                class="pb-5 text-sm leading-relaxed text-on-surface-variant"
              >
                {{ a_val }}
              </div>
            </div>
          {%- endif -%}
        {%- endfor -%}
      </div>
    </div>
  {%- endif -%}
  ```

- [ ] **Step 3: Build and verify**

  ```bash
  npm run build
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service PDP — aftercare section and FAQ accordion"
  ```

---

## Task 10 — Secondary booking CTA banner + complete schema block

**Files:**

- Modify: `shopify/sections/main-product-service.liquid`

- [ ] **Step 1: Append the secondary CTA banner after the FAQ block**

  ```liquid
  {%- comment -%} ── Secondary booking CTA banner ── {%- endcomment -%}
  {%- if section.settings.show_secondary_cta -%}
    <div class="mt-16 overflow-hidden rounded-3xl bg-primary-gradient p-10 text-center lg:p-14">
      <h2 class="text-2xl font-extrabold text-on-primary lg:text-3xl">
        {{ section.settings.secondary_cta_heading | default: 'Ready to book?' }}
      </h2>
      {%- if section.settings.secondary_cta_subtext != blank -%}
        <p class="mt-3 text-base text-on-primary/80">
          {{ section.settings.secondary_cta_subtext }}
        </p>
      {%- endif -%}
      {%- form 'product', product -%}
        {%- unless product.has_only_default_variant -%}
          <input
            type="hidden"
            name="id"
            value="{{ variant.id }}"
            data-secondary-cta-variant-id
          >
        {%- else -%}
          <input type="hidden" name="id" value="{{ variant.id }}">
        {%- endunless -%}
        <button
          type="submit"
          data-add-to-cart
          {%- unless variant.available -%}
            disabled
            aria-disabled="true"
          {%- endunless -%}
          class="mt-6 inline-block rounded-2xl bg-surface px-10 py-4 text-base font-bold text-primary shadow-bubbly transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {%- if variant.available -%}
            {{ section.settings.cta_label | default: 'Book Appointment' }}
          {%- else -%}
            Unavailable
          {%- endif -%}
        </button>
      {%- endform -%}
    </div>
  {%- endif -%}
  ```

- [ ] **Step 2: Replace the stub `{% schema %}` block with the full schema**

  Find the existing stub:

  ```liquid
  {% schema %}
  {
    "name": "Service Product",
    "settings": []
  }
  {% endschema %}
  ```

  Replace with:

  ```liquid
  {% schema %}
  {
    "name": "Service Product",
    "settings": [
      {
        "type": "range",
        "id": "padding_top",
        "label": "Padding top",
        "min": 0,
        "max": 100,
        "step": 4,
        "unit": "px",
        "default": 40
      },
      {
        "type": "range",
        "id": "padding_bottom",
        "label": "Padding bottom",
        "min": 0,
        "max": 100,
        "step": 4,
        "unit": "px",
        "default": 40
      },
      {
        "type": "header",
        "content": "Booking CTA"
      },
      {
        "type": "text",
        "id": "cta_label",
        "label": "Primary CTA label",
        "default": "Book Appointment"
      },
      {
        "type": "header",
        "content": "CTA microcopy"
      },
      {
        "type": "paragraph",
        "content": "Three short reassurance lines shown beneath the booking button."
      },
      {
        "type": "text",
        "id": "microcopy_1",
        "label": "Microcopy line 1",
        "default": "Licensed veterinary professionals"
      },
      {
        "type": "text",
        "id": "microcopy_2",
        "label": "Microcopy line 2",
        "default": "Tailored care plan for your pet"
      },
      {
        "type": "text",
        "id": "microcopy_3",
        "label": "Microcopy line 3",
        "default": "Follow-up support included"
      },
      {
        "type": "header",
        "content": "Clinical trust strip"
      },
      {
        "type": "text",
        "id": "trust_1_title",
        "label": "Item 1 title",
        "default": "Licensed Veterinary Professionals"
      },
      {
        "type": "text",
        "id": "trust_1_desc",
        "label": "Item 1 description",
        "default": "All services are delivered by fully qualified, registered vets."
      },
      {
        "type": "text",
        "id": "trust_2_title",
        "label": "Item 2 title",
        "default": "Personalised Care Plan"
      },
      {
        "type": "text",
        "id": "trust_2_desc",
        "label": "Item 2 description",
        "default": "Every appointment is tailored to your pet's individual needs."
      },
      {
        "type": "text",
        "id": "trust_3_title",
        "label": "Item 3 title",
        "default": "Follow-up Support Included"
      },
      {
        "type": "text",
        "id": "trust_3_desc",
        "label": "Item 3 description",
        "default": "We're here after your visit with advice and next steps."
      },
      {
        "type": "text",
        "id": "trust_4_title",
        "label": "Item 4 title",
        "default": "Transparent Pricing"
      },
      {
        "type": "text",
        "id": "trust_4_desc",
        "label": "Item 4 description",
        "default": "No hidden fees. You see the full cost before you book."
      },
      {
        "type": "header",
        "content": "Secondary CTA banner"
      },
      {
        "type": "checkbox",
        "id": "show_secondary_cta",
        "label": "Show secondary CTA banner",
        "default": true
      },
      {
        "type": "text",
        "id": "secondary_cta_heading",
        "label": "Banner heading",
        "default": "Ready to book your appointment?"
      },
      {
        "type": "text",
        "id": "secondary_cta_subtext",
        "label": "Banner subtext",
        "default": "Join hundreds of pet owners who trust FOOFASH Clinic for their pet's care."
      },
      {
        "type": "header",
        "content": "FAQ"
      },
      {
        "type": "paragraph",
        "content": "Add up to 5 frequently asked questions. Leave blank to hide."
      },
      {
        "type": "text",
        "id": "faq_q_1",
        "label": "Question 1"
      },
      {
        "type": "textarea",
        "id": "faq_a_1",
        "label": "Answer 1"
      },
      {
        "type": "text",
        "id": "faq_q_2",
        "label": "Question 2"
      },
      {
        "type": "textarea",
        "id": "faq_a_2",
        "label": "Answer 2"
      },
      {
        "type": "text",
        "id": "faq_q_3",
        "label": "Question 3"
      },
      {
        "type": "textarea",
        "id": "faq_a_3",
        "label": "Answer 3"
      },
      {
        "type": "text",
        "id": "faq_q_4",
        "label": "Question 4"
      },
      {
        "type": "textarea",
        "id": "faq_a_4",
        "label": "Answer 4"
      },
      {
        "type": "text",
        "id": "faq_q_5",
        "label": "Question 5"
      },
      {
        "type": "textarea",
        "id": "faq_a_5",
        "label": "Answer 5"
      }
    ]
  }
  {% endschema %}
  ```

- [ ] **Step 3: Build and verify**

  ```bash
  npm run build
  ```

  Expected: no errors. The section is now feature-complete.

- [ ] **Step 4: Commit**

  ```bash
  git add shopify/sections/main-product-service.liquid
  git commit -m "feat: service PDP — secondary CTA banner and complete schema"
  ```

---

## Task 11 — Create `product.service.json` template

**Files:**

- Create: `shopify/templates/product.service.json`

- [ ] **Step 1: Create the template file**

  Create `shopify/templates/product.service.json`:

  ```json
  {
    "sections": {
      "main-product-service": {
        "type": "main-product-service",
        "settings": {
          "padding_top": 40,
          "padding_bottom": 40,
          "cta_label": "Book Appointment",
          "microcopy_1": "Licensed veterinary professionals",
          "microcopy_2": "Tailored care plan for your pet",
          "microcopy_3": "Follow-up support included",
          "trust_1_title": "Licensed Veterinary Professionals",
          "trust_1_desc": "All services are delivered by fully qualified, registered vets.",
          "trust_2_title": "Personalised Care Plan",
          "trust_2_desc": "Every appointment is tailored to your pet's individual needs.",
          "trust_3_title": "Follow-up Support Included",
          "trust_3_desc": "We're here after your visit with advice and next steps.",
          "trust_4_title": "Transparent Pricing",
          "trust_4_desc": "No hidden fees. You see the full cost before you book.",
          "show_secondary_cta": true,
          "secondary_cta_heading": "Ready to book your appointment?",
          "secondary_cta_subtext": "Join hundreds of pet owners who trust FOOFASH Clinic for their pet's care."
        }
      }
    },
    "order": ["main-product-service"]
  }
  ```

- [ ] **Step 2: Build and push to dev theme**

  ```bash
  npm run build && npm run push
  ```

- [ ] **Step 3: Assign the template in Shopify Admin**
  1. Go to Shopify Admin → Products
  2. Open a clinic/service product
  3. In the right sidebar, under "Theme template", select `service`
  4. Save the product
  5. Click "View" to open the product on the storefront

  Expected: the service PDP layout renders — title, price, summary card (if metafields set), booking CTA, trust strip.

- [ ] **Step 4: Verify ecommerce PDP is unaffected**

  Open a standard (non-service) product. Confirm it still uses the original layout with "Add to Cart", quantity stepper, ecommerce trust strip. No regressions.

- [ ] **Step 5: Commit**

  ```bash
  git add shopify/templates/product.service.json
  git commit -m "feat: product.service.json template for clinic service products"
  ```

---

## Task 12 — Set service metafields and full visual QA

**Files:** No code changes — metafield data entry + visual review.

- [ ] **Step 1: Set metafields on a test service product in Shopify Admin**

  Navigate to Products → [a service product] → Custom data (Metafields panel). Add:

  | Metafield                   | Value to set for testing                                                                                                                                                                                       |
  | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `service.tagline`           | "Personalised care from our qualified vet team"                                                                                                                                                                |
  | `service.duration`          | "45 minutes"                                                                                                                                                                                                   |
  | `service.who_for`           | "Dogs and cats of all ages and breeds"                                                                                                                                                                         |
  | `service.availability_note` | "Tuesday – Saturday, 9am–5pm"                                                                                                                                                                                  |
  | `service.price_prefix`      | "From"                                                                                                                                                                                                         |
  | `service.includes`          | "Full physical health examination\nWeight and body condition check\nVaccination review and discussion\nParasite prevention advice\nNutritional assessment\nTailored wellness plan"                             |
  | `service.what_to_expect`    | "Your appointment begins with a brief consultation about your pet's recent history. Our vet will then perform a thorough head-to-toe examination before discussing any findings and recommendations with you." |
  | `service.aftercare`         | "Following your appointment, you'll receive a written summary of the vet's findings and next steps. Our team is available by phone or email for any follow-up questions."                                      |

  Also set 2 FAQ entries in the Shopify Theme Editor (Customise → navigate to the service product → FAQ section).

- [ ] **Step 2: Desktop visual checklist**

  Open the service product on a desktop browser (1280px+ viewport). Verify:
  - [ ] Eyebrow badge (product type) overlaid on top-left of image
  - [ ] Title is large, prominent, leading the right column
  - [ ] Tagline appears below title in muted colour
  - [ ] Price shows "From $X.XX" with prefix
  - [ ] Summary card renders with clock/paw/calendar icons and correct values
  - [ ] Booking CTA is full-width, prominent, correct label "Book Appointment"
  - [ ] Three microcopy lines appear below CTA
  - [ ] "About this service" accordion is collapsed by default
  - [ ] What's included section renders as a 2-column visual checklist
  - [ ] Who this is for and What to expect appear side by side
  - [ ] Clinical trust strip shows 4 items across the row
  - [ ] Aftercare section renders with correct prose
  - [ ] FAQ accordion shows 2 questions, both collapsed by default
  - [ ] Secondary CTA banner renders at page bottom with gradient background
  - [ ] Sticky ATC shows "Book Appointment"

- [ ] **Step 3: Mobile visual checklist (375px viewport)**
  - [ ] Title remains readable, no overflow
  - [ ] Summary card stacks cleanly in a single column
  - [ ] Booking CTA is full width and easy to tap
  - [ ] What's included list is single column
  - [ ] Who for / What to expect stack vertically
  - [ ] Trust strip is single column
  - [ ] FAQ accordion is usable (large enough tap targets)
  - [ ] Secondary CTA banner padding is comfortable
  - [ ] No cramped spacing or text clipping anywhere

- [ ] **Step 4: Edge case checklist**

  Test these sparse scenarios by temporarily removing metafields:
  - [ ] No image → stethoscope placeholder renders, no layout break
  - [ ] No `service.tagline` → tagline row disappears cleanly
  - [ ] No summary metafields (duration/who_for/availability) → summary card hidden entirely
  - [ ] No `service.includes` → What's Included section hidden entirely
  - [ ] No `service.what_to_expect` and no `service.who_for` → the two-card row disappears
  - [ ] No `service.aftercare` → aftercare section hidden
  - [ ] No FAQ configured in schema → FAQ section hidden
  - [ ] `show_secondary_cta` = false → banner hidden

- [ ] **Step 5: Ecommerce regression check**

  Open 3 different standard products. Confirm none of them show the service layout. Confirm cart, sticky ATC, and all ecommerce PDP features work normally.

---

## Spec Coverage Self-Review

| Spec requirement                                                            | Covered by                                                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 1 — audit + no duplicate architecture                                 | Audit findings documented; uses OS 2.0 alternate template pattern                                           |
| Phase 2 — strong above-fold booking area                                    | Task 4: eyebrow overlay, title, tagline, summary card, price                                                |
| Phase 2 — service facts (price, duration, who for, availability)            | Task 4: summary card with icon rows                                                                         |
| Phase 3 — What's included as distinct section                               | Task 6: visual checklist section from `service.includes` metafield                                          |
| Phase 3 — who for / what to expect                                          | Task 7: two-card section                                                                                    |
| Phase 3 — aftercare / follow-up                                             | Task 9: aftercare section                                                                                   |
| Phase 4 — clinical trust (licensed vets, tailored care, follow-up, pricing) | Task 8: 4-item trust strip with schema-editable text                                                        |
| Phase 4 — no fake urgency / gimmicky trust                                  | No low-stock badge, no dispatch countdown on service page                                                   |
| Phase 5 — primary CTA above fold                                            | Task 5: full-width booking button                                                                           |
| Phase 5 — secondary CTA after details                                       | Task 10: secondary CTA banner                                                                               |
| Phase 5 — sticky CTA                                                        | Task 2: sticky-atc label param; rendered with `cta_label` in Task 3                                         |
| Phase 5 — CTA language ("Book" not "Add to Cart")                           | `cta_label` default "Book Appointment" throughout                                                           |
| Phase 6 — landing-page composition                                          | Full section order: hero → summary card → inclusions → who/expect → trust → aftercare → FAQ → secondary CTA |
| Phase 7 — mobile CRO                                                        | Task 12 mobile checklist; responsive classes throughout                                                     |
| Constraint — no breaking ecommerce PDP                                      | Separate section + template; main-product.liquid untouched                                                  |
| Constraint — no inline styles                                               | All Tailwind utilities; only the section padding uses inline style (same as existing pattern)               |
| Edge cases — sparse metafields                                              | All `if … != blank` guards on every metafield render                                                        |
| Edge cases — no image                                                       | Stethoscope placeholder in image column                                                                     |
