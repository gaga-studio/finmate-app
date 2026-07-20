import { EmojiIcon } from '../ui/EmojiIcon'
import type { ProfileSummary } from '../../data/types'

interface Props {
  profile: ProfileSummary
  className?: string
  compactName?: boolean
  similarityRing?: boolean
}

/** 프로필 공용 컴포넌트 — 피드 프로필 시트, (예정) 메이트/그룹 화면이 공유한다 */
export function ProfileCard({ profile, className, compactName, similarityRing }: Props) {
  const similarityPct = profile.similarity === undefined ? undefined : Math.round(profile.similarity * 100)
  const ringRadius = 40
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset =
    similarityPct === undefined ? ringCircumference : ringCircumference * (1 - similarityPct / 100)

  return (
    <div className={`flex flex-col items-center text-center ${className ?? ''}`}>
      <div className={similarityRing && similarityPct !== undefined ? 'relative h-[96px] w-[96px]' : ''}>
        {similarityRing && similarityPct !== undefined && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 92 92"
            aria-label={`나와 소비 성향 ${similarityPct}% 유사`}
          >
            <circle cx="46" cy="46" r={ringRadius} fill="none" stroke="var(--color-line)" strokeWidth="5" />
            <circle
              cx="46"
              cy="46"
              r={ringRadius}
              fill="none"
              stroke="var(--color-brand)"
              strokeLinecap="round"
              strokeWidth="5"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
            />
          </svg>
        )}
        <div
          className={`clay-card flex items-center justify-center rounded-full ${
            similarityRing && similarityPct !== undefined
              ? 'absolute left-1/2 top-1/2 h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2'
              : 'h-16 w-16'
          }`}
        >
          <EmojiIcon emoji={profile.emoji} avatarId={profile.id} size={60} className="text-accent" strokeWidth={1.8} />
        </div>
        {similarityRing && similarityPct !== undefined && (
          <span className="absolute bottom-0 left-1/2 rounded-full bg-accent px-2.5 py-1 text-caption font-extrabold leading-none text-white shadow-soft -translate-x-1/2">
            {similarityPct}%
          </span>
        )}
      </div>
      <p className={`mt-2.5 font-extrabold text-ink ${compactName ? 'text-[28px] leading-none' : 'text-display'}`}>
        {profile.nickname}
      </p>
      {profile.bio && <p className="mt-0.5 text-body text-ink-soft">{profile.bio}</p>}
      {profile.similarity !== undefined && (
        <p className="mt-1 text-body font-bold text-saving">
          {similarityRing ? '나와 소비 성향 유사' : `나와 소비 성향 ${similarityPct}% 유사`}
        </p>
      )}
      {profile.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {profile.badges.map((b) => (
            <span key={b} className="rounded-full bg-point px-2.5 py-1 text-caption font-bold text-point-ink">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
