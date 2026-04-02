# Shopify Theme Dev Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a production-ready Shopify OS 2.0 theme development environment with Vite, Tailwind CSS JIT, Vanilla JS ES Modules, and a manifest-driven asset pipeline.

**Architecture:** Vite builds from `/src` into `/shopify/assets` with content hashing. A post-build Node.js script reads Vite's manifest and generates `shopify/snippets/vite-assets.liquid` so Liquid can reference hashed filenames without hardcoding them. Dev uses `concurrently` to run Vite HMR and Shopify CLI simultaneously.

**Tech Stack:** Node.js (ESM), Vite 5, Tailwind CSS 3 (JIT), Vanilla JS, Shopify Liquid OS 2.0, Shopify CLI, concurrently

---

## Prerequisites

- Node.js ≥ 18 installed
- Shopify CLI installed globally (`npm install -g @shopify/cli @shopify/theme`)
- A Shopify store + theme for `shopify theme dev` (store URL will be prompted on first run)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Create | Project metadata, scripts, dependencies |
| `.gitignore` | Create | Exclude node_modules, .env files |
| `vite.config.js` | Create | Build config: root=src, outDir=shopify/assets, manifest |
| `tailwind.config.js` | Create | Content paths pointing to liquid + src files |
| `postcss.config.js` | Create | Wire Tailwind + Autoprefixer into PostCSS |
| `src/styles/main.css` | Create | Tailwind directives — imported by main.js |
| `src/scripts/main.js` | Create | Entry: imports CSS + modules, fires on DOMContentLoaded |
| `src/scripts/cart.js` | Create | Exported `initCart()` — AJAX cart API stub |
| `src/scripts/product.js` | Create | Exported `initProduct()` — variant switching stub |
| `src/scripts/ui/modal.js` | Create | Exported `initModal()` — open/close, ESC, focus trap stub |
| `src/scripts/ui/accordion.js` | Create | Exported `initAccordion()` — expand/collapse stub |
| `scripts/generate-liquid-assets.mjs` | Create | Reads manifest.json → writes vite-assets.liquid |
| `scripts/generate-liquid-assets.test.mjs` | Create | Node built-in test runner tests for generate script |
| `shopify/config/settings_schema.json` | Create | Empty schema array (`[]`) — required by Shopify CLI |
| `shopify/layout/theme.liquid` | Create | Root layout: renders vite-assets snippet |
| `shopify/templates/index.json` | Create | OS 2.0 homepage JSON template |
| `shopify/sections/main-hero.liquid` | Create | Minimal hero section with schema |
| `shopify/snippets/vite-assets.liquid` | Create | Placeholder (overwritten by generate script after build) |

---

## Task 1: Initialize Project + Git

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Init git repository**

```bash
cd "C:/Users/Ben/Documents/Shopify Projects/foofash"
git init
```

Expected: `Initialized empty Git repository in .../foofash/.git/`

- [ ] **Step 2: Create `package.json`**

Create `package.json` with this exact content:

```json
{
  "name": "foofash",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"vite\" \"shopify theme dev\"",
    "build": "vite build && node scripts/generate-liquid-assets.mjs",
    "push": "shopify theme push",
    "test": "node --test scripts/*.test.mjs"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.21",
    "concurrently": "^9.1.2",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "vite": "^5.4.19"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.env
.env.*
!.env.example
.DS_Store
*.log
```

Note: `shopify/` is **not** gitignored — all built theme assets must be committed so `shopify theme push` works.

- [ ] **Step 4: Create all required directories**

