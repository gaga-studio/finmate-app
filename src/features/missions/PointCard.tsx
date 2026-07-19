import { AnimatePresence, motion } from 'motion/react'
import { Gift } from 'lucide-react'
import { AnimatedNumber } from '../../shared/ui/AnimatedNumber'
import { dramatic } from '../../shared/motion/springs'

interface Props {
  points: number
  /** 최근 적립 연출 — seq가 바뀔 때마다 +N 플로팅 */
  gain: { amount: number; seq: number } | null
  onOpenShop: () => void
}

export function PointCard({ points, gain, onOpenShop }: Props) {
  return (
    <div className="relative mx-5 flex items-center justify-between rounded-card bg-elevated p-5 shadow-float">
      <div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-point text-micro font-extrabold text-white">
            P
          </span>
          <span className="text-caption font-bold text-ink-soft">내 포인트</span>
        </div>
        <p className="relative mt-1.5 text-display font-extrabold text-ink tabular-nums">
          <AnimatedNumber value={points} format={(v) => Math.round(v).toLocaleString('ko-KR')} />
          <span className="ml-0.5 text-title text-point">P</span>
          <AnimatePresence>
            {gain && (
              <motion.span
                key={gain.seq}
                className="absolute -right-2 -top-3 text-body font-extrabold text-point"
                initial={{ y: 8, opacity: 0, scale: 0.8 }}
                animate={{ y: -10, opacity: 1, scale: 1 }}
                exit={{ y: -22, opacity: 0 }}
                transition={dramatic}
              >
                +{gain.amount}P
              </motion.span>
            )}
          </AnimatePresence>
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenShop}
        className="flex h-11 items-center gap-1.5 rounded-full bg-point/12 px-4 text-body font-bold text-point"
      >
        <Gift size={16} strokeWidth={2.4} />
        포인트 상점
      </button>
    </div>
  )
}
