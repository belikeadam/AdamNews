# User Story 1.2.0 — AI Premium Content Gating

> **Epic**: Ensure AI features respect the subscription paywall on premium articles
> **Priority**: High (pre-submission to REV Media Group)
> **Depends On**: User Story 1.1.0 (AI-Powered News Intelligence Layer)
> **Breaking Changes**: None — free article AI features remain fully available
> **New Files**: 0 (all changes in existing files)
> **Estimated Effort**: ~70 lines across 6 files

---

## Why This Matters

User Story 1.1.0 implemented a full AI intelligence layer (analysis, translation, audio, chat) across all articles. However, these AI features currently appear on **every article including premium ones**, allowing free users to:

- Get AI summaries of paywalled content
- Translate premium articles to Bahasa Malaysia
- Listen to premium article content via Audio Mode
- Ask AI questions and extract premium content through chat

This defeats the purpose of the subscription paywall. A production media company like REV Media Group would never ship AI features that leak premium content to non-paying users.

**This story ensures AI features respect the pay gate** — demonstrating production-grade access control thinking.

---

## The Problem

```
CURRENT BEHAVIOR (broken):

Free User → Premium Article
  ├── Article body: ✓ Truncated + PaywallGate (correct)
  ├── AI Analysis:  ✗ Full summary, sentiment, entities (LEAKS CONTENT)
  ├── Translation:  ✗ Full BM translation available (LEAKS CONTENT)
  ├── Audio Mode:   ✗ Reads full article aloud (LEAKS CONTENT)
  └── Ask AI:       ✗ Can extract content via questions (LEAKS CONTENT)

Root cause: Server component sends full article body (6000 chars) to AI
components regardless of user's subscription status.
```

---

## The Solution

```
DESIRED BEHAVIOR (after this story):

Free User → Free Article
  ├── Article body: ✓ Full content visible
  ├── AI Analysis:  ✓ Available to everyone
  ├── Translation:  ✓ Available to everyone
  ├── Audio Mode:   ✓ Available to everyone
  └── Ask AI:       ✓ Available to everyone

Free User → Premium Article
  ├── Article body: ✓ Truncated + PaywallGate
  ├── AI Features:  ✓ Locked panel with upgrade CTA (body NOT sent)
  └── No content leaks through any AI channel

Paid User → Premium Article
  ├── Article body: ✓ Full content visible
  ├── AI Analysis:  ✓ Fully unlocked
  ├── Translation:  ✓ Fully unlocked
  ├── Audio Mode:   ✓ Fully unlocked
  └── Ask AI:       ✓ Fully unlocked
```

---

## Architecture: Server-Side Content Gating

The security boundary is enforced at the **server component level**, not the API level. This is the correct approach because:

1. The article body is simply never sent to the client for gated users
2. Even if someone inspects the page source, `body` is an empty string
3. AI API routes don't need auth checks — they never receive premium content from unauthorized users
4. Zero overhead — no extra API middleware, no session lookups in every AI route

```
Article Page (Server Component)
  │
  ├── Already computes: session, userPlan, hasAccess (lines 93-96)
  │
  ├── premium && !hasAccess?
  │     YES → body = '' (empty string), isPremium=true, hasAccess=false
  │     NO  → body = full 6000 chars, isPremium=false or hasAccess=true
  │
  └── Passes to AIArticleFeatures (Client Component)
        │
        ├── isPremium && !hasAccess?
        │     YES → Render <AIFeaturesLocked /> (upgrade CTA, zero API calls)
        │     NO  → Render real AI components with body content
        │
        └── Done. No content ever reaches AI for gated users.
```

---

## Feature 1: AI Features Locked Panel

**User Story**: As a free user viewing a premium article, I want to see that AI features exist but are locked, so I understand the value of upgrading.

### What the User Sees

On premium articles without subscription access:

