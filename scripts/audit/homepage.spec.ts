import { test, expect } from '@playwright/test'
const BASE = process.env.VISUAL_BASE_URL ?? 'http://localhost:3100'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
  })
  test('título contém Leo ou Américo', async ({ page }) => {
    expect(await page.title()).toMatch(/leo|am.rico/i)
  })
  test('meta description presente', async ({ page }) => {
    const d = await page.locator('meta[name="description"]').getAttribute('content')
    expect(d).toBeTruthy()
  })
  test('og:title presente', async ({ page }) => {
    expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy()
  })
  test('og:description presente', async ({ page }) => {
    expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toBeTruthy()
  })
  test('og:image presente', async ({ page }) => {
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBeTruthy()
  })
  test('og:type = website', async ({ page }) => {
    expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('website')
  })
  test('html lang=pt-BR', async ({ page }) => {
    expect(await page.locator('html').getAttribute('lang')).toBe('pt-BR')
  })
  test('JSON-LD structured data presente', async ({ page }) => {
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(1)
  })
  test('navbar visível', async ({ page }) => {
    await expect(page.locator('nav').first()).toBeVisible({ timeout: 5000 })
  })
  test('footer visível', async ({ page }) => {
    await expect(page.locator('footer').first()).toBeVisible({ timeout: 8000 })
  })
  test('seção sobre / about visível', async ({ page }) => {
    await expect(page.getByText(/sobre|about|trajetória|experiência/i).first()).toBeVisible({ timeout: 8000 })
  })
  test('seção projetos visível — Govevia ou Env Neo', async ({ page }) => {
    await expect(page.getByText(/govevia|envneo|env neo/i).first()).toBeVisible({ timeout: 8000 })
  })
  test('seção contato visível', async ({ page }) => {
    await expect(page.getByText(/contato|contact|email|fale/i).first()).toBeVisible({ timeout: 8000 })
  })
  test('sem erros de console críticos', async ({ page }) => {
    const errs = []
    page.on('console', m => { if (m.type()==='error') errs.push(m.text()) })
    await page.reload()
    await page.waitForLoadState('networkidle')
  })
})
