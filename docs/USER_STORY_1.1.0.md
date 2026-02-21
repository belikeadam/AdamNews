# User Story 1.1.0 — AI-Powered News Intelligence Layer

> **Epic**: Transform Adam News from a standard news platform into an AI-augmented intelligent news experience
> **Priority**: Critical (pre-submission to REV Media Group)
> **AI Providers**: Groq LLaMA 3.3 70B (primary) + Google Gemini 2.5 Flash (fallback)
> **API Keys**: Both configured in Vercel environment
> **New Dependencies**: `@google/genai` (Google Generative AI SDK)
> **Estimated Redis Impact**: ~2,500 commands/day (well within 10,000 free tier)
> **Estimated AI Usage**: ~50-80 calls/day after caching (spread across both providers)

---

## Why This Matters

REV Media Group manages 30+ digital brands reaching 15 million Malaysians monthly. They emphasize **"using tech and data to engage the perfect audience."** This story adds an AI intelligence layer that:

1. **Directly demonstrates AI engineering skills** — the #1 differentiator in 2026
2. **Multi-model architecture** — provider-agnostic AI router with task-based model selection and automatic failover
3. **Solves real problems for a media company** — content analysis, multilingual support, editorial efficiency
4. **Uses production patterns** — caching, rate limiting, structured output, error handling, failover
5. **Costs RM 0** — everything runs on Groq + Gemini free tiers + existing Upstash Redis

---

## Architecture Overview

```
                    ┌──────────────────────────────────────────────┐
                    │           AI Intelligence Layer               │
                    │                                              │
                    │  ┌─────────────────────────────────────────┐ │
                    │  │ /api/ai/analyze     → Article Intel     │ │
                    │  │ /api/ai/translate   → BM ↔ EN          │ │
                    │  │ /api/ai/chat        → Ask Article       │ │
                    │  │ /api/ai/digest      → Morning Brief     │ │
                    │  │ /api/ai/suggest     → Editor Tools      │ │
                    │  └──────────┬──────────────────────────────┘ │
                    │             │                                 │
                    │  ┌──────────▼──────────────────────────────┐ │
                    │  │  src/lib/ai/router.ts  (AI Router)     │ │
                    │  │  ├── Task-based model selection         │ │
                    │  │  ├── Automatic failover (primary→fallback)│
                    │  │  ├── Per-provider rate limiting         │ │
                    │  │  └── Redis cache-aside (provider-agnostic)│
                    │  └───────┬─────────────────┬──────────────┘ │
                    │          │                  │                 │
                    │  ┌───────▼──────┐  ┌───────▼──────────────┐ │
                    │  │ Groq LLaMA   │  │ Gemini 2.5 Flash     │ │
                    │  │ 3.1 70B      │  │ (Google AI)          │ │
                    │  │ 30 RPM free  │  │ 10 RPM / 250 RPD    │ │
                    │  │ (primary)    │  │ (fallback + translate)│ │
                    │  └──────────────┘  └──────────────────────┘ │
                    │                                              │
                    │  ┌──────────────────────────────────────┐   │
                    │  │ Upstash Redis Cache · TTL: 6h-30d    │   │
                    │  └──────────────────────────────────────┘   │
                    └──────────────────────────────────────────────┘
```

### Smart Task-Based Routing Strategy

| Task | Primary Model | Fallback | Reason |
|------|--------------|----------|--------|
| **Analyze** | Groq LLaMA 3.3 70B | Gemini Flash | Strong summarization + reasoning |
| **Chat** | Groq LLaMA 3.3 70B | Gemini Flash | Fast + accurate Q&A |
| **Translate** | Groq LLaMA 3.3 70B | Gemini Flash | Higher rate limits + reliable JSON output |
| **Digest** | Groq LLaMA 3.3 70B | Gemini Flash | Cost optimization |
| **Suggest** | Groq LLaMA 3.3 70B | Gemini Flash | Creative headline generation |

### Routing Flow

```
API Route → AI Router
              ├── 1. Check Redis cache (provider-agnostic)
              ├── 2. Select primary model by task type
              ├── 3. Check provider rate limit
              ├── 4. Call primary provider
              ├── 5. On failure → try fallback provider
              └── 6. Cache result in Redis
```

