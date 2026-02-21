'use client'

import { useState, useEffect } from 'react'

const CACHE_KEY = 'weather_kl'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

// WMO Weather Code to emoji mapping
function weatherEmoji(code: number): string {
  if (code === 0) return '\u2600\uFE0F' // Clear sky
  if (code <= 3) return '\u26C5' // Partly cloudy
  if (code <= 48) return '\uD83C\uDF2B\uFE0F' // Fog
  if (code <= 57) return '\uD83C\uDF27\uFE0F' // Drizzle
  if (code <= 67) return '\uD83C\uDF27\uFE0F' // Rain
  if (code <= 77) return '\u2744\uFE0F' // Snow
  if (code <= 82) return '\uD83C\uDF27\uFE0F' // Rain showers
  if (code <= 86) return '\u2744\uFE0F' // Snow showers
  if (code <= 99) return '\u26C8\uFE0F' // Thunderstorm
  return '\u2600\uFE0F'
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number; emoji: string } | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      // Check cache
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_DURATION) {
            setWeather(data)
            return
          }
        }
      } catch { /* ignore */ }

      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=3.1412&longitude=101.6865&current=temperature_2m,weathercode&timezone=Asia/Kuala_Lumpur'
        )
        if (!res.ok) return
        const json = await res.json()
        const temp = Math.round(json.current?.temperature_2m ?? 0)
        const code = json.current?.weathercode ?? 0
        const data = { temp, emoji: weatherEmoji(code) }

        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
        setWeather(data)
      } catch {
        // Graceful degradation
      }
    }

    fetchWeather()
  }, [])

  if (!weather) return null

  return (
    <span
      className="flex items-center gap-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      title={`Kuala Lumpur: ${weather.temp}°C`}
    >
      <span className="text-xs">{weather.emoji}</span>
      <span className="text-[0.65rem] whitespace-nowrap">
        KL {weather.temp}°C
      </span>
    </span>
  )
}
