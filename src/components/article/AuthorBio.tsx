import Image from 'next/image'
import Card, { CardContent } from '@/components/ui/Card'
import { getStrapiMediaUrl } from '@/lib/utils'
import type { AuthorAttributes, StrapiEntry } from '@/types'

interface AuthorBioProps {
  author: StrapiEntry<AuthorAttributes>
}

export default function AuthorBio({ author }: AuthorBioProps) {
  const { attributes: a } = author
  const avatarUrl = getStrapiMediaUrl(a.avatar?.data?.attributes?.url)

  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[var(--surface-2)]">
          <Image
            src={avatarUrl}
            alt={a.name}
            fill
            className="object-cover"
            sizes="56px"
          />
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
