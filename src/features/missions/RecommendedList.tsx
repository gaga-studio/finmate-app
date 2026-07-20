import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { snappy } from '../../shared/motion/springs'
import type { RecommendedMission } from '../../data/types'

interface Props {
  items: RecommendedMission[]
  onAdopt: (item: RecommendedMission) => void
}

/** 추천 미션 — 해체분석 근거(reason)가 설득의 핵심. 담기 → 진행 중으로 이동 */
export function RecommendedList({ items, onAdopt }: Props) {
  return (
    <section className="mx-5 mt-3 rounded-card bg-elevated p-5 shadow-float">
      <div className="flex items-center gap-2">
        <h2 className="text-title font-extrabold text-ink">추천 미션</h2>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-caption font-bold text-accent">
          내 소비 분석 기반
        </span>
      </div>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 text-body font-medium text-ink-soft"
          >
            추천 미션을 전부 담았어요! 내일 새 추천이 도착해요.
          </motion.p>
        )}
        {items.map((r) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={snappy}
            className="flex items-center gap-3 py-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-section">
              <EmojiIcon emoji={r.emoji} size={27} className="text-point-ink" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-ink">{r.title}</p>
              <p className="mt-0.5 truncate text-caption font-medium text-ink-soft">{r.reason}</p>
            </div>
            <span className="shrink-0 text-body font-extrabold text-point-ink">+{r.reward}P</span>
            <motion.button
              type="button"
              onClick={() => onAdopt(r)}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-accent px-3 text-caption font-bold text-white"
            >
              <Plus size={13} strokeWidth={3} />
              담기
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}
