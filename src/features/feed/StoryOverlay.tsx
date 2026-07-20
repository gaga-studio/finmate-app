import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, UserRound, X } from 'lucide-react'
import { TOP3_TITLE, WrappedCardView } from '../my/wrapped/WrappedCardView'
import { WRAPPED } from '../../data/wrapped'
import { ART } from '../../data/art-manifest'
import { getPeriodRange } from '../../data/dates'
import { dramatic } from '../../shared/motion/springs'
import type { Story } from '../../data/types'

interface Props {
  story: Story
  onClose: () => void
}

/**
 * 스토리 9:16 오버레이 — 그리드 썸네일과 layoutId를 공유해 확대.
 * 닉네임을 누르면 아래에 [프로필] [팔로우] 버튼이 펼쳐진다.
 */
export function StoryOverlay({ story, onClose }: Props) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [following, setFollowing] = useState(false)

  return createPortal(
    <div className="absolute inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 w-[min(84vw,340px)] -translate-x-1/2 -translate-y-1/2"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.55 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 800) onClose()
        }}
      >
        <motion.div
          layoutId={`story-${story.id}`}
          transition={dramatic}
          className="overflow-hidden rounded-sheet shadow-float"
        >
          <WrappedCardView
            data={{
              title: WRAPPED[story.metric][story.period].title,
              rangeLabel: getPeriodRange(story.period).label,
              headline: story.headline,
              subline: story.subline,
              metric: story.metric,
              artSrc: ART.stories[story.artKey],
              top3: story.top3.map((r) => ({ key: r.label, ...r })),
              top3Title: story.top3Title ?? TOP3_TITLE[story.metric],
            }}
          />
        </motion.div>

        {/* 작성자 · 좋아요 · 닫기 */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.28, ...dramatic }}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`flex h-11 items-center gap-2 rounded-full pl-2 pr-4 text-body font-bold backdrop-blur-md ${
              expanded ? 'bg-white text-ink' : 'bg-white/20 text-white'
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-body">
              <EmojiIcon emoji={story.author.emoji} avatarId={story.author.id} size={26} />
            </span>
            {story.author.nickname}
          </button>
          <motion.button
            type="button"
            onClick={() => setLiked((v) => !v)}
            whileTap={{ scale: 0.88 }}
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-body font-bold backdrop-blur-md ${
              liked ? 'bg-white text-danger' : 'bg-white/20 text-white'
            }`}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            {story.likes + (liked ? 1 : 0)}
          </motion.button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </motion.div>

        {/* 닉네임 탭 → 프로필/팔로우 인라인 버튼 */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="mt-2.5 flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={dramatic}
            >
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate(`/mate/${story.author.id}`)
                }}
                className="flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-body font-bold text-ink"
              >
                <UserRound size={15} />
                프로필
              </button>
              <button
                type="button"
                onClick={() => setFollowing((v) => !v)}
                className={`flex h-10 items-center rounded-full px-4 text-body font-bold backdrop-blur-md ${
                  following ? 'bg-white/25 text-white' : 'bg-accent text-white'
                }`}
              >
                {following ? '팔로잉 ✓' : '팔로우'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}
