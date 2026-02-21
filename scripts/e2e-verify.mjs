#!/usr/bin/env node
/**
 * Quick E2E verification — checks all pages return 200 and key content is present.
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'
// Use the same Strapi the app uses (production Railway by default)
const STRAPI = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adamnews-production.up.railway.app'
const LOCAL_STRAPI = 'http://localhost:1337'

let pass = 0
let fail = 0
const results = []

async function check(name, url, { status = 200, contains = [], method = 'GET' } = {}) {
  try {
    const res = await fetch(url, { method, redirect: 'manual' })
    const code = res.status

    if (code !== status) {
      results.push({ name, status: 'FAIL', detail: `Expected ${status}, got ${code}` })
      fail++
      return
    }

    if (contains.length > 0) {
      const body = await res.text()
      for (const term of contains) {
        if (!body.includes(term)) {
          results.push({ name, status: 'FAIL', detail: `Missing: "${term}"` })
          fail++
          return
        }
      }
    }

    results.push({ name, status: 'PASS' })
    pass++
  } catch (err) {
    results.push({ name, status: 'FAIL', detail: err.message })
    fail++
  }
}

async function run() {
  console.log(`\n  E2E Verification — ${BASE}\n`)

  // ── Pages ──
  await check('Homepage', `${BASE}/`, { contains: ['THE ADAM NEWS'] })
  await check('Login page', `${BASE}/login`, { contains: ['Welcome back'] })
  await check('Plans page', `${BASE}/plans`, { contains: ['Choose your plan'] })
  await check('Search page', `${BASE}/search`, { contains: ['Search'] })
  await check('Saved page', `${BASE}/saved`)
  await check('Account page', `${BASE}/account`)
  await check('Architecture page', `${BASE}/architecture`)
  await check('API Docs page', `${BASE}/api-docs`)
  await check('Contact page', `${BASE}/contact`)
  await check('Privacy page', `${BASE}/privacy`)
  await check('Terms page', `${BASE}/terms`)
  await check('404 page', `${BASE}/nonexistent-page-xyz`, { status: 404 })

  // ── API Routes ──
  await check('Auth API', `${BASE}/api/auth/providers`)
  // Stripe POST without session redirects (307) to login — that's correct behavior
  await check('Stripe checkout (unauthenticated)', `${BASE}/api/stripe/checkout`, { method: 'POST', status: 307 })

  // ── Strapi (production — used by the app) ──
  await check('Strapi health', `${STRAPI}/api/articles?pagination%5BpageSize%5D=1`)
  await check('Strapi categories', `${STRAPI}/api/categories`)
  // ── Local Strapi (Docker) ──
  await check('Local Strapi health', `${LOCAL_STRAPI}/api/articles?pagination%5BpageSize%5D=1`)

  // ── Article pages (fetch first article slug from Strapi) ──
  try {
    const res = await fetch(`${STRAPI}/api/articles?pagination%5BpageSize%5D=3&populate=*`)
    const data = await res.json()
    const articles = data.data || []
    for (const article of articles) {
      const slug = article.attributes?.slug
      if (slug) {
        await check(`Article: ${slug}`, `${BASE}/articles/${slug}`, { contains: ['<article'] })
      }
    }
    if (articles.length > 0) {
      await check('Article has body content', `${BASE}/articles/${articles[0].attributes.slug}`, {
        contains: ['prose']
      })
    }
  } catch (err) {
    results.push({ name: 'Article pages', status: 'FAIL', detail: err.message })
    fail++
  }

  // ── Responsive meta tags ──
  await check('Viewport meta', `${BASE}/`, { contains: ['viewport'] })

  // ── Print results ──
  console.log('  ' + '─'.repeat(60))
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✓' : '✗'
    const color = r.status === 'PASS' ? '\x1b[32m' : '\x1b[31m'
    const detail = r.detail ? ` — ${r.detail}` : ''
    console.log(`  ${color}${icon}\x1b[0m ${r.name}${detail}`)
  }
  console.log('  ' + '─'.repeat(60))
  console.log(`\n  Results: ${pass} PASS, ${fail} FAIL (${results.length} total)`)
  console.log(`  Pass rate: ${((pass / results.length) * 100).toFixed(1)}%\n`)

  process.exit(fail > 0 ? 1 : 0)
}

run()