```bash
mkdir -p src/scripts/ui src/styles scripts shopify/assets shopify/config shopify/layout shopify/sections shopify/snippets shopify/templates
```

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: initialize project structure"
```

---

## Task 2: Install Dependencies + Configure Build Tools

**Files:**
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 2: Create `vite.config.js`**

```js
export default {
  root: 'src',
  build: {
    outDir: '../shopify/assets',
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: 'scripts/main.js'
    }
  }
}
```

- [ ] **Step 3: Create `tailwind.config.js`**

```js
export default {
  content: [
    './shopify/**/*.liquid',
    './src/**/*.{js,css}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

- [ ] **Step 4: Create `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add vite.config.js tailwind.config.js postcss.config.js package-lock.json
git commit -m "chore: configure vite, tailwind, postcss"
```

---

## Task 3: Create JavaScript Source Files

**Files:**
- Create: `src/styles/main.css`
- Create: `src/scripts/main.js`
- Create: `src/scripts/cart.js`
- Create: `src/scripts/product.js`
- Create: `src/scripts/ui/modal.js`
- Create: `src/scripts/ui/accordion.js`

- [ ] **Step 1: Create `src/styles/main.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 2: Create `src/scripts/cart.js`**

```js
export function initCart() {
  const cartForm = document.querySelector('[data-cart-form]')
  if (!cartForm) return

  cartForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(cartForm)
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData))
    })
  })
}
```

- [ ] **Step 3: Create `src/scripts/product.js`**

```js
export function initProduct() {
  const variantSelector = document.querySelector('[data-variant-selector]')
  if (!variantSelector) return

  variantSelector.addEventListener('change', () => {
    const selectedVariant = variantSelector.value
    const addToCartBtn = document.querySelector('[data-add-to-cart]')
    if (addToCartBtn) {
      addToCartBtn.dataset.variantId = selectedVariant
    }
  })
}
```

- [ ] **Step 4: Create `src/scripts/ui/modal.js`**

```js
export function initModal() {
  const triggers = document.querySelectorAll('[data-modal-trigger]')
  if (!triggers.length) return

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.dataset.modalTrigger
      const modal = document.getElementById(targetId)
      if (!modal) return
      modal.removeAttribute('hidden')
      modal.focus()
    })
  })

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    const openModal = document.querySelector('[data-modal]:not([hidden])')
    if (openModal) openModal.setAttribute('hidden', '')
  })
}
```

- [ ] **Step 5: Create `src/scripts/ui/accordion.js`**

```js
export function initAccordion() {
  const accordions = document.querySelectorAll('[data-accordion]')
  if (!accordions.length) return

  accordions.forEach((accordion) => {
    const trigger = accordion.querySelector('[data-accordion-trigger]')
    const panel = accordion.querySelector('[data-accordion-panel]')
    if (!trigger || !panel) return

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true'
      trigger.setAttribute('aria-expanded', String(!isExpanded))
      panel.hidden = isExpanded
    })
  })
}
```

- [ ] **Step 6: Create `src/scripts/main.js`**

```js
import '../styles/main.css'
import { initCart } from './cart.js'
import { initProduct } from './product.js'
import { initModal } from './ui/modal.js'
import { initAccordion } from './ui/accordion.js'

document.addEventListener('DOMContentLoaded', () => {
  initCart()
  initProduct()
  initModal()
  initAccordion()
})
```

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add js source modules and tailwind entry"
```

---

## Task 4: Create Shopify Theme Files

**Files:**
- Create: `shopify/config/settings_schema.json`
- Create: `shopify/layout/theme.liquid`
- Create: `shopify/templates/index.json`
- Create: `shopify/sections/main-hero.liquid`
- Create: `shopify/snippets/vite-assets.liquid`

- [ ] **Step 1: Create `shopify/config/settings_schema.json`**

```json
[]
```

This empty array is required by the Shopify CLI. The CLI errors if the file is absent.

- [ ] **Step 2: Create placeholder `shopify/snippets/vite-assets.liquid`**

```liquid
{% comment %}
  Auto-generated by scripts/generate-liquid-assets.mjs after `npm run build`.
  Do not edit this file manually — run `npm run build` to regenerate.
{% endcomment %}
```

This placeholder is safe to render — it outputs nothing but won't throw a Liquid error. It gets overwritten with real asset tags after the first build.

- [ ] **Step 3: Create `shopify/layout/theme.liquid`**

```liquid
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ page_title }}</title>
    {% render 'vite-assets' %}
    {{ content_for_header }}
  </head>
  <body>
    <main id="main-content" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>
  </body>
</html>
```

- [ ] **Step 4: Create `shopify/sections/main-hero.liquid`**

```liquid
<section class="main-hero">
  <h1>{{ section.settings.heading }}</h1>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Welcome"
    }
  ],
  "presets": [
    {
      "name": "Hero"
    }
  ]
}
{% endschema %}
```

- [ ] **Step 5: Create `shopify/templates/index.json`**

```json
{
  "sections": {
    "main-hero": {
      "type": "main-hero",
      "settings": {}
    }
  },
  "order": ["main-hero"]
}
```

