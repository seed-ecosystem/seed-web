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
      registerType: 'autoUpdate'
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