```
┌─────────────────────────────────────────────────┐
│ [AI] AI Features                           🔒   │
│       PREMIUM CONTENT                            │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ ✦ AI Analysis    │  │ 🌐 Translation       │ │
│  │ Summary,         │  │ English to Bahasa    │ │
│  │ sentiment,       │  │ Malaysia             │ │
│  │ entities         │  │                      │ │
│  └──────────────────┘  └──────────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────┐ │
│  │ 🎧 Audio Mode    │  │ 💬 Ask AI            │ │
│  │ Listen to        │  │ Chat about this      │ │
│  │ article aloud    │  │ article              │ │
│  └──────────────────┘  └──────────────────────┘ │
│        (all shown at 50% opacity — teaser)       │
│                                                  │
│  Upgrade to unlock AI-powered analysis,          │
│  translation, audio, and chat for premium        │
│  articles.                                       │
│                                                  │
│              [★ Upgrade Plan]                    │
│                                                  │
│  Already subscribed? Sign in to access.          │
└─────────────────────────────────────────────────┘
```

### Technical Spec

**Component**: Inline `AIFeaturesLocked` in `src/components/article/AIArticleFeatures.tsx`
- Matches design language of existing `AIInsightsPanel` header (AI badge, same spacing)
- Lock icon SVG reused from `PaywallGate.tsx`
- 2x2 feature preview grid at `opacity-50`
- "Upgrade Plan" CTA links to `/plans`
- "Already subscribed? Sign in" mirrors `PaywallGate` pattern
- Uses existing CSS variables (`--accent`, `--surface`, `--border`, `--text`, `--muted`)
- No new dependencies

**Files to Modify**:
- `src/components/article/AIArticleFeatures.tsx` — Add locked component + gating logic
- `src/app/articles/[slug]/page.tsx` — Pass `isPremium`/`hasAccess` props + empty body

### Acceptance Criteria

- [ ] Premium articles show locked AI panel for free/unauthenticated users
- [ ] Article body is NOT sent to AI components for gated users (empty string)
- [ ] Locked panel shows all 4 AI feature names at reduced opacity
- [ ] "Upgrade Plan" button links to `/plans`
- [ ] "Sign in" link links to `/login`
- [ ] Works in both light and dark mode
- [ ] Free articles still show all AI features for everyone (no regression)
- [ ] Paid users (standard/premium) see full AI features on premium articles

---

## Feature 2: Homepage AI Showcase Upgrade CTA

**User Story**: As a visitor browsing the homepage, I want to know that AI features are available on free articles and that premium articles require a subscription.

### What Changes

The existing AI Showcase component on the homepage gets a subtle footer row:

```
┌─────────────────────────────────────────────────┐
│ [AI] POWERED BY GROQ LLAMA + GEMINI FLASH       │
├─────────────────────────────────────────────────┤
│ [AI Analysis] [Translation] [AI Digest] [Ask AI] │
├─────────────────────────────────────────────────┤
│ AI features available on     Upgrade for premium │
│ all free articles            article AI →        │
└─────────────────────────────────────────────────┘
                                    ↑ NEW footer
```

### Technical Spec

**File to Modify**: `src/components/home/AIShowcase.tsx`
- Add a `<div>` footer row after the feature grid
- Left: muted text "AI features available on all free articles"
- Right: accent-colored link "Upgrade for premium article AI →" to `/plans`
- Styled at `0.6rem` to be subtle, not dominant

### Acceptance Criteria

- [ ] Footer row appears below the AI feature cards
- [ ] Left text is muted, right link is accent-colored
- [ ] Link navigates to `/plans`
- [ ] Responsive — stacks on mobile if needed

---

## Feature 3: AI Features in Plan Pricing

**User Story**: As a potential subscriber viewing the plans page, I want to see AI features listed as a benefit so I understand what I'm paying for.

### What Changes

| Plan | Current Features | New Feature Added |
|------|-----------------|-------------------|
| **Free** | 5 articles/month, Breaking news alerts, Newsletter | + `AI features on free articles` |
| **Standard** | Unlimited articles, No ads, Offline reading, Priority support | + `AI features on all articles` |
| **Premium** | Everything in Standard, Exclusive reports, Weekly briefing, API access | + `AI features on all articles` |

### Technical Spec

**File to Modify**: `src/constants/plans.ts`
- Add one string to each plan's `features` array
- Plans page auto-renders these — no UI code changes needed

