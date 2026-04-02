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
