import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnpluginTypia from "@ryoppippi/unplugin-typia/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
/// <reference types="vitest" />
export default defineConfig({
  plugins: [
    UnpluginTypia(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Seed Messaging Platform",
        short_name: "Seed",
        description: "First Messaging Platform that does not identify you",
        theme_color: "#ffffff",
        icons: [
          {
            src: "icon.svg",
            type: "image/svg+xml",
            sizes: "any",
          },
        ],
      },
    }),
  ],
  base: "/seed-web/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    minify: false,
    sourcemap: true,
    target: "esnext",
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      output: {
        format: "esm",
        entryFileNames: "assets/[hash:21].js",
        chunkFileNames: "assets/[hash:21].js",
        assetFileNames: "assets/[hash:21].[ext]",
        hashCharacters: "hex",
      },
    },
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
});
