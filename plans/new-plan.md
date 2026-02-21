# 🚀 Adam News — FINAL MVP v2.0
### Complete AI-Powered Malaysian News Platform | 100% Free Tier
#### Features: AI Summary · Short Videos · Audio Mode · BM/EN Toggle · Personalised Feed · Focus Mode · WhatsApp Share · Morning Digest · Campaign Microsites · Fact-Check Badge

---

## 📐 Final Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                       │
│                                                                          │
│  Next.js 16 App Router (React 19 · TypeScript · Tailwind v4)           │
│                                                                          │
│  Pages:                          New Features:                          │
│  ├── / (Home — personalised)     ├── AI Summary Card                   │
│  ├── /articles/[slug]            ├── Audio Mode (Web Speech API)        │
│  ├── /shorts                     ├── BM ↔ EN Language Toggle            │
│  ├── /my-digest                  ├── Focus Reading Mode                 │
│  ├── /campaign/[slug]            ├── WhatsApp Share + TL;DR             │
│  └── /subscribe                  ├── Personalised Feed                  │
│                                  ├── Morning Digest                     │
│                                  └── Fact-Check Badge                   │
└──────────────┬──────────────────────────────────────────────────────────┘
               │ fetch / API Routes
               ▼
┌──────────────────────┐     ┌────────────────────────────────────────────┐
│   Vercel (Free)      │     │  Upstash Redis (Free — 10k cmd/day)        │
│   ├── SSR / ISR      │     │                                            │
│   ├── Edge CDN       │     │  Cache Keys:                               │
│   └── API Routes:   │     │  summary:{slug}          TTL: 7d           │
│       /api/summarize │     │  translate:{slug}:{lang} TTL: 30d          │
│       /api/translate │     │  digest:{userId}         TTL: 6h           │
│       /api/digest    │     │  factcheck:{slug}        TTL: 7d           │
│       /api/factcheck │     │  ratelimit:gemini:{min}  TTL: 65s          │
│       /api/revalidate│     │  views:{slug}            TTL: 24h          │
└──────────┬───────────┘     └────────────────────────────────────────────┘
           │
     ┌─────┴──────────────┐
     │                    │
     ▼                    ▼
┌──────────────┐   ┌──────────────────────┐   ┌──────────────────────────┐
│  Strapi v4   │   │  Supabase (Free)     │   │  Cloudinary (Free)       │
│  Railway     │   │  PostgreSQL 500MB    │   │  25GB video/image        │
│  (CMS only,  │   │  (Strapi database)   │   │  hosting for Shorts      │
│  no DB)      │   └──────────────────────┘   └──────────────────────────┘
└──────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Google Gemini 2.0 Flash (Free)      │
│  15 req/min · 1M tokens/day          │
│                                      │
│  Used for:                           │
│  ├── Article summarisation           │
│  ├── BM ↔ EN translation            │
│  ├── Morning digest generation       │
│  └── Fact-check scanning            │
└──────────────────────────────────────┘
```

---

## 🆓 Free Tier Budget — Full Feature Set

| Service | Limit | Our Daily Usage | Safety Margin |
|---------|-------|----------------|---------------|
| **Vercel** | 100GB bandwidth/mo | ~300MB/day | ✅ 90% under |
| **Upstash Redis** | 10,000 cmd/day | ~3,500/day | ✅ 65% under |
| **Supabase** | 500MB DB | ~80MB | ✅ 84% under |
| **Railway** | $5 credit/mo | Strapi only ~$3 | ✅ Under |
| **Cloudinary** | 25GB storage | ~2GB videos | ✅ 92% under |
| **Gemini API** | 15 req/min, 1M tok/day | ~80 req/day cached | ✅ 99% under |
| **Web Speech API** | Browser-native | Free, no limits | ✅ Infinite |
| **Stripe** | Free test mode | Portfolio only | ✅ Free |

### 🧮 Redis Command Budget Breakdown

```
10,000 commands/day total budget:

Feature              GET    SET    Other   Daily Total
─────────────────────────────────────────────────────
AI Summary           400    20     20      440
Translation          150    10     10      170
Morning Digest       100    50     10      160
Fact Check           200    15     15      230
Rate Limiting        500    500    100     1,100
View Counters        800    400    50      1,250
Session/Auth cache   300    200    50      550
                                   ─────────────────
                                   TOTAL:  3,900/day
                                   BUFFER: 6,100 spare