### Caching Strategy (Critical for Free Tier Survival)

| Cache Key Pattern | TTL | Purpose |
|-------------------|-----|---------|
| `ai:analysis:{slug}` | 7 days | Article intelligence (summary, sentiment, entities) |
| `ai:translate:{slug}:{lang}` | 30 days | Translated content (rarely changes) |
| `ai:chat:{slug}:{hash}` | 24 hours | Chat Q&A responses per article |
| `ai:digest:{categories}:{dateHour}` | 6 hours | Shared morning digest by interest |
| `ai:suggest:{slug}` | 7 days | Editor headline/SEO suggestions |
| `rl:groq:{minute}` | 65 seconds | Groq rate limiter window |
| `rl:gemini:{minute}` | 65 seconds | Gemini rate limiter window |

**Golden Rule**: Never call any AI provider twice for the same content. Cache everything aggressively.

### Rate Limiting (Per-Provider)

```
Groq Free Tier: 30 RPM, 14,400 RPD (LLaMA 3.3 70B)
Our Self-Imposed: 25 RPM cap (safety margin)

Gemini Free Tier: 10 RPM, 250 RPD (Gemini 2.5 Flash)
Our Self-Imposed: 8 RPM cap (safety margin)

Rate Limit Flow:
1. Router selects provider for task
2. Check Redis key rl:{provider}:{minute}
3. If primary over limit → try fallback provider
4. If both over limit → return 429 with retry-after
5. On Redis failure → fail-open (allow request)
```

---

## Feature 1: AI Article Intelligence Panel

**User Story**: As a reader, I want to see AI-generated insights about an article (summary, key takeaways, sentiment, entities) so I can quickly understand the content and its context.

### What the Reviewer Sees

On every article page (`/articles/[slug]`), a sleek expandable panel appears below the article toolbar:

```
┌─────────────────────────────────────────────────┐
│ ✦ AI Intelligence          Powered by Gemini  ▾ │
├─────────────────────────────────────────────────┤
│                                                 │
│  "A comprehensive overview of how AI is         │
│   reshaping Malaysia's tech industry in 2026"   │
│                                                 │
│  KEY TAKEAWAYS                                  │
│  ◆ Malaysia ranks 3rd in ASEAN AI adoption      │
│  ◆ Government allocated RM500M for AI training  │
│  ◆ 40% of tech jobs now require AI skills       │
│                                                 │
│  ┌──────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │ Positive │ │ ✓ Verified   │ │ Grade 10    │ │
│  │ Sentiment│ │ Fact-Check   │ │ Readability │ │
│  └──────────┘ └──────────────┘ └─────────────┘ │
│                                                 │
│  ENTITIES                                       │
│  People: Dr. Ahmad Ibrahim, Elon Musk           │
│  Orgs: MDEC, Google Malaysia, Petronas          │
│  Places: Kuala Lumpur, Cyberjaya, Penang         │
│                                                 │
│  TOPICS                                         │
│  [AI] [Malaysia Tech] [Digital Economy]          │
│                                                 │
│  ⏱ Saves ~4 min reading time  · Cached 2h ago  │
└─────────────────────────────────────────────────┘
```

### Technical Spec

**API Route**: `POST /api/ai/analyze`

```typescript
// Request
{ slug: string, title: string, content: string }

// Response (Gemini structured JSON output)
{
  tldr: string,                    // One-sentence summary (max 30 words)
  keyTakeaways: string[],          // 3-5 bullet points
  sentiment: {
    label: "positive" | "neutral" | "negative" | "mixed",
    score: number,                 // 0.0 to 1.0
    explanation: string            // Why this sentiment
  },
  readingLevel: {
    grade: number,                 // Flesch-Kincaid grade level
    label: string                  // "Easy Read" / "Moderate" / "Advanced"
  },
  factCheck: {
    status: "verified" | "unverified" | "mixed",
    note: string                   // Brief assessment
  },
  entities: {
    people: string[],
    organizations: string[],
    locations: string[]
  },
  topics: string[],                // 3-5 topic tags
  readTimeSaved: string            // "4 min"
}
```

