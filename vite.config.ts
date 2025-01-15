import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnpluginTypia from '@ryoppippi/unplugin-typia/vite'
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    UnpluginTypia(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Seed Messaging Platform",
        short_name: "Seed",
        description: "First Messaging Platform that does not identify you",
        theme_color: "#ffffff",
        icons: [
          {
            src: "icon.svg",
            type: "image/svg+xml",
            sizes: "any"
          }
        ]
      }
    })
  ],
  base: '/seed-web/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "ES2022"
  },
});