- [ ] **Step 6: Commit**

```bash
git add shopify/
git commit -m "feat: add base shopify theme files"
```

---

## Task 5: Build the Asset Generation Script (TDD)

**Files:**
- Create: `scripts/generate-liquid-assets.test.mjs`
- Create: `scripts/generate-liquid-assets.mjs`

### Overview

`generate-liquid-assets.mjs` reads Vite's `manifest.json` and writes `shopify/snippets/vite-assets.liquid`. The exported `generate()` function accepts `{ manifestPath, outputPath }` so it can be tested without touching the real filesystem.

### Vite 5 manifest shape (for reference)

```json
{
  "scripts/main.js": {
    "file": "main.BfN1CBFR.js",
    "name": "main",
    "src": "scripts/main.js",
    "isEntry": true,
    "css": ["main.DiwrgTda.css"]
  }
}
```

The entry key is `"scripts/main.js"` (relative to the Vite root, which is `src/`).

- [ ] **Step 1: Write the failing tests**

Create `scripts/generate-liquid-assets.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { generate } from './generate-liquid-assets.mjs'

function makeTempDir() {
  const dir = join(tmpdir(), `vite-test-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

test('writes vite-assets.liquid with correct hashed filenames', () => {
  const tmp = makeTempDir()
  const manifestPath = join(tmp, 'manifest.json')
  const outputPath = join(tmp, 'vite-assets.liquid')

  writeFileSync(manifestPath, JSON.stringify({
    'scripts/main.js': {
      file: 'main.abc123.js',
      isEntry: true,
      css: ['main.def456.css']
    }
  }))

  generate({ manifestPath, outputPath })

  const output = readFileSync(outputPath, 'utf8')
  assert.ok(output.includes("'main.abc123.js'"), 'should contain hashed JS filename')
  assert.ok(output.includes("'main.def456.css'"), 'should contain hashed CSS filename')
  assert.ok(output.includes('asset_url'), 'should use asset_url filter')
  assert.ok(output.includes('<script'), 'should include script tag')
  assert.ok(output.includes('<link'), 'should include link tag')

  rmSync(tmp, { recursive: true })
})

test('throws when manifest file is missing', () => {
  const tmp = makeTempDir()
  const manifestPath = join(tmp, 'nonexistent.json')
  const outputPath = join(tmp, 'vite-assets.liquid')

  assert.throws(
    () => generate({ manifestPath, outputPath }),
    /manifest not found/i
  )

  assert.ok(!existsSync(outputPath), 'should not write output on error')

  rmSync(tmp, { recursive: true })
})