**Component**: `src/components/article/AIInsightsPanel.tsx`
- Expandable/collapsible with smooth animation
- Loading state with Gemini branding spinner
- Rate limit retry with countdown
- "Cached" indicator when served from Redis
- Responsive — collapses gracefully on mobile
- Respects both light and dark theme

**Files to Create/Modify**:
- `src/lib/ai/gemini.ts` — Shared Gemini client with rate limiter
- `src/app/api/ai/analyze/route.ts` — Article analysis endpoint
- `src/components/article/AIInsightsPanel.tsx` — UI component
- `src/app/articles/[slug]/page.tsx` — Wire component into article page

### Acceptance Criteria

- [ ] Panel appears on every article page below the toolbar
- [ ] Clicking expands panel and triggers API call (or shows cached result)
- [ ] Summary, key takeaways, sentiment, fact-check, entities, and topics all render
- [ ] Response is cached in Redis for 7 days per slug
- [ ] Rate limiting prevents exceeding Gemini free tier (8 req/min self-imposed cap)
- [ ] Loading spinner shows "Analyzing with Gemini..." during generation
- [ ] "Cached" badge shows when result comes from Redis
- [ ] Works in both light mode and dark mode
- [ ] Graceful fallback on Gemini API error (show "Analysis unavailable" message)

---

## Feature 2: BM ↔ EN Language Toggle

**User Story**: As a Malaysian reader, I want to read any article in Bahasa Malaysia or English so I can consume content in my preferred language.

### What the Reviewer Sees

A language toggle appears in the article toolbar:

```
READ IN  ┌────┬────┐
         │ EN │ BM │  ← Toggles entire article content
         └────┴────┘
```

Switching to BM:
- Title translates to Bahasa Malaysia
- Full article body translates
- Audio mode reads in BM voice
- A subtle "Translated by Gemini" indicator appears

### Technical Spec

**API Route**: `POST /api/ai/translate`

```typescript
// Request
{ slug: string, title: string, content: string, targetLang: "ms" | "en" }

// Response
{
  title: string,     // Translated title
  content: string,   // Translated content (preserves paragraph breaks)
  lang: "ms" | "en"
}
```

**Cache TTL**: 30 days (translations rarely need updating)

**Component**: `src/components/article/LanguageToggle.tsx`
- Inline toggle with EN/BM buttons
- Loading state while translating
- Caches translated version in component state for instant re-toggle
- Passes translated content to AudioMode and ArticleBody

### Acceptance Criteria

- [ ] Toggle appears in article toolbar area
- [ ] Clicking BM translates title + body to Bahasa Malaysia via Gemini
- [ ] Clicking EN restores original content (no API call needed)
- [ ] Translation cached in Redis for 30 days
- [ ] Audio Mode reads in Malay voice when BM is active
- [ ] Loading state shows "Translating with Gemini..."
- [ ] Handles rate limiting gracefully (retry with countdown)

---

## Feature 3: Audio Mode (Listen to Article)

**User Story**: As a reader, I want to listen to any article read aloud so I can consume news while commuting or multitasking.

### What the Reviewer Sees

A sleek audio bar appears above the article body:

```
┌─────────────────────────────────────────────────┐
│ 🎧 AUDIO MODE                                   │
│ Browser native · no API cost     [▶ Listen]     │
└─────────────────────────────────────────────────┘

When playing:
┌─────────────────────────────────────────────────┐
│ ▎▍▎▍▌ READING ALOUD              [⏸] [■]      │
│ ████████████░░░░░░░░░░░░░  48%                  │
└─────────────────────────────────────────────────┘
```

### Technical Spec

**Zero API cost** — uses Web Speech API (built into all modern browsers).

**Component**: `src/components/article/AudioMode.tsx`
- Uses `SpeechSynthesis` API (native browser)
- Play/Pause/Stop controls
- Progress bar tracking character position
- Waveform animation while playing
- Supports both English (`en-GB`) and Malay (`ms-MY`) voices
- Language-aware: reads in BM when language toggle is set to BM

