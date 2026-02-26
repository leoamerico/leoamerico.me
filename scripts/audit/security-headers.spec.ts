import { test, expect } from '@playwright/test'
const BASE = process.env.VISUAL_BASE_URL ?? 'http://localhost:3100'

test.describe('Security Headers', () => {
  test('HSTS max-age=63072000 includeSubDomains preload', async ({ request }) => {
    const h = (await request.get(BASE)).headers()['strict-transport-security'] ?? ''
    expect(h).toContain('max-age=63072000')
    expect(h).toContain('includeSubDomains')
    expect(h).toContain('preload')
  })
  test('X-Frame-Options DENY', async ({ request }) => {
    expect(((await request.get(BASE)).headers()['x-frame-options'] ?? '').toUpperCase()).toBe('DENY')
  })
  test('X-Content-Type-Options nosniff', async ({ request }) => {
    expect((await request.get(BASE)).headers()['x-content-type-options']).toBe('nosniff')
  })
  test('X-XSS-Protection 1 mode=block', async ({ request }) => {
    const v = (await request.get(BASE)).headers()['x-xss-protection'] ?? ''
    expect(v).toContain('1')
    expect(v).toContain('mode=block')
  })
  test('Referrer-Policy strict-origin-when-cross-origin', async ({ request }) => {
    expect((await request.get(BASE)).headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })
  test('Permissions-Policy geolocation camera microphone', async ({ request }) => {
    const pp = (await request.get(BASE)).headers()['permissions-policy'] ?? ''
    expect(pp).toContain('geolocation=()')
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
  })
  test('CSP presente', async ({ request }) => {
    expect(((await request.get(BASE)).headers()['content-security-policy'] ?? '').length).toBeGreaterThan(20)
  })
  test('CSP frame-ancestors none', async ({ request }) => {
    expect((await request.get(BASE)).headers()['content-security-policy'] ?? '').toContain("frame-ancestors 'none'")
  })
  test('CSP object-src none', async ({ request }) => {
    expect((await request.get(BASE)).headers()['content-security-policy'] ?? '').toContain("object-src 'none'")
  })
  test('CSP default-src self', async ({ request }) => {
    expect((await request.get(BASE)).headers()['content-security-policy'] ?? '').toContain("default-src 'self'")
  })
  test('CSP connect-src api.github.com', async ({ request }) => {
    expect((await request.get(BASE)).headers()['content-security-policy'] ?? '').toContain('https://api.github.com')
  })
  test('Sem X-Powered-By gate E1', async ({ request }) => {
    expect((await request.get(BASE)).headers()['x-powered-by']).toBeUndefined()
  })
})