```

**The golden rule: Cache everything for as long as possible. Summaries = 7 days. Translations = 30 days. Never call Gemini twice for the same content.**

---

## 🤖 Feature 1: AI Summary + Fact-Check Badge

### File: `src/app/api/summarize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days
const RATE_LIMIT_MAX = 12; // stay under 15/min free cap

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 }
      })
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function checkRateLimit(): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60000);
  const key = `ratelimit:gemini:${minute}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 65);
  return count <= RATE_LIMIT_MAX;
}

export async function POST(req: NextRequest) {
  const { slug, content, title } = await req.json();
  if (!slug || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  // Check cache
  const cacheKey = `summary:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json({ data: cached, cached: true });

  // Rate limit check
  const allowed = await checkRateLimit();
  if (!allowed) return NextResponse.json({ queued: true }, { status: 429 });

  const prompt = `You are a senior Malaysian news editor. Analyse this article and respond ONLY with valid JSON (no markdown backticks):

Title: ${title}
Content: ${content.slice(0, 4000)}

{
  "tldr": "One sentence summary under 25 words",
  "keyPoints": ["point 1 max 15 words", "point 2 max 15 words", "point 3 max 15 words"],
  "sentiment": "positive|neutral|negative|mixed",
  "readTimeSaved": "X min",
  "factCheckStatus": "verified|unverified|disputed",
  "factCheckNote": "Brief note on source quality or any unverified claims (max 20 words)",
  "sourcesCount": 0,
  "malayKeyword": "Most important keyword in Bahasa Malaysia"
}`;

  const raw = await callGemini(prompt);
  let data: any;
  try {
    data = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    data = {
      tldr: 'Summary unavailable.',
      keyPoints: [],
      sentiment: 'neutral',
      readTimeSaved: '2 min',
      factCheckStatus: 'unverified',
      factCheckNote: 'Unable to verify sources automatically.',
      sourcesCount: 0,
      malayKeyword: ''
    };
  }

  await redis.set(cacheKey, data, { ex: CACHE_TTL });
  return NextResponse.json({ data, cached: false });
}
```

### Component: `src/components/article/AISummaryCard.tsx`

```tsx
'use client';
import { useState } from 'react';

interface Summary {
  tldr: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  readTimeSaved: string;
  factCheckStatus: 'verified' | 'unverified' | 'disputed';
  factCheckNote: string;
  sourcesCount: number;
}

const SENTIMENT = {
  positive: { icon: '📈', label: 'Positive', color: '#10b981' },
  neutral:  { icon: '⚖️', label: 'Neutral',  color: '#6b7280' },
  negative: { icon: '📉', label: 'Negative', color: '#ef4444' },
  mixed:    { icon: '🔄', label: 'Mixed',    color: '#f59e0b' },
};

const FACT_CHECK = {
  verified:   { icon: '✓', label: 'Sources Verified',  color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  unverified: { icon: '?', label: 'Unverified Claims', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  disputed:   { icon: '!', label: 'Disputed Content',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
};

export function AISummaryCard({ slug, content, title }: { slug: string; content: string; title: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [queued, setQueued] = useState(false);
  const [retryIn, setRetryIn] = useState(0);

  const fetchSummary = async () => {
    setLoading(true);
    setQueued(false);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content, title }),
      });
      if (res.status === 429) {
        setQueued(true);
        setLoading(false);
        let countdown = 15;
        setRetryIn(countdown);
        const interval = setInterval(() => {
          countdown--;
          setRetryIn(countdown);
          if (countdown <= 0) clearInterval(interval);
        }, 1000);
        setTimeout(fetchSummary, 15000);
        return;
      }
      const { data } = await res.json();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !summary && !loading) fetchSummary();
  };

  const s = summary?.sentiment ? SENTIMENT[summary.sentiment] : null;
  const f = summary?.factCheckStatus ? FACT_CHECK[summary.factCheckStatus] : null;

  return (
    <div style={{
      margin: '2rem 0',
      borderRadius: '20px',
      background: 'linear-gradient(145deg, #080818 0%, #0f0f2e 60%, #080c18 100%)',
      border: '1px solid rgba(139,92,246,0.25)',
      boxShadow: open ? '0 8px 48px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.04)' : '0 2px 12px rgba(0,0,0,0.3)',
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      overflow: 'hidden',
    }}>
      <button onClick={handleToggle} style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '1.1rem 1.5rem',
        background: 'none', border: 'none', cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
          }}>✦</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0', fontFamily: '"Crimson Pro", serif' }}>
              AI Summary
            </div>
            <div style={{ fontSize: '0.7rem', color: '#7c3aed', letterSpacing: '0.04em' }}>
              GEMINI · FREE TIER CACHED
            </div>
          </div>
        </div>
        <span style={{
          color: '#7c3aed', fontSize: '1.1rem',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease', display: 'block',
        }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', padding: '0.5rem 0' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                border: '2px solid #7c3aed', borderTopColor: 'transparent',
                animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '0.85rem' }}>
                {queued ? `Rate limited — retrying in ${retryIn}s...` : 'Generating with Gemini...'}
              </span>
            </div>
          )}

          {summary && (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              {/* TL;DR */}
              <div style={{
                fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.7,
                borderLeft: '3px solid #7c3aed', paddingLeft: '1rem',
                marginBottom: '1.25rem', fontStyle: 'italic',
              }}>
                "{summary.tldr}"
              </div>

              {/* Key Points */}
              {summary.keyPoints?.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
                    KEY POINTS
                  </div>
                  {summary.keyPoints.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#7c3aed', fontSize: '0.7rem', marginTop: '3px', flexShrink: 0 }}>◆</span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {s && (
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: '999px',
                    background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color,
                  }}>
                    {s.icon} {s.label}
                  </span>
                )}
                {f && (
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: '999px',
                    background: f.bg, border: `1px solid ${f.color}30`, color: f.color,
                    cursor: 'default', title: summary.factCheckNote,
                  }}>
                    {f.icon} {f.label}
                  </span>
                )}
                <span style={{
                  fontSize: '0.7rem', padding: '3px 10px', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569',
                }}>
                  ⏱ Saves {summary.readTimeSaved}
                </span>
              </div>

              {f && summary.factCheckNote && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: '#475569', fontStyle: 'italic' }}>
                  ℹ️ {summary.factCheckNote}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
