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
      {stories.length === 0 && (
        <p className="col-span-3 py-10 text-center text-body font-medium text-ink-soft">
          이 조건을 모두 만족하는 스토리가 없어요
        </p>
      )}
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
                  {/* 좋아요 뱃지 — 작성자 줄의 폭을 닉네임에 양보하고 썸네일 위로 */}
                  <span className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/45 px-1.5 py-0.5 text-micro font-bold text-white backdrop-blur-sm">
                    <Heart size={10} strokeWidth={2.4} fill="currentColor" />
                    {s.likes}
                  </span>
                  <p className="absolute inset-x-0 bottom-0 whitespace-pre-line bg-gradient-to-t from-black/55 to-transparent p-2 pt-5 text-micro font-bold leading-tight text-white">
                    {s.headline}
                  </p>
                </ArtOrGradient>
              </motion.button>
            )}
            <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/5 text-caption">
                <EmojiIcon emoji={s.author.emoji} avatarId={s.author.id} size={22} className="text-ink-soft" />
              </span>
              <span className="min-w-0 flex-1 truncate text-body font-extrabold text-ink-soft">
                {s.author.nickname}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
