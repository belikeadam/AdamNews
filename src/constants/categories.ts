/** Category color system — per-category visual identity */

export interface CategoryColor {
  primary: string
  light: string
  dark: string
  text: string
  darkText: string
}

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  technology: {
    primary: '#2563eb',
    light: '#eff6ff',
    dark: '#1e3a5f',
    text: '#1d4ed8',
    darkText: '#60a5fa',
  },
  business: {
    primary: '#059669',
    light: '#ecfdf5',
    dark: '#1a3a2a',
    text: '#047857',
    darkText: '#34d399',
  },
  science: {
    primary: '#7c3aed',
    light: '#f5f3ff',
    dark: '#2a1a3a',
    text: '#6d28d9',
    darkText: '#a78bfa',
  },
  finance: {
    primary: '#d97706',
    light: '#fffbeb',
    dark: '#3a2a1a',
    text: '#b45309',
    darkText: '#fbbf24',
  },
  lifestyle: {
    primary: '#db2777',
    light: '#fdf2f8',
    dark: '#3a1a2a',
    text: '#be185d',
    darkText: '#f472b6',
  },
  general: {
    primary: '#8b0000',
    light: '#f5e6e6',
    dark: '#2a1a1a',
    text: '#8b0000',
    darkText: '#c45050',
  },
}

export const DEFAULT_CATEGORY_COLOR: CategoryColor = CATEGORY_COLORS.general

export function getCategoryColor(slug: string | undefined | null): CategoryColor {
  if (!slug) return DEFAULT_CATEGORY_COLOR
  return CATEGORY_COLORS[slug.toLowerCase()] || DEFAULT_CATEGORY_COLOR
}
