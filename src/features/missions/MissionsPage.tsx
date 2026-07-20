import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell } from 'lucide-react'
import { PointCard } from './PointCard'
import { StreakCard } from './StreakCard'
import { MissionList } from './MissionList'
import { RecommendedList } from './RecommendedList'
import { RewardSheet } from './RewardSheet'
import { MISSIONS, PAST_MISSIONS, POINTS_BALANCE, RECOMMENDED_MISSIONS, STREAK_CHECK_REWARD } from '../../data/domain'
import type { Mission, RecommendedMission } from '../../data/types'
import { PageTitle } from '../../shared/ui/PageTitle'

type MissionTab = 'active' | 'history'

export function MissionsPage() {
  const [tab, setTab] = useState<MissionTab>('active')
  const [points, setPoints] = useState(POINTS_BALANCE)
  const [gain, setGain] = useState<{ amount: number; seq: number } | null>(null)
  const [todayChecked, setTodayChecked] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [missions, setMissions] = useState<Mission[]>(MISSIONS)
  const [recommended, setRecommended] = useState<RecommendedMission[]>(RECOMMENDED_MISSIONS)
  const [shopOpen, setShopOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const seqRef = useRef(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const earn = (amount: number, message: string) => {
    seqRef.current += 1
    setPoints((p) => p + amount)
    setGain({ amount, seq: seqRef.current })
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setToast(null)
      setGain(null)
    }, 2200)
  }

  const checkToday = () => {
    if (todayChecked) return
    setTodayChecked(true)
    earn(STREAK_CHECK_REWARD, '오늘도 예산 사수! +50P')
  }

  const completeQuiz = () => {
    if (quizDone) return
    setQuizDone(true)
    earn(60, '금융 퀴즈 완료! +60P')
  }

  const adopt = (item: RecommendedMission) => {
    setRecommended((list) => list.filter((r) => r.id !== item.id))
    setMissions((list) => [
      ...list,
      { id: item.id, emoji: item.emoji, title: item.title, reward: item.reward, kind: 'simple' },
    ])
    setToast(`'${item.title}' 미션 시작!`)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="relative min-h-full pb-6">
      <header className="relative flex items-center justify-between px-5 pb-3 pt-14">
        <PageTitle>미션</PageTitle>
        <img src="/finmate-logo.png" alt="FinMate" className="h-7 w-auto" />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 당근식 상단 탭 — 활동미션 / 지난 내역 */}
      <div className="flex border-b border-line px-5">
        {(
          [
            { value: 'active', label: '활동미션' },
            { value: 'history', label: '지난 내역' },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`relative flex-1 pb-2.5 pt-1 text-section font-bold ${
              tab === value ? 'text-ink' : 'text-ink-faint'
            }`}
          >
            {label}
            {tab === value && (
              <motion.span layoutId="mission-tab" className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-ink" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {tab === 'active' ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            <PointCard points={points} gain={gain} onOpenShop={() => setShopOpen(true)} />
            <StreakCard todayChecked={todayChecked} onCheckToday={checkToday} />
            <MissionList missions={missions} quizDone={quizDone} onQuizComplete={completeQuiz} />
            <RecommendedList items={recommended} onAdopt={adopt} />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
          >
            <MissionHistory />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shopOpen && <RewardSheet points={points} onClose={() => setShopOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-full bg-black/80 px-4 py-2 text-body font-semibold text-white"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 지난 내역 — 완료한 미션과 누적 획득 포인트 */
function MissionHistory() {
  const total = PAST_MISSIONS.reduce((sum, m) => sum + m.reward, 0)
  return (
    <section className="mx-5 mt-3" data-testid="mission-history">
      <div className="rounded-card bg-elevated p-5 shadow-float">
        <div className="flex items-baseline justify-between">
          <h2 className="text-title font-extrabold text-ink">지난 내역</h2>
          <p className="text-body font-bold text-point-ink">누적 +{total.toLocaleString('ko-KR')}P</p>
        </div>
        <div className="mt-2 flex flex-col">
          {PAST_MISSIONS.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-section">
                <EmojiIcon emoji={m.emoji} size={16} className="text-point-ink" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">{m.title}</p>
                <p className="mt-0.5 text-caption font-medium text-ink-faint">{m.completedAt} 완료</p>
              </div>
              <span className="rounded-full bg-point px-2.5 py-1 text-caption font-bold text-point-ink">
                +{m.reward}P
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-caption font-medium text-ink-faint">
        완료한 미션은 자동으로 기록돼요
      </p>
    </section>
  )
}
