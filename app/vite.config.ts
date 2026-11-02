import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// A new id every build. The app compares it with version.json on the server to know an update exists.
declare const process: { env: Record<string, string | undefined> };
const BUILD_ID = process.env.BUILD_ID ?? new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";

// Build output goes to ../docs so GitHub Pages (main, /docs) keeps working unchanged.
export default defineConfig({
  define: { __BUILD__: JSON.stringify(BUILD_ID) },
  base: "./",
  build: { outDir: "../docs", emptyOutDir: true, target: "es2019" },
  plugins: [
    react(),
    { name: "version-json", generateBundle() { this.emitFile({ type: "asset", fileName: "version.json", source: JSON.stringify({ build: BUILD_ID }) }); } },
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifestFilename: "manifest.webmanifest",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "Hazelwood OS",
        short_name: "Hazelwood",
        description: "An offline learning and play space for Hazel and Violet.",
        start_url: "./",
        scope: "./",
        display: "fullscreen",
        display_override: ["fullscreen", "standalone"],
        background_color: "#1e1b4b",
        theme_color: "#1e1b4b",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
