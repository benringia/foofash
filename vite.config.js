import { resolve } from 'path'

export default {
  root: 'src',
  build: {
    outDir: '../shopify/assets',
    emptyOutDir: false,
    assetsDir: '',
    manifest: true,
    rollupOptions: {
      input: resolve('src/scripts/main.js')
    }
  }
}