```

---

## 🔊 Feature 2: Audio Mode (Web Speech API — 100% Free)

**Zero API calls. Zero cost. Built into every modern browser.**

### Component: `src/components/article/AudioMode.tsx`

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';

export function AudioMode({ content, title, lang = 'en' }: { 
  content: string; 
  title: string; 
  lang?: 'en' | 'ms'; 
}) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanText = (html: string) => 
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => {
      window.speechSynthesis?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getVoice = (lang: string) => {
    const voices = window.speechSynthesis.getVoices();
    // Prefer Malay voice for BM, English for EN
    const langCode = lang === 'ms' ? 'ms' : 'en';
    return voices.find(v => v.lang.startsWith(langCode)) 
      || voices.find(v => v.lang.startsWith('en')) 
      || voices[0];
  };

  const startReading = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();

    const fullText = `${title}. ${cleanText(content)}`;
    const utter = new SpeechSynthesisUtterance(fullText);
    utter.voice = getVoice(lang);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.lang = lang === 'ms' ? 'ms-MY' : 'en-GB';

    let charIndex = 0;
    utter.onboundary = (e) => {
      charIndex = e.charIndex;
      setProgress(Math.round((charIndex / fullText.length) * 100));
    };
    utter.onend = () => { setPlaying(false); setProgress(0); };
    utter.onerror = () => { setPlaying(false); setProgress(0); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setPlaying(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setProgress(0);
  };

  if (!supported) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.875rem 1.25rem',
      background: playing 
        ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))' 
        : 'rgba(255,255,255,0.03)',
      border: playing ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      transition: 'all 0.3s ease',
      marginBottom: '1.5rem',
    }}>
      {/* Waveform animation when playing */}
      {playing && (
        <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: '3px', height: `${8 + i * 3}px`,
              background: '#10b981', borderRadius: '2px',
              animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
            }} />
          ))}
        </div>
      )}

      {!playing && (
        <div style={{ fontSize: '1.25rem' }}>🎧</div>
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: playing ? '#10b981' : '#64748b', letterSpacing: '0.05em' }}>
          {playing ? 'READING ALOUD' : 'AUDIO MODE'}
        </div>
        {playing && progress > 0 && (
          <div style={{ marginTop: '4px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', transition: 'width 0.3s ease' }} />
          </div>
        )}
        {!playing && (
          <div style={{ fontSize: '0.7rem', color: '#374151' }}>Browser native · no API cost</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {!playing ? (
          <button onClick={startReading} style={btnStyle('#10b981')}>▶ Listen</button>
        ) : (
          <>
            <button onClick={pause} style={btnStyle('#f59e0b')}>⏸</button>
            <button onClick={stop} style={btnStyle('#ef4444')}>■</button>
          </>
        )}
      </div>

      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

const btnStyle = (color: string): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: '8px', border: `1px solid ${color}40`,
  background: `${color}15`, color, fontSize: '0.75rem', fontWeight: 700,
  cursor: 'pointer', transition: 'all 0.2s',
});
```

---

## 🌐 Feature 3: BM ↔ EN Language Toggle (Gemini Cached)

### File: `src/app/api/translate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days — translations rarely change

