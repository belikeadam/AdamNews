export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Technology', href: '/?category=technology' },
  { label: 'Business', href: '/?category=business' },
  { label: 'Science', href: '/?category=science' },
  { label: 'General', href: '/?category=general' },
  { label: 'Search', href: '/search' },
  { label: 'AI Digest', href: '/digest' },
  { label: 'Plans', href: '/plans' },
  { label: 'API Docs', href: '/api-docs' },
] as const

export const DASHBOARD_NAV = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Posts', href: '/dashboard/posts', icon: 'FileText' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Subscribers', href: '/dashboard/subscribers', icon: 'Users' },
] as const

export const MOBILE_NAV = [
  { label: 'Home', href: '/', icon: 'Home' },
  { label: 'AI Digest', href: '/digest', icon: 'Sparkles' },
  { label: 'Plans', href: '/plans', icon: 'CreditCard' },
  { label: 'Login', href: '/login', icon: 'User' },
] as const
