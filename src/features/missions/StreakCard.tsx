import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { snappy } from '../../shared/motion/springs'
import { getKeepStreak, getStreakFlame, type StreakDot } from '../../data/selectors'
import { PERIOD_LABEL, PERIODS } from '../my/myState'
import type { Period } from '../../data/types'

interface Props {
  /** 오늘 도트 체크 여부 (일간 뷰) */
  todayChecked: boolean
  onCheckToday: () => void
}

/** "예산을 지켜라" 챌린지 — 일/주/월 판정은 전부 거래 파생 */
export function StreakCard({ todayChecked, onCheckToday }: Props) {
  const [period, setPeriod] = useState<Period>('daily')

  // 오늘 체크 시 current → pass로 치환되고, flame은 치환된 도트에서 그대로 파생된다
  const dots = getKeepStreak(period).map((d) =>
    period === 'daily' && d.status === 'current' && todayChecked ? { ...d, status: 'pass' as const } : d,
  )
  const flame = getStreakFlame(dots)

  return (
    <section className="clay-card mx-5 mt-3 rounded-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-title font-extrabold text-ink">예산을 지켜라</h2>
          <span className="rounded-full bg-point px-2 py-0.5 text-caption font-bold text-point-ink">
            🔥 {flame}연속
          </span>
        </div>
        <SegmentedControl
          id="streak"
          items={PERIODS.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={period}
          className="mt-4 flex justify-between"
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={snappy}
        >
          {dots.map((d, i) => (
            <Dot
              key={d.label}
              dot={d}
              delay={i * 0.04}
              onTap={period === 'daily' && d.status === 'current' ? onCheckToday : undefined}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {period === 'daily' && !todayChecked && (
        <p className="mt-3 text-caption font-medium text-ink-soft">
          오늘 예산 안에 있어요 — 도트를 눌러 오늘을 지켜내세요! <b className="text-point-ink">+50P</b>
        </p>
      )}
    </section>
  )
}

function Dot({ dot, delay, onTap }: { dot: StreakDot; delay: number; onTap?: () => void }) {
  const circle = (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...snappy, delay }}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
        dot.status === 'pass'
          ? 'bg-point text-point-ink'
          : dot.status === 'fail'
            ? 'bg-ink/8 text-ink-faint'
            : dot.status === 'current'
              ? 'bg-point text-point-ink ring-1 ring-point-ink/30'
              : 'border border-dashed border-line'
      }`}
    >
      {dot.status === 'pass' && <Check size={16} strokeWidth={3} />}
      {dot.status === 'fail' && <X size={15} strokeWidth={3} />}
      {dot.status === 'current' && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full ring-1 ring-point-ink"
            animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, repeatDelay: 0.6 }}
          />
          <span className="text-caption font-extrabold">!</span>
        </>
      )}
    </motion.div>
  )

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`text-micro font-semibold ${dot.status === 'current' ? 'text-point-ink' : 'text-ink-soft'}`}
      >
        {dot.label}
      </span>
      {onTap ? (
        <motion.button type="button" onClick={onTap} whileTap={{ scale: 0.85 }}>
          {circle}
        </motion.button>
      ) : (
        circle
      )}
    </div>
  )
}
