import { useState } from 'react'
import { createPortal } from 'react-dom'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { motion } from 'motion/react'
import { ProfileCard } from '../../shared/profile/ProfileCard'
import { dramatic } from '../../shared/motion/springs'
import type { ProfileSummary } from '../../data/types'

interface Props {
  profile: ProfileSummary
  onClose: () => void
}

/** 상세 프로필 바텀시트 — 팔로우는 정적 토글 */
export function ProfileSheet({ profile, onClose }: Props) {
  const [following, setFollowing] = useState(false)

  return createPortal(
    <div className="absolute inset-0 z-[60]">
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 mx-auto max-w-[430px] rounded-t-sheet bg-elevated px-6 pb-10 pt-3"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={dramatic}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 700) onClose()
        }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <ProfileCard profile={profile} />
        <button
          type="button"
          onClick={() => setFollowing((v) => !v)}
          className={`mt-5 w-full rounded-full py-3 text-section font-bold transition-colors ${
            following ? 'bg-ink/5 text-ink-soft' : 'bg-accent text-white'
          }`}
        >
          {following ? '팔로잉' : '팔로우'}
        </button>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}
