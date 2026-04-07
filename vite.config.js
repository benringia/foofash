import { resolve } from "path";
import { generate } from "./scripts/generate-liquid-assets.mjs";

// Runs generate-liquid-assets.mjs after every build, including in --watch mode.
// This keeps vite-assets.liquid in sync without needing a separate npm script step.
const generateLiquidAssets = {
  name: "generate-liquid-assets",
  closeBundle() {
    try {
      generate({
        manifestPath: "shopify/assets/.vite/manifest.json",
        outputPath: "shopify/snippets/vite-assets.liquid",
      });
      console.log("Written shopify/snippets/vite-assets.liquid");
    } catch (err) {
      console.error(`Error generating liquid assets: ${err.message}`);
    }
  },
};

export default {
  root: "src",
  plugins: [generateLiquidAssets],
  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  build: {
    outDir: "../shopify/assets",
    emptyOutDir: false,
    assetsDir: "",
    manifest: true,
    rollupOptions: {
      // resolve() gives Rollup an absolute path — required when root:'src' but
      // the config file lives at the project root (Vite 5 CWD vs root ambiguity)
      input: resolve("src/scripts/main.js"),
      output: {
        entryFileNames: "main.js",
        assetFileNames: "main.css",
        chunkFileNames: "chunk.js",
      },
    },
  },
};