export async function POST(req: NextRequest) {
  const { slug, content, title, targetLang } = await req.json();

  if (!['ms', 'en'].includes(targetLang)) {
    return NextResponse.json({ error: 'Supported: en, ms' }, { status: 400 });
  }

  const cacheKey = `translate:${slug}:${targetLang}`;
  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json({ data: cached, cached: true });

  // Rate limit check (shared with other Gemini features)
  const minute = Math.floor(Date.now() / 60000);
  const rlKey = `ratelimit:gemini:${minute}`;
  const count = await redis.incr(rlKey);
  if (count === 1) await redis.expire(rlKey, 65);
  if (count > 12) return NextResponse.json({ queued: true }, { status: 429 });

  const langName = targetLang === 'ms' ? 'Bahasa Malaysia' : 'English';
  const prompt = `Translate this news article to ${langName}. Maintain journalistic tone. Return ONLY valid JSON:

{"title": "translated title", "content": "translated article content (preserve paragraph breaks with \\n\\n)"}

Title: ${title}
Content: ${content.slice(0, 5000)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
      })
    }
  );

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  let translated;
  try {
    translated = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }

  await redis.set(cacheKey, translated, { ex: CACHE_TTL });
  return NextResponse.json({ data: translated, cached: false });
}
```

### Component: `src/components/article/LanguageToggle.tsx`

```tsx
'use client';
import { useState } from 'react';

export function LanguageToggle({ 
  slug, originalContent, originalTitle, originalLang = 'en',
  onTranslate 
}: {
  slug: string;
  originalContent: string;
  originalTitle: string;
  originalLang?: 'en' | 'ms';
  onTranslate: (title: string, content: string, lang: 'en' | 'ms') => void;
}) {
  const [activeLang, setActiveLang] = useState<'en' | 'ms'>(originalLang);
  const [loading, setLoading] = useState(false);
  const [translated, setTranslated] = useState<Record<string, { title: string; content: string }>>({});

  const switchTo = async (lang: 'en' | 'ms') => {
    if (lang === activeLang) return;

    // Switching back to original
    if (lang === originalLang) {
      setActiveLang(lang);
      onTranslate(originalTitle, originalContent, lang);
      return;
    }

    // Use cached translation
    if (translated[lang]) {
      setActiveLang(lang);
      onTranslate(translated[lang].title, translated[lang].content, lang);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, content: originalContent, title: originalTitle, targetLang: lang }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setTranslated(prev => ({ ...prev, [lang]: data }));
      onTranslate(data.title, data.content, lang);
      setActiveLang(lang);
    }
    setLoading(false);
  };

  const langs = [
    { code: 'en' as const, label: 'EN', full: 'English' },
    { code: 'ms' as const, label: 'BM', full: 'Bahasa Malaysia' },
  ];

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      <span style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.05em' }}>READ IN</span>
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden',
      }}>
        {langs.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => switchTo(code)}
            disabled={loading}
            title={`Read in ${langs.find(l => l.code === code)?.full}`}
            style={{
              padding: '5px 14px', fontSize: '0.78rem', fontWeight: 700,
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              background: activeLang === code ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeLang === code ? '#a78bfa' : '#475569',
              borderRight: code === 'en' ? '1px solid rgba(255,255,255,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {loading && code !== activeLang ? '...' : label}
          </button>
        ))}
      </div>
      {loading && <span style={{ fontSize: '0.7rem', color: '#7c3aed' }}>Translating with Gemini...</span>}
    </div>
  );
}
```

### Wire it into article page: `src/app/articles/[slug]/page.tsx`

```tsx
// Add to your existing article page:
'use client';
import { useState } from 'react';
import { AISummaryCard } from '@/components/article/AISummaryCard';
import { AudioMode } from '@/components/article/AudioMode';
import { LanguageToggle } from '@/components/article/LanguageToggle';
import { FocusMode } from '@/components/article/FocusMode';
import { WhatsAppShare } from '@/components/article/WhatsAppShare';

export default function ArticlePage({ article, summary }: any) {
  const [displayTitle, setDisplayTitle] = useState(article.title);
  const [displayContent, setDisplayContent] = useState(article.content);
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [focusMode, setFocusMode] = useState(false);

  const handleTranslate = (title: string, content: string, lang: 'en' | 'ms') => {
    setDisplayTitle(title);
    setDisplayContent(content);
    setCurrentLang(lang);
  };

  return (
    <FocusMode active={focusMode} onToggle={() => setFocusMode(f => !f)}>
      <article>
        {/* Article toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <LanguageToggle
            slug={article.slug}
            originalContent={article.content}
            originalTitle={article.title}
            onTranslate={handleTranslate}
          />
          <WhatsAppShare title={displayTitle} slug={article.slug} tldr={summary?.tldr} />
          <button onClick={() => setFocusMode(f => !f)} style={toolbarBtn}>
            {focusMode ? '✕ Exit Focus' : '◎ Focus Mode'}
          </button>
        </div>

        {/* Audio Mode */}
        <AudioMode content={displayContent} title={displayTitle} lang={currentLang} />

        {/* AI Summary */}
        <AISummaryCard slug={article.slug} content={article.content} title={article.title} />

        <h1>{displayTitle}</h1>
        <div dangerouslySetInnerHTML={{ __html: displayContent }} />
      </article>
    </FocusMode>
  );
}

const toolbarBtn: React.CSSProperties = {
  padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem',
  fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)', color: '#64748b', cursor: 'pointer',
};
```

---

## 🎯 Feature 4: Focus Reading Mode

### Component: `src/components/article/FocusMode.tsx`

```tsx
'use client';
import { useEffect } from 'react';

export function FocusMode({ 
  active, onToggle, children 
}: { 
  active: boolean; onToggle: () => void; children: React.ReactNode; 
}) {
  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [active]);

  if (!active) return <>{children}</>;

  return (
    <>
      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#f8f4ed', // Warm paper tone
        overflowY: 'auto',
        padding: '0',
      }}>
        {/* Focus toolbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 1,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.875rem 2rem',
          background: '#f8f4ed',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', letterSpacing: '0.15em' }}>FOCUS MODE</span>
          <button onClick={onToggle} style={{
            background: 'none', border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '8px', padding: '4px 12px',
            fontSize: '0.75rem', color: '#6b7280', cursor: 'pointer',
          }}>
            ✕ Exit
          </button>
        </div>

        {/* Article content */}
        <div style={{
          maxWidth: '660px', margin: '0 auto',
          padding: '3rem 2rem 6rem',
          fontFamily: '"Crimson Pro", "Georgia", serif',
          fontSize: '1.2rem',
          lineHeight: 1.9,
          color: '#1a1412',
          letterSpacing: '0.01em',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>
    </>
  );
}
```

---

## 💬 Feature 5: WhatsApp Share with AI TL;DR

### Component: `src/components/article/WhatsAppShare.tsx`

```tsx
'use client';

export function WhatsAppShare({ 
  title, slug, tldr 
}: { 
  title: string; slug: string; tldr?: string; 
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://adam-news.vercel.app';
  const articleUrl = `${siteUrl}/articles/${slug}`;

  const message = tldr
    ? `📰 *${title}*\n\n💡 ${tldr}\n\n🔗 Read more: ${articleUrl}\n\n_via Adam News_`
    : `📰 *${title}*\n\n🔗 ${articleUrl}\n\n_via Adam News_`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '8px', textDecoration: 'none',
        background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)',
        color: '#25d366', fontSize: '0.75rem', fontWeight: 700,
        transition: 'all 0.2s',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Share + Summary
    </a>
  );
}
```

---

## 🧠 Feature 6: Personalised Feed (Zero Backend Cost)

**Uses `localStorage` — no database, no API calls, no cost.**

### Hook: `src/hooks/usePersonalisation.ts`

```typescript
import { useEffect, useState } from 'react';

interface UserProfile {
  categories: Record<string, number>;   // { technology: 8, sports: 2 }
  readArticles: string[];               // [slug1, slug2, ...]
  preferredLang: 'en' | 'ms';
  lastUpdated: number;
}

const PROFILE_KEY = 'an_user_profile';

export function usePersonalisation() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      try { setProfile(JSON.parse(raw)); } catch {}
    }
  }, []);

  const trackRead = (slug: string, category: string) => {
    setProfile(prev => {
      const next: UserProfile = {
        categories: { ...(prev?.categories || {}), [category]: ((prev?.categories[category] || 0) + 1) },
        readArticles: [...(prev?.readArticles || []).slice(-50), slug],
        preferredLang: prev?.preferredLang || 'en',
        lastUpdated: Date.now(),
      };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const setLang = (lang: 'en' | 'ms') => {
    setProfile(prev => {
      const next = { ...(prev || { categories: {}, readArticles: [], lastUpdated: Date.now() }), preferredLang: lang };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Get top 3 preferred categories
  const topCategories = profile 
    ? Object.entries(profile.categories)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat)
    : [];

  // Score articles by relevance to user
  const scoreArticles = (articles: any[]) => {
    if (!profile || topCategories.length === 0) return articles;

    return [...articles]
      .map(article => {
        const cat = article.attributes?.category?.data?.attributes?.slug || '';
        const isRead = profile.readArticles.includes(article.attributes?.slug || '');
        const catScore = topCategories.indexOf(cat);
        
        return {
          ...article,
          _score: isRead ? -1 : catScore === 0 ? 3 : catScore === 1 ? 2 : catScore === 2 ? 1 : 0,
        };
      })
      .filter(a => a._score >= 0) // hide already-read articles from hero
      .sort((a, b) => b._score - a._score);
  };

  return { profile, trackRead, setLang, topCategories, scoreArticles };
}
```

### Personalised Banner: `src/components/reader/PersonalisedBanner.tsx`

```tsx
'use client';
import { usePersonalisation } from '@/hooks/usePersonalisation';

export function PersonalisedBanner() {
  const { profile, topCategories } = usePersonalisation();

  if (!profile || topCategories.length === 0) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(79,70,229,0.04))',
      border: '1px solid rgba(139,92,246,0.12)',
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', gap: '1rem',
      marginBottom: '2rem',
    }}>
      <span style={{ fontSize: '1.5rem' }}>👋</span>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
          {greeting} — here's what matters to you
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>
          Showing more: {topCategories.join(' · ')} · based on your reading
        </div>
      </div>
    </div>
  );
}
```

---

## ☀️ Feature 7: My Morning Digest Page

### File: `src/app/api/digest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const CACHE_TTL = 60 * 60 * 6; // 6 hours — digest refreshes twice a day

export async function POST(req: NextRequest) {
  const { categories, topArticles } = await req.json();

  // Cache key based on top categories + date (not user-specific, shared by similar readers)
  const dateHour = new Date().toISOString().slice(0, 13); // "2026-02-22T09"
  const cacheKey = `digest:${categories.slice(0,3).sort().join('-')}:${dateHour}`;

  const cached = await redis.get(cacheKey);
  if (cached) return NextResponse.json({ data: cached, cached: true });

  // Rate limit
  const minute = Math.floor(Date.now() / 60000);
  const rlKey = `ratelimit:gemini:${minute}`;
  const count = await redis.incr(rlKey);
  if (count === 1) await redis.expire(rlKey, 65);
  if (count > 12) return NextResponse.json({ queued: true }, { status: 429 });

  const articlesText = topArticles.slice(0, 8).map((a: any, i: number) =>
    `${i+1}. [${a.category}] ${a.title}: ${a.excerpt}`
  ).join('\n');

  const prompt = `You are a Malaysian news briefing editor. Create a morning digest for a reader who follows: ${categories.join(', ')}.

Today's top articles:
${articlesText}

Respond ONLY with valid JSON:
{
  "headline": "Punchy 8-word briefing headline for today",
  "intro": "2 sentence personalised morning intro mentioning Malaysia context",
  "stories": [
    {
      "title": "Article title",
      "summary": "Why it matters in 20 words",
      "category": "category name",
      "urgency": "high|medium|low"
    }
  ],
  "closingNote": "1 uplifting or thought-provoking sentence to end the briefing"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 600 }
      })
    }
  );

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let data;
  try {
    data = JSON.parse(raw.replace(/```json|```/g, '').trim());
  } catch {
    return NextResponse.json({ error: 'Digest generation failed' }, { status: 500 });
  }

  await redis.set(cacheKey, data, { ex: CACHE_TTL });
  return NextResponse.json({ data, cached: false });
}
```

### Page: `src/app/my-digest/page.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';
import { usePersonalisation } from '@/hooks/usePersonalisation';
import Link from 'next/link';

const URGENCY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const URGENCY_LABEL = { high: 'Breaking', medium: 'Important', low: 'Worth reading' };

export default function MyDigestPage() {
  const { topCategories } = usePersonalisation();
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    if (topCategories.length > 0) generateDigest();
  }, [topCategories.length]);

  const generateDigest = async () => {
    setLoading(true);
    setError('');
    // Fetch recent articles from Strapi
    const strapiRes = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/articles?sort=publishedAt:desc&pagination[limit]=10&populate=category`
    );
    const strapiData = await strapiRes.json();
    const topArticles = (strapiData.data || []).map((a: any) => ({
      title: a.attributes.title,
      excerpt: a.attributes.excerpt || a.attributes.content?.slice(0,200),
      category: a.attributes.category?.data?.attributes?.name || 'General',
      slug: a.attributes.slug,
    }));

    const res = await fetch('/api/digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: topCategories, topArticles }),
    });

    if (!res.ok) { setError('Digest generation failed. Try again.'); setLoading(false); return; }
    const { data } = await res.json();
    setDigest(data);
    setLoading(false);
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0f0a24 0%, #060610 60%)',
      padding: '2rem 1rem',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#4c4f6b', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            {dateStr.toUpperCase()} · {timeStr}
          </div>
          <h1 style={{
            fontFamily: '"Crimson Pro", serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900, color: '#e2e8f0', lineHeight: 1.1, marginBottom: '0.5rem',
          }}>
            Your Morning<br />
            <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Briefing
            </span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#475569' }}>
            Personalised for your interests · Powered by Gemini · Updates twice daily
          </p>
        </div>

        {/* No profile yet */}
        {topCategories.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📰</div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.75rem', fontFamily: '"Crimson Pro", serif' }}>
              Read a few articles first
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Your digest personalises based on what you read. Start with the homepage and come back.
            </p>
            <Link href="/" style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
            }}>
              Browse Articles →
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem',
            }} />
            <p style={{ color: '#475569', fontSize: '0.85rem' }}>Gemini is crafting your briefing...</p>
          </div>
        )}

        {/* Digest content */}
        {digest && !loading && (
          <div style={{ animation: 'fadeUp 0.5s ease' }}>
            {/* Big headline */}
            <div style={{
              padding: '2rem', marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.04))',
              border: '1px solid rgba(139,92,246,0.15)', borderRadius: '20px',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#7c3aed', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                TODAY'S BRIEFING
              </div>
              <h2 style={{
                fontFamily: '"Crimson Pro", serif', fontSize: '1.75rem',
                color: '#e2e8f0', lineHeight: 1.2, marginBottom: '1rem',
              }}>
                {digest.headline}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7 }}>
                {digest.intro}
              </p>
            </div>

            {/* Stories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {digest.stories?.map((story: any, i: number) => {
                const urgencyColor = URGENCY_COLOR[story.urgency as keyof typeof URGENCY_COLOR] || '#6b7280';
                return (
                  <div key={i} style={{
                    padding: '1.25rem 1.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: `3px solid ${urgencyColor}`,
                    borderRadius: '12px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: '#6b7280', letterSpacing: '0.05em' }}>
                        {story.category?.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '0.62rem', color: urgencyColor, fontWeight: 700,
                        background: `${urgencyColor}15`, padding: '2px 8px', borderRadius: '999px',
                      }}>
                        {URGENCY_LABEL[story.urgency as keyof typeof URGENCY_LABEL] || 'News'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem', fontFamily: '"Crimson Pro", serif' }}>
                      {story.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                      {story.summary}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Closing note */}
            <div style={{
              padding: '1.25rem 1.5rem', textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              <p style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', fontFamily: '"Crimson Pro", serif' }}>
                {digest.closingNote}
              </p>
            </div>

            <button onClick={generateDigest} style={{
              display: 'block', width: '100%', padding: '0.875rem',
              background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#4b5563', fontSize: '0.8rem', cursor: 'pointer',
              marginTop: '1rem',
            }}>
              ↻ Refresh briefing
            </button>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;900&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </main>
  );
}
```

---

## 📱 Feature 8: Short Videos Page

### File: `src/app/shorts/page.tsx`

```tsx
import { ShortsClient } from '@/components/shorts/ShortsClient';

export const revalidate = 60;

export default async function ShortsPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/short-videos?sort=publishedAt:desc&populate=thumbnail&pagination[limit]=20`,
    { next: { tags: ['shorts'] } }
  );
  const { data: videos } = await res.json();
  return <ShortsClient videos={videos || []} />;
}
```

*(Full ShortsClient component from MVP v1.0 document — unchanged, included in previous doc)*

---

## 🎯 Feature 9: Campaign Microsites

*(Full implementation from MVP v1.0 document — unchanged)*

---

## 🗺️ Updated Navigation

### `src/constants/nav.ts`

```typescript
export const NAV_ITEMS = [
  { label: 'Home',        href: '/',           icon: '⌂'  },
  { label: 'News',        href: '/articles',   icon: '📰' },
  { label: '⚡ Shorts',   href: '/shorts',     icon: '▶'  },
  { label: '☀️ Digest',   href: '/my-digest',  icon: '✦'  },
  { label: 'Campaigns',   href: '/campaign',   icon: '🎯' },
  { label: 'Subscribe',   href: '/subscribe',  icon: '★'  },
];
```

---

## 🌲 Final Project Structure (New Files Only)

```
src/
├── app/
│   ├── my-digest/
│   │   └── page.tsx                    ← NEW: Morning Digest page
│   ├── shorts/
│   │   └── page.tsx                    ← NEW: Short Videos page
│   ├── campaign/
│   │   └── [slug]/page.tsx             ← NEW: Campaign microsites
│   └── api/
│       ├── summarize/route.ts          ← NEW: AI summary + fact-check
│       ├── translate/route.ts          ← NEW: BM ↔ EN translation
│       └── digest/route.ts             ← NEW: Morning digest generation
├── components/
│   ├── article/
│   │   ├── AISummaryCard.tsx           ← NEW: AI Summary + badges
│   │   ├── AudioMode.tsx               ← NEW: Web Speech API
│   │   ├── LanguageToggle.tsx          ← NEW: BM ↔ EN switch
│   │   ├── FocusMode.tsx               ← NEW: Clean reading overlay
│   │   └── WhatsAppShare.tsx           ← NEW: Share with TL;DR
│   ├── shorts/
│   │   └── ShortsClient.tsx            ← NEW: TikTok-style feed
│   ├── campaign/
│   │   └── CampaignPage.tsx            ← NEW: Dynamic campaign UI
│   └── reader/
│       └── PersonalisedBanner.tsx      ← NEW: "Good morning" banner
└── hooks/
    └── usePersonalisation.ts           ← NEW: localStorage profiling