### Acceptance Criteria

- [ ] Free plan shows "AI features on free articles"
- [ ] Standard plan shows "AI features on all articles"
- [ ] Premium plan shows "AI features on all articles"
- [ ] Plans page renders correctly with the new feature lines

---

## Feature 4: Documentation Updates

### DEMO_GUIDE_AI_SECTION.md

Add **Section 9.7: AI Premium Gating** with walkthrough:
1. Open premium article while logged out → see locked AI panel
2. Sign in as admin (premium plan) → AI features unlocked
3. Open free article → AI available to everyone

Add row to AI Requirements Coverage table:
| **Premium Gating** | AI features locked on premium articles for free users; body not sent to client | Locked panel on premium article when logged out |

### ARCHITECTURE_AI_SECTION.md

- Update API Routes table Auth column: "Public" → "Public (content gated at component level)"
- Add "Premium Gating" paragraph explaining server-side content gating strategy under Section 21 overview

### Acceptance Criteria

- [ ] Demo guide includes Section 9.7 with clear walkthrough
- [ ] Architecture doc explains the server-side gating strategy
- [ ] API routes table reflects the content-level gating approach

---

## Files Changed Summary

| # | File | Change Type | Lines Changed |
|---|------|-------------|---------------|
| 1 | `src/app/articles/[slug]/page.tsx` | Modify | ~3 lines (props + body guard) |
| 2 | `src/components/article/AIArticleFeatures.tsx` | Modify | ~45 lines (locked component + gating) |
| 3 | `src/components/home/AIShowcase.tsx` | Modify | ~6 lines (footer row) |
| 4 | `src/constants/plans.ts` | Modify | 3 lines (feature strings) |
| 5 | `docs/DEMO_GUIDE_AI_SECTION.md` | Modify | ~20 lines (section 9.7 + table row) |
| 6 | `docs/ARCHITECTURE_AI_SECTION.md` | Modify | ~15 lines (gating paragraph + table update) |

**New files**: 0
**New dependencies**: 0
**Breaking changes**: 0

---

## Testing Matrix

| Scenario | Article Type | User | Expected AI Behavior |
|----------|-------------|------|---------------------|
| 1 | Free | Unauthenticated | All AI features visible and functional |
| 2 | Free | Free plan (`reader@AdamNews.com`) | All AI features visible and functional |
| 3 | Free | Premium plan (`admin@AdamNews.com`) | All AI features visible and functional |
| 4 | Premium | Unauthenticated | AIFeaturesLocked panel, no AI components |
| 5 | Premium | Free plan (`reader@AdamNews.com`) | AIFeaturesLocked panel, no AI components |
| 6 | Premium | Premium plan (`admin@AdamNews.com`) | All AI features visible and functional |

**Verification**: `npx tsc --noEmit` passes with zero errors.

---

## Definition of Done

- [ ] AI features locked on premium articles for free/unauthenticated users
- [ ] Article body never sent to AI components for gated users
- [ ] Locked panel matches design system (CSS variables, dark mode)
- [ ] Plans page lists AI features for each tier
- [ ] Homepage AI showcase includes subtle upgrade CTA
- [ ] DEMO_GUIDE updated with Section 9.7
- [ ] ARCHITECTURE doc updated with gating strategy
- [ ] All 6 test scenarios pass
- [ ] No TypeScript errors
- [ ] No regression on free article AI features

---

## What This Demonstrates to REV Media Group

| What They Care About | What This Shows |
|---------------------|-----------------|
| **Content monetization** | AI features respect the paywall — premium content stays premium |
| **Production thinking** | Server-side content gating, not just UI hiding |
| **User experience** | Locked panel teases AI features → drives upgrades |
| **Security awareness** | Body never reaches client for gated users — can't be extracted |
| **Subscription value** | Plans page clearly communicates AI as a premium benefit |

---

*User Story 1.2.0 — AI Premium Content Gating*
*Created: February 2026*
*Depends On: User Story 1.1.0 (AI-Powered News Intelligence Layer)*
*Author: Mohamed Adam bin Ajmal Khan*
*Status: In Progress*
