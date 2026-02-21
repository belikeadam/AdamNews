#!/usr/bin/env node
/**
 * Quick E2E verification — checks all pages return 200 and key content is present.
 * Updated for mobile-first UX overhaul (Malaysian features, animations, drawer navigation).
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'
// Use the same Strapi the app uses (production Railway by default)
const STRAPI = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adamnews-production.up.railway.app'
const LOCAL_STRAPI = 'http://localhost:1337'

let pass = 0
let fail = 0
const results = []

async function check(name, url, { status = 200, contains = [], notContains = [], method = 'GET' } = {}) {
  try {
    const res = await fetch(url, { method, redirect: 'manual' })
    const code = res.status

    if (code !== status) {
      results.push({ name, status: 'FAIL', detail: `Expected ${status}, got ${code}` })
      fail++
      return
    }

    if (contains.length > 0 || notContains.length > 0) {
      const body = await res.text()
      for (const term of contains) {
        if (!body.includes(term)) {
          results.push({ name, status: 'FAIL', detail: `Missing: "${term}"` })
          fail++
          return
        }
      }
      for (const term of notContains) {
        if (body.includes(term)) {
          results.push({ name, status: 'FAIL', detail: `Should NOT contain: "${term}"` })
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
  await check('Trending search page', `${BASE}/search?sort=trending`)
  await check('Saved page', `${BASE}/saved`)
  await check('Account page', `${BASE}/account`)
  await check('Architecture page', `${BASE}/architecture`)
  await check('API Docs page', `${BASE}/api-docs`)
  await check('Contact page', `${BASE}/contact`)
  await check('Privacy page', `${BASE}/privacy`)
  await check('Terms page', `${BASE}/terms`)
  await check('404 page', `${BASE}/nonexistent-page-xyz`, { status: 404 })

  // ── UX Overhaul Checks ──
  // Verify MobileNav is removed (no fixed bottom-0 tab bar)
  await check('No MobileNav (bottom bar removed)', `${BASE}/`, {
    notContains: ['MobileNav']
  })

  // Verify BreakingNewsBar renders on homepage
  await check('Breaking News Bar on homepage', `${BASE}/`, {
    contains: ['Trending']
  })

  // Verify viewport meta tag
  await check('Viewport meta', `${BASE}/`, { contains: ['viewport'] })

  // Verify welcome section for unauthenticated users
  await check('Welcome section on homepage', `${BASE}/`, {
    contains: ['Welcome to The Adam News']
  })

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
      const firstSlug = articles[0].attributes.slug
      await check('Article has body content', `${BASE}/articles/${firstSlug}`, {
        contains: ['prose']
      })
      // Verify WhatsApp share on article pages
      await check('WhatsApp share on article', `${BASE}/articles/${firstSlug}`, {
        contains: ['wa.me']
      })
      // Verify reading progress bar on article
      await check('Reading progress on article', `${BASE}/articles/${firstSlug}`, {
        contains: ['ReadingProgress']
      })
    }
  } catch (err) {
    results.push({ name: 'Article pages', status: 'FAIL', detail: err.message })
    fail++
  }

  // ── Malaysian Features ──
  // Prayer time API check
  try {
    const prayerRes = await fetch('https://api.waktusolat.app/v2/solat/WLY01')
    if (prayerRes.ok) {
      results.push({ name: 'Prayer Time API (JAKIM)', status: 'PASS' })
      pass++
    } else {
      results.push({ name: 'Prayer Time API (JAKIM)', status: 'FAIL', detail: `Status ${prayerRes.status}` })
      fail++
    }
  } catch (err) {
    results.push({ name: 'Prayer Time API (JAKIM)', status: 'FAIL', detail: err.message })
    fail++
  }

  // Weather API check
  try {
    const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=3.1412&longitude=101.6865&current=temperature_2m,weathercode&timezone=Asia/Kuala_Lumpur')
    if (weatherRes.ok) {
      results.push({ name: 'Weather API (Open-Meteo)', status: 'PASS' })
      pass++
    } else {
      results.push({ name: 'Weather API (Open-Meteo)', status: 'FAIL', detail: `Status ${weatherRes.status}` })
      fail++
    }
  } catch (err) {
    results.push({ name: 'Weather API (Open-Meteo)', status: 'FAIL', detail: err.message })
    fail++
  }

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
