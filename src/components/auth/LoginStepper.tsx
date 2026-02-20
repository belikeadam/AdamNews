'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginStepper() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSignIn = async () => {
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {step === 1 && (
        <div className="space-y-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            autoFocus
          />
          <Button onClick={handleNext} className="w-full">
            Next &rarr;
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-[var(--surface)] rounded p-3 border border-[var(--border)]">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold text-sm">
              {email[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">
                {email}
              </p>
              <p className="text-xs text-[var(--muted)]">
                Enter your password to sign in
              </p>
            </div>
          </div>

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep(1)
                setError('')
              }}
              className="flex-1"
            >
              &larr; Back
            </Button>
            <Button
              onClick={handleSignIn}
              loading={loading}
              className="flex-1"
            >
              Sign In &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
