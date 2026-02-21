'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface EmojiReactionsProps {
  slug: string
  views?: number
}

const REACTIONS = [
  { emoji: '🔥', label: 'Fire', key: 'fire' },
  { emoji: '🤯', label: 'Mind Blown', key: 'mind_blown' },
  { emoji: '👏', label: 'Clap', key: 'clap' },
  { emoji: '💯', label: 'Hundred', key: 'hundred' },
  { emoji: '🤔', label: 'Thinking', key: 'thinking' },
]

function generateSeedCounts(views: number): Record<string, number> {
  // Generate realistic-looking counts seeded from view count
  const base = Math.max(1, Math.floor(views * 0.08))
  return {
    fire: Math.floor(base * 1.2 + (views % 7)),
    mind_blown: Math.floor(base * 0.6 + (views % 5)),
    clap: Math.floor(base * 1.5 + (views % 9)),
    hundred: Math.floor(base * 0.4 + (views % 3)),
    thinking: Math.floor(base * 0.3 + (views % 4)),
  }
}

export default function EmojiReactions({ slug, views = 0 }: EmojiReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set())
  const [animatingKey, setAnimatingKey] = useState<string | null>(null)

  useEffect(() => {
    const storageKey = `reactions_${slug}`
    const userKey = `user_reactions_${slug}`

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setCounts(JSON.parse(stored))
      } else {
        const seed = generateSeedCounts(views)
        setCounts(seed)
        localStorage.setItem(storageKey, JSON.stringify(seed))
      }

      const userStored = localStorage.getItem(userKey)
      if (userStored) {
        setUserReactions(new Set(JSON.parse(userStored)))
      }
    } catch { /* ignore */ }
  }, [slug, views])

  const handleReaction = (key: string) => {
    const storageKey = `reactions_${slug}`
    const userKey = `user_reactions_${slug}`
    const newUserReactions = new Set(userReactions)

    let newCounts: Record<string, number>

    if (newUserReactions.has(key)) {
      newUserReactions.delete(key)
      newCounts = { ...counts, [key]: Math.max(0, (counts[key] || 0) - 1) }
    } else {
      newUserReactions.add(key)
      newCounts = { ...counts, [key]: (counts[key] || 0) + 1 }
      setAnimatingKey(key)
      setTimeout(() => setAnimatingKey(null), 400)
    }

    setCounts(newCounts)
    setUserReactions(newUserReactions)

    try {
      localStorage.setItem(storageKey, JSON.stringify(newCounts))
      localStorage.setItem(userKey, JSON.stringify([...newUserReactions]))
    } catch { /* ignore */ }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {REACTIONS.map(({ emoji, label, key }) => {
        const isActive = userReactions.has(key)
        const count = counts[key] || 0

        return (
          <motion.button
            key={key}
            onClick={() => handleReaction(key)}
            animate={animatingKey === key ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs border transition-all ${
              isActive
                ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--text)] font-medium'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)] hover:bg-[var(--surface)]'
            }`}
            aria-label={`${label} reaction`}
          >
            <span className="text-sm">{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}
