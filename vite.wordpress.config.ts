import { defineConfig } from "vite";
import { resolve } from "path";

// WordPress-specific build configuration
export default defineConfig({
  build: {
    outDir: "dist/wordpress",
    lib: {
      entry: resolve(__dirname, "src/vanilla/cookie-manager.js"),
      name: "CookieKit",
      formats: ["iife"],
      fileName: () => "cookie-manager.js",
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "cookie-manager.css";
          return assetInfo.name || "asset";
        },
        inlineDynamicImports: true,
      },
    },
    minify: "terser",
    sourcemap: true,
  },
  css: {
    postcss: "./postcss.wordpress.config.js",
  },
});
