import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Heart, X } from 'lucide-react'
import { TOP3_TITLE, WrappedCardView } from '../my/wrapped/WrappedCardView'
import { WRAPPED } from '../../data/wrapped'
import { ART } from '../../data/art-manifest'
import { getPeriodRange } from '../../data/dates'
import { dramatic } from '../../shared/motion/springs'
import type { Story } from '../../data/types'

interface Props {
  story: Story
  onClose: () => void
  onProfile: (story: Story) => void
}

/**
 * 스토리 9:16 오버레이 — 그리드 썸네일과 layoutId를 공유해 확대.
 * 남의 카드라 저장/공유 대신 좋아요와 프로필 진입만 제공한다.
 */
export function StoryOverlay({ story, onClose, onProfile }: Props) {
  const [liked, setLiked] = useState(false)

  return createPortal(
    <div className="fixed inset-0 z-50">
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
              artSrc: ART.wrapped[story.artKey],
              top3: story.top3.map((r) => ({ key: r.label, ...r })),
              top3Title: TOP3_TITLE[story.metric],
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
            onClick={() => onProfile(story)}
            className="flex h-11 items-center gap-2 rounded-full bg-white/20 pl-2 pr-4 text-[13px] font-bold text-white backdrop-blur-md"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[13px]">
              {story.author.emoji}
            </span>
            {story.author.nickname}
          </button>
          <motion.button
            type="button"
            onClick={() => setLiked((v) => !v)}
            whileTap={{ scale: 0.88 }}
            className={`flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold backdrop-blur-md ${
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
      </motion.div>
    </div>,
    document.body,
  )
}