```

---

## 🔑 Environment Variables (Complete)

```env
# === EXISTING ===
NEXT_PUBLIC_STRAPI_URL=https://adamnews-production.up.railway.app
STRAPI_API_TOKEN=your_strapi_token
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://adam-news.vercel.app
NEXT_PUBLIC_SITE_URL=https://adam-news.vercel.app
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# === NEW: Add these ===
GEMINI_API_KEY=your_gemini_api_key

# Get free key at: https://aistudio.google.com/app/apikey
# Model used: gemini-2.0-flash (fastest, most generous free tier)
```

---

## 🚀 Deployment Order

```
Step 1: Migrate DB
  □ Export Railway PostgreSQL → pg_dump $URL > backup.sql
  □ Create Supabase project (free.supabase.com)
  □ Import → psql $SUPABASE_URL < backup.sql
  □ Update RAILWAY Strapi DATABASE_URL to Supabase
  □ Test Strapi still works

Step 2: Strapi Content Types
  □ Add ShortVideo content type (title, videoUrl, thumbnail, category, source, duration)
  □ Add Campaign content type (slug, title, subtitle, heroImage, primaryColor, sections)
  □ Set permissions: Public → find, findOne for both
  □ Seed 3–5 short videos using Cloudinary URLs
  □ Create 1 test campaign

