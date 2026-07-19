import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayCardsOverlay } from './DayCardsOverlay'
import { DIARY_TODAY } from '../../data/diary'
import { getDiaryDays } from '../../data/selectors'
import { formatKrwCompact } from '../../shared/format/krw'
import { snappy } from '../../shared/motion/springs'

export function DiaryPage() {
  const [month, setMonth] = useState(7)
  const [open, setOpen] = useState(false)
  const { days, totalIncome, totalSpend } = getDiaryDays()

  return (
    <div className="relative min-h-full pb-6">
      <header className="flex items-center justify-between px-5 pb-3 pt-14">
        <img src="/finmate-logo.png" alt="FinMate" className="h-7 w-auto" />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 월 네비 */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setMonth(6)}
          disabled={month === 6}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft disabled:opacity-30"
          aria-label="이전 달"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="w-16 text-center text-title font-extrabold text-ink">{month}월</h1>
        <button
          type="button"
          onClick={() => setMonth(7)}
          disabled={month === 7}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft disabled:opacity-30"
          aria-label="다음 달"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {month === 6 ? (
          <motion.div
            key="june"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={snappy}
            className="px-5 pt-16 text-center"
          >
            <p className="text-section font-bold text-ink-soft">아직 기록이 없는 달이에요</p>
            <p className="mt-2 text-body font-medium text-ink-faint">
              FinMate와 함께한 첫 달은 7월!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="july"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={snappy}
          >
            {/* 월 요약 */}
            <p className="mt-1 text-center text-caption font-semibold text-ink-soft">
              기록 {days.length}일 · 수입 <b className="text-rise">+{formatKrwCompact(totalIncome)}</b> ·
              지출 <b className="text-fall">-{formatKrwCompact(totalSpend)}</b>
            </p>

            {/* 최신순 3열 그리드 — 오늘만 이미지·탭 가능 */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 px-5">
              {days.map((d, i) => {
                const isToday = d.day === DIARY_TODAY.day
                return (
                  <motion.div
                    key={d.day}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ ...snappy, delay: Math.min(i * 0.025, 0.3) }}
                  >
                    {isToday ? (
                      <motion.button
                        type="button"
                        layoutId={`diary-${d.day}`}
                        onClick={() => setOpen(true)}
                        whileTap={{ scale: 0.96 }}
                        className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl text-left shadow-soft ring-2 ring-accent"
                        style={{ visibility: open ? 'hidden' : 'visible' }}
                      >
                        <img
                          src={DIARY_TODAY.art}
                          alt=""
                          draggable={false}
                          className="absolute inset-0 h-full w-full select-none object-cover"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 text-micro font-bold text-white backdrop-blur-sm">
                          {d.day}일 · 오늘
                        </span>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 pt-5">
                          <TileAmounts income={d.income} spend={d.spend} onImage />
                        </div>
                      </motion.button>
                    ) : (
                      <div className="flex aspect-[3/4] w-full flex-col justify-between rounded-2xl bg-ink/4 p-2.5">
                        <span className="text-body font-extrabold text-ink-faint">{d.day}일</span>
                        <TileAmounts income={d.income} spend={d.spend} />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <p className="mt-4 text-center text-caption font-medium text-ink-faint">
              하루가 끝나면 자동으로 기록돼요
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{open && <DayCardsOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </div>
  )
}

function TileAmounts({ income, spend, onImage }: { income: number; spend: number; onImage?: boolean }) {
  return (
    <div className="flex flex-col">
      {income > 0 && (
        <span className={`text-micro font-extrabold ${onImage ? 'text-white' : 'text-rise'}`}>
          +{formatKrwCompact(income)}
        </span>
      )}
      <span className={`text-micro font-bold ${onImage ? 'text-white/85' : 'text-fall'}`}>
        {spend > 0 ? `-${formatKrwCompact(spend)}` : '무지출'}
      </span>
    </div>
  )
}