### Acceptance Criteria

- [ ] Audio bar appears on every article page
- [ ] Play button starts text-to-speech reading
- [ ] Progress bar tracks reading position
- [ ] Pause/Resume/Stop buttons work correctly
- [ ] Reads in correct language (EN or BM based on toggle)
- [ ] Waveform animation plays during reading
- [ ] Gracefully hidden on browsers without Web Speech API support
- [ ] Stops reading when navigating away from page

---

## Feature 4: "Ask This Article" AI Chat

**User Story**: As a reader, I want to ask questions about an article I'm reading so I can get instant clarification without leaving the page.

### What the Reviewer Sees

A compact chat widget at the bottom of each article:

```
┌─────────────────────────────────────────────────┐
│ ✦ Ask about this article                         │
│                                                  │
│ ┌─────────────────────────────────────────┐     │
│ │ What are the main economic impacts?     │ [→] │
│ └─────────────────────────────────────────┘     │
│                                                  │
│ Suggested: "Summarize in one sentence"           │
│            "What does this mean for Malaysia?"   │
│            "Who are the key people mentioned?"   │
├─────────────────────────────────────────────────┤
│ You:  What are the main economic impacts?        │
│                                                  │
│ AI:   Based on this article, the three main     │
│       economic impacts are: (1) a projected     │
│       GDP increase of 2.3% from AI adoption...  │
│                                                  │
│       Source: Paragraph 4 of this article        │
└─────────────────────────────────────────────────┘
```

### Technical Spec

**API Route**: `POST /api/ai/chat`

```typescript
// Request
{ slug: string, title: string, content: string, question: string }

// Response (streamed for real-time typing effect)
{
  answer: string,
  sourceReference: string  // Which part of the article was used
}
```

**Key constraint**: Gemini is instructed to answer ONLY from the article content. No hallucination beyond the source material.

**Component**: `src/components/article/ArticleChat.tsx`
- Compact chat interface (not a full chatbot)
- 3 suggested questions generated from article context
- Streaming response with typewriter effect
- Cached per slug+question hash (24h TTL)
- Max 5 questions per article per session (prevent abuse)
- Collapsible to minimize visual noise

### Acceptance Criteria

- [ ] Chat widget appears at the bottom of every article page
- [ ] 3 contextual suggested questions are shown
- [ ] User can type custom questions
- [ ] Response streams with typewriter effect
- [ ] AI only answers from the article content (grounded, no hallucination)
- [ ] Responses cached in Redis for 24 hours per slug+question
- [ ] Max 5 questions per session
- [ ] Rate limiting prevents Gemini overuse
- [ ] Works in both light and dark mode

---

## Feature 5: AI-Powered Morning Digest

**User Story**: As a returning reader, I want a personalized daily briefing based on my reading interests so I can catch up on what matters to me in 2 minutes.

### What the Reviewer Sees

A new page at `/digest`:

```
┌─────────────────────────────────────────────────┐
│ SATURDAY, 22 FEBRUARY 2026 · 09:15              │
│                                                  │
│ Your Morning                                     │
│ Briefing                                         │
│                                                  │
│ Personalised for your interests                  │
│ Powered by Gemini · Updates twice daily          │
├─────────────────────────────────────────────────┤
│                                                  │
│ TODAY'S BRIEFING                                 │
│ AI Regulation Heats Up Across Southeast Asia     │
│                                                  │
│ "Malaysia's digital economy continues to gain    │
│  momentum as ASEAN nations accelerate their      │
│  AI governance frameworks..."                    │
│                                                  │
├─────────────────────────────────────────────────┤
│ TECHNOLOGY · Breaking                            │
│ Google Announces Gemini 3 with Agentic AI       │
│ New model can browse, code, and reason across    │
│ multiple steps autonomously                      │
│                                                  │
│ BUSINESS · Important                             │
│ Petronas Reports Record Q4 AI-Driven Savings    │
│ AI-optimized operations saved RM2.1B in 2025    │
│                                                  │
│ SCIENCE · Worth reading                          │
│ Malaysian Researchers Pioneer Quantum AI Chip   │
│ Breakthrough at USM could reduce AI power costs  │
├─────────────────────────────────────────────────┤
│ "Stay curious — the future belongs to those      │
│  who never stop learning."                       │
│                                                  │
│              [↻ Refresh briefing]                │
└─────────────────────────────────────────────────┘
```

