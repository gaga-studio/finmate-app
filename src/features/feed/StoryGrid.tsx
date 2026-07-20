import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { AnimatePresence, motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { ArtOrGradient } from '../../shared/ui/ArtOrGradient'
import { ART } from '../../data/art-manifest'
import { snappy } from '../../shared/motion/springs'
import type { Story } from '../../data/types'

interface Props {
  stories: Story[]
  /** 오버레이가 열린 스토리는 썸네일을 비워 layoutId 충돌을 막는다 */
  openId: string | null
  onOpen: (id: string) => void
}

/** 오늘의 스토리 3열 그리드 — 카드 탭 시 layoutId 공유로 오버레이 확대 */
export function StoryGrid({ stories, openId, onOpen }: Props) {
  return (
    <div className="mt-2.5 grid grid-cols-3 gap-2.5 px-5">
      <AnimatePresence mode="popLayout" initial={false}>
        {stories.map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={snappy}
          >
            {openId === s.id ? (
              <div className="aspect-[3/4] rounded-2xl bg-ink/5" />
            ) : (
              <motion.button
                type="button"
                layoutId={`story-${s.id}`}
                onClick={() => onOpen(s.id)}
                whileTap={{ scale: 0.96 }}
                className="block w-full overflow-hidden rounded-2xl text-left shadow-soft"
              >
                <ArtOrGradient
                  src={ART.stories[s.artKey]}
                  palette={s.metric}
                  className="aspect-[3/4] w-full"
                >
                  <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 pt-5 text-micro font-bold leading-tight text-white">
                    {s.headline.split('\n')[0].replace(/[,.]$/, '')}…
                  </p>
                </ArtOrGradient>
              </motion.button>
            )}
            <div className="mt-1.5 flex items-center gap-1 px-0.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/5 text-micro">
                <EmojiIcon emoji={s.author.emoji} avatarId={s.author.id} size={16} className="text-ink-soft" />
              </span>
              <span className="min-w-0 flex-1 truncate text-micro font-semibold text-ink-soft">
                {s.author.nickname}
              </span>
              <span className="flex shrink-0 items-center gap-0.5 text-micro font-semibold text-ink-soft">
                <Heart size={11} strokeWidth={2.4} />
                {s.likes}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
