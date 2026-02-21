import Card, { CardContent } from '@/components/ui/Card'
import type { AuthorAttributes, StrapiEntry } from '@/types'

interface AuthorBioProps {
  author: StrapiEntry<AuthorAttributes>
}

function VerifiedBadge() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="var(--accent)"
      className="inline-block ml-1 -mt-0.5"
      aria-label="Verified author"
    >
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

export default function AuthorBio({ author }: AuthorBioProps) {
  const { attributes: a } = author
  const initials = a.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full flex-shrink-0 bg-[var(--accent)] flex items-center justify-center">
          <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="font-semibold text-[var(--text)]">{a.name}</h4>
            <VerifiedBadge />
          </div>
          {a.role && (
            <p className="text-sm text-[var(--accent)] font-medium mb-1">{a.role}</p>
          )}
          {a.bio && (
            <p className="text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
              {a.bio}
            </p>
          )}
          {a.email && (
            <a
              href={`mailto:${a.email}`}
              className="inline-block mt-2 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              Contact author
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
