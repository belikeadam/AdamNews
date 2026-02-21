'use client'

import { useSearchParams } from 'next/navigation'
import DemoLoginButtons from '@/components/auth/DemoLoginButtons'
import OAuthButton from '@/components/auth/OAuthButton'
import LoginStepper from '@/components/auth/LoginStepper'

export default function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <>
      {/* One-click demo login — top of page for reviewers */}
      <DemoLoginButtons callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-sm text-[var(--muted)]">or sign in manually</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Google OAuth */}
      <OAuthButton callbackUrl={callbackUrl} />

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-sm text-[var(--muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Step-by-step login */}
      <LoginStepper callbackUrl={callbackUrl} />
    </>
  )
}
