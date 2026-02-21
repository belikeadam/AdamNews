import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Inter, Playfair_Display } from 'next/font/google'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import ScrollToTop from '@/components/shared/ScrollToTop'
import { DEFAULT_META } from '@/constants/meta'
import { getCategories } from '@/lib/api/strapi'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  ...DEFAULT_META,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Fetch categories for nav — fallback to empty if Strapi is down
  let categories: { name: string; slug: string }[] = []
  try {
    const res = await getCategories()
    categories = res.data.map((c) => ({
      name: c.attributes.name,
      slug: c.attributes.slug,
    }))
  } catch {
    // Strapi unavailable — nav will show static fallback
  }

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
        <Providers>
          <Suspense>
            <Navbar categories={categories} />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}
