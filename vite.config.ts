import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import UnpluginTypia from "@ryoppippi/unplugin-typia/vite"

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      UnpluginTypia(),
      react()
    ],
    worker: {
      plugins: () => [UnpluginTypia()]
    },
    base: "/seed-web/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: "ES2022"
    },
    esbuild: {
      plugins: [UnpluginTypia().esbuild()]
    }
  };
});
