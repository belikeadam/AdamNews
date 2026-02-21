'use client'

import { useState, useEffect } from 'react'

interface PrayerTimes {
  fajr: string
  syuruk: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

const PRAYER_NAMES: Record<keyof PrayerTimes, string> = {
  fajr: 'Fajr',
  syuruk: 'Syuruk',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

const CACHE_KEY = 'prayerTimes'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function getNextPrayer(times: PrayerTimes): { name: string; time: string } | null {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const entries = Object.entries(times) as [keyof PrayerTimes, string][]

  for (const [key, timeStr] of entries) {
    if (key === 'syuruk') continue // Skip syuruk (sunrise) — not a prayer
    const [h, m] = timeStr.split(':').map(Number)
    const prayerMinutes = h * 60 + m
    if (prayerMinutes > currentMinutes) {
      // Format to 12-hour
      const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h >= 12 ? 'PM' : 'AM'
      return {
        name: PRAYER_NAMES[key],
        time: `${hour}:${m.toString().padStart(2, '0')} ${ampm}`,
      }
    }
  }

  // After Isha — next is Fajr tomorrow
  const [h, m] = times.fajr.split(':').map(Number)
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  const ampm = h >= 12 ? 'PM' : 'AM'
  return {
    name: 'Fajr',
    time: `${hour}:${m.toString().padStart(2, '0')} ${ampm}`,
  }
}

export default function PrayerTimeWidget() {
  const [next, setNext] = useState<{ name: string; time: string } | null>(null)

  useEffect(() => {
    async function fetchPrayerTimes() {
      // Check cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setNext(getNextPrayer(data))
            return
          }
        }
      } catch { /* ignore */ }

      try {
        const res = await fetch('https://api.waktusolat.app/v2/solat/WLY01')
        if (!res.ok) return
        const json = await res.json()

        // The API returns prayers array — extract today's times
        const today = new Date().toISOString().split('T')[0]
        const prayers = json.prayers || []
        const todayPrayer = prayers.find((p: { date: string }) =>
          p.date?.startsWith(today)
        ) || prayers[0]

        if (!todayPrayer) return

        const times: PrayerTimes = {
          fajr: todayPrayer.fajr || '',
          syuruk: todayPrayer.syuruk || '',
          dhuhr: todayPrayer.dhuhr || '',
          asr: todayPrayer.asr || '',
          maghrib: todayPrayer.maghrib || '',
          isha: todayPrayer.isha || '',
        }

        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: times, timestamp: Date.now() }))
        setNext(getNextPrayer(times))
      } catch {
        // Graceful degradation — hide widget
      }
    }

    fetchPrayerTimes()

    // Refresh every minute to update "next prayer"
    const interval = setInterval(() => {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data } = JSON.parse(cached)
          setNext(getNextPrayer(data))
        }
      } catch { /* ignore */ }
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!next) return null

  return (
    <span className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors" title={`Next prayer: ${next.name} at ${next.time}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <span className="text-[0.65rem] whitespace-nowrap">
        {next.name} {next.time}
      </span>
    </span>
  )
}
