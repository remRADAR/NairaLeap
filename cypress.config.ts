import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:8091",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    defaultCommandTimeout: 10_000,
    pageLoadTimeout: 30_000,
    requestTimeout: 10_000,
    retries: {
      openMode: 0,
      runMode: 2,
    },
    video: false,
    viewportWidth: 1280,
    viewportHeight: 900,
  },
});
