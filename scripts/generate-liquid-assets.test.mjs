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
