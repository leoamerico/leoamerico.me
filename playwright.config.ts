// playwright.config.ts
// ──────────────────────────────────────────────────────────────────────────
// FERRAMENTA OFICIAL DE VISUAL AUDIT — Env Neo Brand System
// Proibido substituir por Cypress, Puppeteer ou qualquer outra ferramenta.
// Machina custodit. Homo gubernat.
// ──────────────────────────────────────────────────────────────────────────
import { defineConfig } from "@playwright/test";

export default defineConfig({
  // Diretório de testes (se algum teste unitário for adicionado no futuro)
  testDir: "./scripts/audit",
  testMatch: "**/*.spec.ts",

  // Reporter — gera relatório HTML nativo do Playwright para testes spec
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/playwright-html", open: "never" }],
  ],

  // Timeout conservador para CI/CD
  timeout: 60_000,

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
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "light",
      use: {
        colorScheme:       "light",
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: "system",
      use: {
        // Sem forçar colorScheme — usa preferência real do ambiente de execução
        viewport:          { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
  ],

  // Pasta de outputs
  outputDir: "reports/playwright-artifacts",
});
