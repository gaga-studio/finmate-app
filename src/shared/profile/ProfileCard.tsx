import { EmojiIcon } from '../ui/EmojiIcon'
import type { ProfileSummary } from '../../data/types'

interface Props {
  profile: ProfileSummary
  className?: string
}

/** 프로필 공용 컴포넌트 — 피드 프로필 시트, (예정) 메이트/그룹 화면이 공유한다 */
export function ProfileCard({ profile, className }: Props) {
  return (
    <div className={`flex flex-col items-center text-center ${className ?? ''}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/5 text-3xl">
        <EmojiIcon emoji={profile.emoji} size={30} className="text-accent" strokeWidth={1.8} />
      </div>
      <p className="mt-2.5 text-title font-extrabold text-ink">{profile.nickname}</p>
      {profile.bio && <p className="mt-0.5 text-body text-ink-soft">{profile.bio}</p>}
      {profile.similarity !== undefined && (
        <p className="mt-1 text-body font-bold text-accent">
          나와 소비 성향 {Math.round(profile.similarity * 100)}% 유사
        </p>
      )}
      {profile.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {profile.badges.map((b) => (
            <span key={b} className="rounded-full bg-accent/10 px-2.5 py-1 text-caption font-bold text-accent">
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
