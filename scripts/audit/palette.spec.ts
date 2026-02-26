// scripts/audit/palette.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// Regressão visual por componente — paleta × 3 temas (dark / light / system)
//
// Como funciona:
//   1. Navega para /__visual/components (harness interno)
//   2. Stub de /api/control-plane (elimina variação de dados ao vivo)
//   3. Screenshot por componente → baseline armazenado em tests/__snapshots__
//   Em falha: Playwright gera actual + diff automaticamente em test-results/
//
// Comandos:
//   npx playwright test --grep palette               → roda os testes
//   npx playwright test --grep palette --update-snapshots → atualiza baselines
// ─────────────────────────────────────────────────────────────────────────────
import { test, expect, Page } from "@playwright/test";

// ─── Fixture determinística para ControlPlane ─────────────────────────────
// Congela os dados para eliminar variação por GitHub API / rate limit.
// Atualize aqui quando aprovar uma mudança de layout do componente.
const CONTROL_PLANE_FIXTURE = {
  generatedAt: "2026-02-26T00:00:00.000Z",
  totals: {
    enforcements: 19,
    adrs: 231,
    migrations: 27,
    invariants: 4,
    ciGates: 4,
    worlds: 3,
  },
  byMechanism: [
    { label: "ArchUnit (build)",      count: 3, color: "cyan"    },
    { label: "DB Trigger (runtime)",  count: 3, color: "emerald" },
    { label: "GitHub Actions",        count: 2, color: "violet"  },
    { label: "Runtime Guard",         count: 3, color: "amber"   },
    { label: "Script CI Gate",        count: 2, color: "cyan"    },
    { label: "ADR + PR Review",       count: 6, color: "emerald" },
  ],
  adrStatus: [
    { label: "Accepted/Active", count: 171, color: "emerald" },
    { label: "Archived",        count: 53,  color: "slate"   },
    { label: "Deprecated",      count: 4,   color: "amber"   },
    { label: "Draft",           count: 3,   color: "violet"  },
  ],
  invariants: [
    { id: "INV-1", label: "Row-Level Security (RLS)",       adr: "ADR-021" },
    { id: "INV-3", label: "Rollback declarado",             adr: "ADR-015" },
    { id: "INV-5", label: "Classificação LGPD",             adr: "ADR-014" },
    { id: "INV-7", label: "Append-Only (evidence tables)",  adr: "ADR-036" },
  ],
  metaEnforcements: [
    { id: "E-META-1", label: "Singularidade de Autoridade"  },
    { id: "E-META-2", label: "Gates CI-Verificáveis"        },
    { id: "E-META-3", label: "DAG GRP → ERP → ESA"         },
    { id: "E-META-4", label: "truth_source obrigatório"     },
    { id: "E-META-5", label: "Append-Only por Default"      },
    { id: "E-META-6", label: "Rastreabilidade ADR ↔ Código" },
  ],
};

// ─── Todos os componentes cobertos pelo harness ────────────────────────────
const COMPONENTS = [
  { testId: "cmp-navbar",         name: "navbar"         },
  { testId: "cmp-hero",           name: "hero"           },
  { testId: "cmp-about",          name: "about"          },
  { testId: "cmp-expertise",      name: "expertise"      },
  { testId: "cmp-stack",          name: "stack"          },
  { testId: "cmp-projects",       name: "projects"       },
  { testId: "cmp-goveia-stats",   name: "goveia-stats"   },
  { testId: "cmp-control-plane",  name: "control-plane"  },
  { testId: "cmp-certifications", name: "certifications" },
  { testId: "cmp-diploma",        name: "diploma"        },
  { testId: "cmp-contact",        name: "contact"        },
  { testId: "cmp-footer",         name: "footer"         },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

async function stubControlPlaneApi(page: Page) {
  await page.route("**/api/control-plane", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CONTROL_PLANE_FIXTURE),
    });
  });
}

async function waitForStableRender(page: Page) {
  // Aguarda fontes web e 1 frame de settle (~150 ms)
  await page
    .waitForFunction(
      () => (document as unknown as { fonts: { status: string } }).fonts?.status === "loaded",
      { timeout: 15_000 }
    )
    .catch(() => {
      /* fontes já carregadas ou não disponíveis — continua */
    });
  await page.waitForTimeout(200);
}

// ─── Testes — executados por projeto (dark / light / system) ──────────────
// O nome do projeto (theme) é injetado pelo playwright.config.ts como
// `testInfo.project.name`, o que torna o snapshot único por tema.

test.describe("palette — regressão visual por componente", () => {

  test.beforeEach(async ({ page }) => {
    await stubControlPlaneApi(page);

    const BASE = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";
    await page.goto(`${BASE}/__visual/components`, { waitUntil: "domcontentloaded" });
    await waitForStableRender(page);
  });

  // ── Um teste por componente ──────────────────────────────────────────────
  for (const cmp of COMPONENTS) {
    test(`${cmp.name}`, async ({ page }, testInfo) => {
      const theme = testInfo.project.name; // "dark" | "light" | "system"
      const locator = page.getByTestId(cmp.testId);

      await expect(locator).toBeVisible({ timeout: 10_000 });

      // Scroll para garantir que o componente está no viewport
      await locator.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80); // settle após scroll

      await expect(locator).toHaveScreenshot(
        `palette-${theme}-${cmp.name}.png`,
        {
          animations: "disabled",
          maxDiffPixelRatio: 0.005, // 0.5% — paleta muda → falha com diff
        }
      );
    });
  }

  // ── Página inteira como prova de contexto ─────────────────────────────
  test("full-page", async ({ page }, testInfo) => {
    const theme = testInfo.project.name;
    await expect(page).toHaveScreenshot(`palette-${theme}-full.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.005,
    });
  });
});
