import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { createPortal } from 'react-dom'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { motion } from 'motion/react'
import { dramatic } from '../../shared/motion/springs'
import { REWARD_ITEMS } from '../../data/domain'

interface Props {
  points: number
  onClose: () => void
}

/** 포인트 상점 — 교환 가능 여부만 보여주는 정적 바텀시트 */
export function RewardSheet({ points, onClose }: Props) {
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
        <div className="flex items-baseline justify-between">
          <h2 className="text-title font-extrabold text-ink">포인트 상점</h2>
          <p className="text-body font-bold text-point-ink">{points.toLocaleString('ko-KR')}P 보유</p>
        </div>
        <div className="mt-3">
          {REWARD_ITEMS.map((item) => {
            const affordable = points >= item.cost
            return (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-title">
                  <EmojiIcon emoji={item.emoji} size={36} className="text-point-ink" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-caption font-bold text-point-ink">
                    {item.cost.toLocaleString('ko-KR')}P
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!affordable}
                  className={`h-9 shrink-0 rounded-full px-4 text-body font-bold ${
                    affordable ? 'bg-point text-point-ink' : 'bg-ink/5 text-ink-faint'
                  }`}
                >
                  교환
                </button>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}