test('throws when entry key is missing from manifest', () => {
  const tmp = makeTempDir()
  const manifestPath = join(tmp, 'manifest.json')
  const outputPath = join(tmp, 'vite-assets.liquid')

  writeFileSync(manifestPath, JSON.stringify({
    'some/other/file.js': { file: 'other.js', isEntry: true }
  }))

  assert.throws(
    () => generate({ manifestPath, outputPath }),
    /entry.*not found/i
  )

  rmSync(tmp, { recursive: true })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: 3 failures with `generate is not a function` or `Cannot find module`.

- [ ] **Step 3: Implement `scripts/generate-liquid-assets.mjs`**

```js
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const MANIFEST_PATH = 'shopify/assets/.vite/manifest.json'
const OUTPUT_PATH = 'shopify/snippets/vite-assets.liquid'
const ENTRY_KEY = 'scripts/main.js'

export function generate({ manifestPath, outputPath }) {
  if (!existsSync(manifestPath)) {
    throw new Error(`Manifest not found at ${manifestPath}`)
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const entry = manifest[ENTRY_KEY]

  if (!entry) {
    throw new Error(`Entry "${ENTRY_KEY}" not found in manifest`)
  }

  const jsFile = entry.file
  const cssFile = entry.css?.[0]

  if (!jsFile || !cssFile) {
    throw new Error(`Entry "${ENTRY_KEY}" is missing .file or .css in manifest`)
  }

  const snippet = [
    `{% comment %}Auto-generated by scripts/generate-liquid-assets.mjs — do not edit{% endcomment %}`,
    `{% assign vite_css = '${cssFile}' | asset_url %}`,
    `{% assign vite_js = '${jsFile}' | asset_url %}`,
    `<link rel="stylesheet" href="{{ vite_css }}" type="text/css">`,
    `<script src="{{ vite_js }}" type="module" defer></script>`
  ].join('\n')

  writeFileSync(outputPath, snippet)
}

// Only execute when run directly (not when imported in tests)
const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  try {
    generate({ manifestPath: MANIFEST_PATH, outputPath: OUTPUT_PATH })
    console.log(`✓ Written ${OUTPUT_PATH}`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected output:
```
▶ writes vite-assets.liquid with correct hashed filenames
  ✓ writes vite-assets.liquid with correct hashed filenames (Xms)
▶ throws when manifest file is missing
  ✓ throws when manifest file is missing (Xms)
▶ throws when entry key is missing from manifest
  ✓ throws when entry key is missing from manifest (Xms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

- [ ] **Step 5: Commit**

```bash
git add scripts/
git commit -m "feat: add manifest-to-liquid asset generation script with tests"
```

---

## Task 6: Verify Full Build Pipeline

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Expected:
- Vite compiles `src/scripts/main.js` and Tailwind CSS
- Output files appear in `shopify/assets/`:
  - `main.[hash].js`
  - `main.[hash].css`
  - `.vite/manifest.json`
- `generate-liquid-assets.mjs` runs and writes `shopify/snippets/vite-assets.liquid`
- Final log line: `✓ Written shopify/snippets/vite-assets.liquid`

- [ ] **Step 2: Verify `vite-assets.liquid` was written correctly**

Open `shopify/snippets/vite-assets.liquid`. It should look like:

```liquid
{% comment %}Auto-generated by scripts/generate-liquid-assets.mjs — do not edit{% endcomment %}
{% assign vite_css = 'main.XXXXXXXX.css' | asset_url %}
{% assign vite_js = 'main.XXXXXXXX.js' | asset_url %}
<link rel="stylesheet" href="{{ vite_css }}" type="text/css">
<script src="{{ vite_js }}" type="module" defer></script>
```

The hash values should match the filenames in `shopify/assets/`.

- [ ] **Step 3: Verify manifest.json contains expected structure**

Open `shopify/assets/.vite/manifest.json`. It should contain an entry keyed `"scripts/main.js"` with `file`, `css`, and `isEntry: true`.

- [ ] **Step 4: Commit build output**

```bash
git add shopify/assets/ shopify/snippets/vite-assets.liquid
git commit -m "chore: initial build output"
```

---

## Task 7: Verify Dev Workflow (Manual Smoke Test)

This task requires a Shopify store. If you don't have one yet, skip and return after store setup.

- [ ] **Step 1: Run the dev command**

```bash
npm run dev
```

Expected:
- Vite starts on `http://localhost:5173`
- Shopify CLI prompts for store URL on first run (follow the prompts)
- After auth, `shopify theme dev` starts and outputs a preview URL like `https://your-store.myshopify.com?preview_theme_id=XXXXX`

- [ ] **Step 2: Open the preview URL in a browser**

Verify:
- Homepage loads without Liquid errors
- No console errors in browser DevTools
- Hero section renders with "Welcome" heading
- Page source shows `<link>` and `<script>` tags pointing to hashed assets on the Shopify CDN

- [ ] **Step 3: Make a style change to verify Tailwind JIT**

Add `bg-blue-500 text-white p-4` classes to the `<section>` in `shopify/sections/main-hero.liquid`. Save the file. Shopify CLI should sync the change. Reload the preview URL and verify the blue background appears.

- [ ] **Step 4: Revert the test change**

```bash
git checkout shopify/sections/main-hero.liquid
```

---

## Verification Summary (Acceptance Criteria)

| Check | Command / How |
|-------|--------------|
| Build outputs hashed assets | `npm run build` → check `shopify/assets/main.*.js` and `main.*.css` |
| Liquid snippet updated | Check `shopify/snippets/vite-assets.liquid` after build |
| All tests pass | `npm test` → 3 pass, 0 fail |
| No hardcoded filenames in Liquid | Grep `shopify/` for hardcoded `.js`/`.css` references (should find none except the generated snippet) |
| No console errors | Open storefront in browser DevTools |
| No framework code in bundle | `vite build` → bundle size should be minimal (< 20kb unminified) |
