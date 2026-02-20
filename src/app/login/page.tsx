import { Metadata } from 'next'
import TechBar from '@/components/layout/TechBar'
import LoginStepper from '@/components/auth/LoginStepper'
import OAuthButton from '@/components/auth/OAuthButton'
import DemoBanner from '@/components/shared/DemoBanner'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AdamNews',
}

export default function LoginPage() {
  return (
    <>
      <TechBar
        badges={[
          { label: 'SSR', tooltip: 'Server-side rendered per request', variant: 'success' },
          { label: 'NextAuth v5', tooltip: 'Authentication via Auth.js v5' },
          { label: 'JWT Strategy', tooltip: 'Stateless JWT tokens with custom claims' },
          { label: 'Credentials + OAuth', tooltip: 'Email/password and Google OAuth' },
        ]}
      />
      <DemoBanner />

      <div className="max-w-md mx-auto px-4 py-12 pb-20 md:pb-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
            Sign in to AdamNews
          </h1>
          <p className="text-[var(--muted)]">
            Access premium content and manage your subscription
          </p>
        </div>

        {/* Google OAuth */}
        <OAuthButton />

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-sm text-[var(--muted)]">or</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Step-by-step login */}
        <LoginStepper />
      </div>
    </>
  )
}