### Technical Spec

- Uses `localStorage` personalization hook to track reading interests
- Fetches latest articles from Strapi
- Sends top articles + user interests to Gemini for digest generation
- Shared cache by interest categories + date-hour (multiple users with similar interests share the same digest)

### Acceptance Criteria

- [ ] `/digest` page renders with editorial design
- [ ] Shows personalized content based on reading history
- [ ] Falls back to "Read some articles first" if no history
- [ ] Digest cached for 6 hours (shared by similar interest profiles)
- [ ] Refresh button generates new digest
- [ ] Handles Gemini rate limits gracefully
- [ ] Mobile responsive with newspaper typography

---

## Feature 6: AI Editor Tools (Dashboard)

**User Story**: As an admin, I want AI-powered tools in the dashboard to help with content optimization so I can work faster and smarter.

### What the Reviewer Sees

In the admin dashboard, a new "AI Tools" section:

```
┌─────────────────────────────────────────────────┐
│ ✦ AI Editor Tools                  Gemini Flash  │
├─────────────────────────────────────────────────┤
│                                                  │
│ HEADLINE OPTIMIZER                               │
│ Current: "New AI Policy Announced"               │
│                                                  │
│ Suggestions:                                     │
│ ◆ "Malaysia's Bold AI Policy Could Transform     │
│    Southeast Asia's Tech Landscape" (93% score)  │
│ ◆ "Breaking: Government Unveils RM500M AI        │
│    Master Plan" (87% score)                      │
│ ◆ "What Malaysia's New AI Policy Means for       │
│    Your Job" (82% score)                         │
│                                                  │
│ SEO SUGGESTIONS                                  │
│ ◆ Add keyword "Malaysia AI 2026" to first para   │
│ ◆ Meta description is 45 chars (recommend 155)   │
│ ◆ Consider adding 2-3 internal links             │
│                                                  │
│ AUTO-TAGS                                        │
│ [AI] [Malaysia] [Technology Policy] [MDEC]       │
│ [Digital Economy]                                │
│                                                  │
│              [Apply Suggestions]                  │
└─────────────────────────────────────────────────┘
```

### Technical Spec

**API Route**: `POST /api/ai/suggest`

```typescript
// Request
{ slug: string, title: string, content: string, excerpt: string }

// Response
{
  headlines: Array<{ text: string, score: number, reasoning: string }>,
  seoSuggestions: string[],
  autoTags: string[],
  excerptSuggestion: string
}
```

### Acceptance Criteria

- [ ] AI Tools section appears in dashboard (admin only)
- [ ] Generates 3 alternative headlines with engagement scores
- [ ] Provides SEO improvement suggestions
- [ ] Auto-generates relevant tags
- [ ] Results cached per article slug for 7 days
- [ ] Only accessible to admin role

---

## Shared Infrastructure

### New Files to Create

```
src/
├── lib/
│   └── ai/
│       ├── router.ts             ← AI Router (task-based selection + failover)
│       ├── groq.ts               ← Groq LLaMA client (fetch-based, zero deps)
│       └── gemini.ts             ← Gemini client + rate limiter
├── app/
│   ├── api/
│   │   └── ai/
│   │       ├── analyze/route.ts   ← Article intelligence
│   │       ├── translate/route.ts ← BM ↔ EN translation
│   │       ├── chat/route.ts      ← Ask article questions
│   │       ├── digest/route.ts    ← Morning digest
│   │       └── suggest/route.ts   ← Editor AI tools
│   └── digest/
│       └── page.tsx               ← Morning digest page
├── components/
│   └── article/
│       ├── AIInsightsPanel.tsx     ← Intelligence panel
│       ├── LanguageToggle.tsx      ← BM ↔ EN switch
│       ├── AudioMode.tsx           ← Web Speech reader
│       └── ArticleChat.tsx         ← Ask article chat
├── hooks/
│   └── usePersonalization.ts      ← localStorage reading tracker
└── types/
    └── ai.ts                      ← AI response type definitions
```

