import Card, { CardContent } from '@/components/ui/Card'
import type { AuthorAttributes, StrapiEntry } from '@/types'

interface AuthorBioProps {
  author: StrapiEntry<AuthorAttributes>
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
        <div className="w-14 h-14 rounded-full flex-shrink-0 bg-[var(--accent)] flex items-center justify-center">
          <span className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-headline)' }}>
            {initials}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-[var(--text)]">{a.name}</h4>
          {a.role && (
            <p className="text-sm text-[var(--muted)] mb-1">{a.role}</p>
          )}
          {a.bio && (
            <p className="text-sm text-[var(--muted)] line-clamp-3">
              {a.bio}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
