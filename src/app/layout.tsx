import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import { DEFAULT_META } from '@/constants/meta'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  ...DEFAULT_META,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
