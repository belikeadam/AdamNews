import { Metadata } from 'next'
import Link from 'next/link'
import LoginStepper from '@/components/auth/LoginStepper'
import OAuthButton from '@/components/auth/OAuthButton'
import DemoBanner from '@/components/shared/DemoBanner'
import { SITE_NAME } from '@/constants/meta'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to AdamNews',
}

export default function LoginPage() {
  return (
    <>
    <DemoBanner />
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--accent)] to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="text-3xl font-bold text-white mb-6">
            {SITE_NAME}
          </Link>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Stay informed.<br />
            Stay ahead.
          </h2>
          <p className="text-white/80 text-lg max-w-sm">
            Access premium articles, in-depth analysis, and exclusive insights from industry experts.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 pb-20 md:pb-12 bg-[var(--bg)]">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-[var(--text)]">
              {SITE_NAME}
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
              Welcome back
            </h1>
            <p className="text-[var(--muted)]">
              Sign in to access your account
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

          {/* Sign up link */}
          <p className="text-center text-sm text-[var(--muted)] mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/plans" className="text-[var(--accent)] font-medium hover:underline">
              Subscribe now
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
