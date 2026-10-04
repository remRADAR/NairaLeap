import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "4173-i9ccwwa57g0etaw0pjjfh-20dedd73.us4.manus.computer",
      "4173-ikesg3ji8mrwejzj11gup-de54a4f3.us4.manus.computer",
      "4173-it2pzhryhsqflzj6tzv2e-5c122d06.us4.manus.computer",
    ],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    nitro({ defaultPreset: "cloudflare-module" }),
    react(),
  ],
});
