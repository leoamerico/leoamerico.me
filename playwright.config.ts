// playwright.config.ts
// ──────────────────────────────────────────────────────────────────────────
// FERRAMENTA OFICIAL DE VISUAL AUDIT — Env Neo Brand System
// Proibido substituir por Cypress, Puppeteer ou qualquer outra ferramenta.
// Machina custodit. Homo gubernat.
// ──────────────────────────────────────────────────────────────────────────
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./scripts/audit",
  testMatch: "**/*.spec.ts",
  snapshotDir: "./tests/__snapshots__",

  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/playwright-html", open: "never" }],
  ],

  timeout: 60_000,

  webServer: {
    command: "bun run build && bun run start -- -p 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },

  use: {
    // Ferramenta canônica: Chromium
    // Não adicionar Firefox ou WebKit sem aprovação de arquitetura
    channel: "chromium",

    baseURL: process.env.VISUAL_BASE_URL || "http://localhost:3100",

    // Screenshot em falha automático
    screenshot: "on",
    video:      "retain-on-failure",
    trace:      "retain-on-failure",

    // Viewport padrão brand — 1440×900 @ 2x (retina)
    viewport:          { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  },

  // Projetos de tema — espelha os 3 temas do visual-audit.mjs
  projects: [
    {
      name: "dark",
      use: {
        colorScheme:       "dark",
        reducedMotion:     "reduce",
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "light",
      use: {
        colorScheme:       "light",
        reducedMotion:     "reduce",
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "system",
      use: {
        colorScheme:       "no-preference",
        reducedMotion:     "reduce",
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
  ],

  // Pasta de outputs
  outputDir: "reports/playwright-artifacts",
});
