'use client'

import { useEffect, useState, useCallback } from 'react'

interface UserProfile {
  categories: Record<string, number>
  readArticles: string[]
  preferredLang: 'en' | 'ms'
  lastUpdated: number
}

const PROFILE_KEY = 'an_user_profile'

export function usePersonalization() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY)
      if (raw) setProfile(JSON.parse(raw))
    } catch {
      // ignore
    }
    setLoaded(true)
  }, [])

  const trackRead = useCallback((slug: string, category: string) => {
    setProfile(prev => {
      const next: UserProfile = {
        categories: {
          ...(prev?.categories || {}),
          [category]: ((prev?.categories?.[category] || 0) + 1),
        },
        readArticles: [...(prev?.readArticles || []).slice(-50), slug],
        preferredLang: prev?.preferredLang || 'en',
        lastUpdated: Date.now(),
      }
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])

  const setLang = useCallback((lang: 'en' | 'ms') => {
    setProfile(prev => {
      const next: UserProfile = {
        categories: prev?.categories || {},
        readArticles: prev?.readArticles || [],
        preferredLang: lang,
        lastUpdated: Date.now(),
      }
      try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)) } catch { /* */ }
      return next
    })
  }, [])

  // Top 3 preferred categories
  const topCategories = profile
    ? Object.entries(profile.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)
    : []

  return { profile, trackRead, setLang, topCategories, loaded }
}
