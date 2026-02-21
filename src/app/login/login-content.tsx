'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import DemoLoginButtons from '@/components/auth/DemoLoginButtons'
import OAuthButton from '@/components/auth/OAuthButton'
import LoginStepper from '@/components/auth/LoginStepper'

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 25 } },
}

export default function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {/* One-click demo login — top of page for reviewers */}
      <motion.div variants={item}>
        <DemoLoginButtons callbackUrl={callbackUrl} />
      </motion.div>

      {/* Divider */}
      <motion.div variants={item} className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-sm text-[var(--muted)]">or sign in manually</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </motion.div>

      {/* Google OAuth */}
      <motion.div variants={item}>
        <OAuthButton callbackUrl={callbackUrl} />
      </motion.div>

      <motion.div variants={item} className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-sm text-[var(--muted)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </motion.div>

      {/* Step-by-step login */}
      <motion.div variants={item}>
        <LoginStepper callbackUrl={callbackUrl} />
      </motion.div>
    </motion.div>
  )
}
