'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  content: string
  title: string
  lang?: 'en' | 'ms'
}

export default function AudioMode({ content, title, lang = 'en' }: Props) {
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [supported, setSupported] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  const cleanText = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Reset when content/lang changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setPlaying(false)
    setPaused(false)
    setProgress(0)
  }, [content, lang])

  const startReading = () => {
    if (!supported) return
    window.speechSynthesis.cancel()

    const fullText = `${title}. ${cleanText(content)}`
    const utter = new SpeechSynthesisUtterance(fullText)

    // Select voice
    const voices = window.speechSynthesis.getVoices()
    const langCode = lang === 'ms' ? 'ms' : 'en'
    const voice = voices.find(v => v.lang.startsWith(langCode))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0]
    if (voice) utter.voice = voice

    utter.rate = 0.95
    utter.pitch = 1
    utter.lang = lang === 'ms' ? 'ms-MY' : 'en-GB'

    utter.onboundary = (e) => {
      setProgress(Math.round((e.charIndex / fullText.length) * 100))
    }
    utter.onend = () => { setPlaying(false); setPaused(false); setProgress(0) }
    utter.onerror = () => { setPlaying(false); setPaused(false); setProgress(0) }

    utterRef.current = utter
    window.speechSynthesis.speak(utter)
    setPlaying(true)
    setPaused(false)
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setPaused(true)
  }

  const resume = () => {
    window.speechSynthesis.resume()
    setPaused(false)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setPaused(false)
    setProgress(0)
  }

  if (!supported) return null

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 mb-4 ${
        playing
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-[var(--surface)] border-[var(--border)]'
      }`}
    >
      {/* Waveform animation */}
      {playing && !paused && (
        <div className="flex gap-[2px] items-center flex-shrink-0">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="w-[3px] rounded-sm bg-emerald-500"
              style={{
                height: `${8 + i * 3}px`,
                animation: `audioWave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {!playing && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--muted)] flex-shrink-0">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      )}

      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold tracking-wide ${playing ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--muted)]'}`}>
          {playing ? (paused ? 'PAUSED' : 'READING ALOUD') : 'AUDIO MODE'}
        </div>
        {playing && progress > 0 && (
          <div className="mt-1 h-[2px] bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-[width] duration-300 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {!playing && (
          <div className="text-[0.65rem] text-[var(--muted)]">
            Listen to this article · {lang === 'ms' ? 'Bahasa Malaysia' : 'English'} voice
          </div>
        )}
      </div>

      <div className="flex gap-1.5 flex-shrink-0">
        {!playing ? (
          <button
            onClick={startReading}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            ▶ Listen
          </button>
        ) : (
          <>
            <button
              onClick={paused ? resume : pause}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              {paused ? '▶' : '⏸'}
            </button>
            <button
              onClick={stop}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-200 transition-colors cursor-pointer"
            >
              ■
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes audioWave {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