Step 3: Code & Deploy
  □ Add GEMINI_API_KEY to Vercel environment variables
  □ Push all new files to GitHub
  □ Vercel auto-deploys on push
  □ Verify /api/summarize works (check Upstash dashboard for cache hits)
  □ Verify /api/translate BM mode works
  □ Test /shorts on mobile (must be 100vh, scroll-snap working)
  □ Test /my-digest (read 3 articles first to build profile)
  □ Test Focus Mode on article page
  □ Test Audio Mode on article page
  □ Test WhatsApp share button — verify message format

Step 4: Quality Check
  □ Open Network tab — confirm Redis cache hits on second summary load
  □ Open Upstash dashboard — verify daily command count < 5,000
  □ Check Gemini calls — should be near-zero after first load (all cached)
  □ Test on iPhone Safari (Web Speech API compatibility)
  □ Test on Android Chrome (scroll-snap shorts behaviour)
```

---

## 🏆 Final Competitive Landscape

| Feature | NST | Berita Harian | SAYS | Adam News ✦ |
|---------|-----|--------------|------|------------|
| AI Article Summary | ❌ | ❌ | ❌ | ✅ Gemini-powered |
| Sentiment + Fact Badge | ❌ | ❌ | ❌ | ✅ Per-article |
| Listen to Article | ❌ | ❌ | ❌ | ✅ Native browser |
| BM ↔ EN Toggle | ❌ | ❌ | ❌ | ✅ Gemini translated |
| Focus Reading Mode | ❌ | ❌ | ❌ | ✅ Editorial typography |
| Short Video Feed | ❌ | ❌ | ❌ | ✅ TikTok-style |
| WhatsApp Share + TL;DR | ❌ | ❌ | ❌ | ✅ Pre-formatted |
| Personalised Feed | ❌ | ❌ | ❌ | ✅ localStorage AI |
| Morning Digest | ❌ | ❌ | ❌ | ✅ AI-generated |
| Campaign Microsites | ⚠️ Separate | ⚠️ Separate | ✅ | ✅ Dynamic routes |
| Dark Mode | ❌ | ❌ | ❌ | ✅ |
| Monthly Cost | 💰 RM+++ | 💰 RM+++ | 💰 RM+++ | ✅ RM 0 |

---

*Adam News Final MVP v2.0 — February 2026*
*Next.js 16 · Strapi · Supabase · Upstash Redis · Gemini 2.0 Flash · Cloudinary · Vercel*
*Built by Mohamed Adam · Senior Full-Stack Developer Portfolio*
