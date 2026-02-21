'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'

/** Reduced-motion check — respects prefers-reduced-motion */
const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }
const gentle = { type: 'spring' as const, stiffness: 200, damping: 25 }

// ── Fade In ──
export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
}: {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Slide Up ──
export function SlideUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...gentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Scroll Reveal — animates when element enters viewport ──
export function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = 'up',
}: {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const offsets = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...gentle, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger Children — container that staggers child animations ──
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentle,
  },
}

export function StaggerChildren({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// ── Scroll Stagger — staggers children as they enter viewport ──
const scrollStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export function ScrollStagger({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={scrollStaggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScrollStaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// ── Page Transition wrapper ──
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Tap Scale — wraps an element with tap/hover micro-interaction ──
export function TapScale({
  children,
  className,
  scale = 0.98,
  hoverLift = true,
}: {
  children: ReactNode
  className?: string
  scale?: number
  hoverLift?: boolean
}) {
  return (
    <motion.div
      whileTap={{ scale }}
      whileHover={hoverLift ? { y: -2 } : undefined}
      transition={spring}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Re-export AnimatePresence for convenience
export { AnimatePresence, motion }
