import { test, expect } from '@playwright/test'
const BASE = process.env.VISUAL_BASE_URL ?? 'http://localhost:3100'

test.describe('Robots & Meta', () => {
  test('robots.txt HTTP 200', async ({ request }) => {
    expect((await request.get(BASE + '/robots.txt')).status()).toBe(200)
  })
  test('robots.txt content-type text/plain', async ({ request }) => {
    expect((await request.get(BASE + '/robots.txt')).headers()['content-type'] ?? '').toContain('text/plain')
  })
  test('robots.txt Disallow /ceo/ gate I2', async ({ request }) => {
    expect(await (await request.get(BASE + '/robots.txt')).text()).toContain('Disallow: /ceo/')
  })
  test('robots.txt Disallow /api/ceo/', async ({ request }) => {
    expect(await (await request.get(BASE + '/robots.txt')).text()).toContain('Disallow: /api/ceo/')
  })
  test('robots.txt tem User-agent', async ({ request }) => {
    expect(await (await request.get(BASE + '/robots.txt')).text()).toContain('User-agent:')
  })
  test('robots.txt tem Sitemap', async ({ request }) => {
    expect((await (await request.get(BASE + '/robots.txt')).text()).toLowerCase()).toContain('sitemap:')
  })
  test('página principal sem meta noindex', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('domcontentloaded')
    expect(await page.locator('meta[name="robots"][content*="noindex"]').count()).toBe(0)
  })
  test('404 retorna status 404', async ({ request }) => {
    expect((await request.get(BASE + '/rota-xyz-inexistente-abc-999')).status()).toBe(404)
  })
})