### Existing Files to Modify

```
src/app/articles/[slug]/page.tsx   ← Wire in AI components
src/app/dashboard/page.tsx         ← Add AI tools section
src/app/dashboard/layout.tsx       ← Add digest nav link
src/components/layout/Navbar.tsx   ← Add digest link
```

---

## Implementation Priority (Critical Path)

| Phase | Features | Impact | Estimated Effort |
|-------|----------|--------|-----------------|
| **Phase 1** | Gemini client + AI Insights Panel | Highest — visible on every article | Core infrastructure + 1 feature |
| **Phase 2** | Language Toggle + Audio Mode | High — demonstrates multilingual AI | 2 features |
| **Phase 3** | Article Chat (streaming) | High — interactive, impressive | 1 feature |
| **Phase 4** | Morning Digest page | Medium — shows personalization | 1 feature + 1 page |
| **Phase 5** | Editor AI Tools | Medium — shows editorial thinking | 1 feature |

---

## Redis Command Budget (After AI Features)

```
10,000 commands/day total budget:

Feature              GET    SET    Other   Daily Total
──────────────────────────────────────────────────────
Existing features    1800   600    200     2,600
AI Analysis          400    20     20      440
AI Translation       150    10     10      170
AI Chat              200    30     20      250
AI Digest            100    50     10      160
AI Suggestions       50     10     5       65
AI Rate Limiting     600    600    100     1,300  (2 providers)
──────────────────────────────────────────────────────
                                   TOTAL:  4,985/day
                                   BUFFER: 5,015 spare
```

---

## Definition of Done

- [x] All 6 features implemented and functional on live site
- [x] Multi-model AI router with task-based selection and automatic failover
- [x] ARCHITECTURE.md updated with AI Intelligence Layer section
- [x] DEMO_GUIDE.md updated with AI feature walkthrough
- [x] All AI responses cached in Redis (provider-agnostic cache keys)
- [x] Per-provider rate limiting (Groq 25 RPM, Gemini 8 RPM)
- [x] Rate limiting prevents exceeding free tier limits for both providers
- [x] All features work in both light and dark mode
- [x] All features are mobile responsive
- [x] No TypeScript errors (`npx tsc --noEmit` passes)
- [x] 116 E2E tests passing
- [x] All API routes include rate limiting + input validation (Zod)

---

## What Makes This Impressive to REV Media Group

| What They Care About | What We Demonstrate |
|---------------------|---------------------|
| **"Using tech and data to engage the perfect audience"** | AI personalization, reading behavior tracking, smart digest |
| **30+ multilingual brands** | BM ↔ EN translation toggle (Gemini-powered, Malaysia-specific) |
| **Content at scale** | AI auto-analysis, auto-tagging, headline optimization for 67+ articles |
| **Editorial efficiency** | AI editor tools that generate headlines, SEO suggestions, tags |
| **Modern tech stack** | Multi-model AI (Groq LLaMA + Gemini), provider-agnostic routing, streaming, structured JSON |
| **Production readiness** | Redis caching, per-provider rate limiting, automatic failover, Zod validation |
| **Cost efficiency** | Entire AI layer runs on RM 0 (dual free tiers) with aggressive caching |
| **Senior-level architecture** | Provider-agnostic AI router with task-based model selection and failover handling |

---

## Portfolio Positioning Statement

> "Implemented a provider-agnostic AI routing layer with task-based model selection (Groq LLaMA 3.3 70B + Gemini 2.5 Flash), automatic failover handling, and Redis-backed rate limiting to ensure high availability and cost efficiency across 5 AI endpoints serving 67+ articles."

---

*User Story 1.1.0 — AI-Powered News Intelligence Layer*
*Created: February 2026*
*Updated: February 2026 (v1.1 — Multi-Model Routing)*
*Author: Mohamed Adam bin Ajmal Khan*
*Status: Implemented*
