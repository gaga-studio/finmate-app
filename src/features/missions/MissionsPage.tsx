import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell } from 'lucide-react'
import { PointCard } from './PointCard'
import { StreakCard } from './StreakCard'
import { MissionList } from './MissionList'
import { RecommendedList } from './RecommendedList'
import { RewardSheet } from './RewardSheet'
import { MISSIONS, POINTS_BALANCE, RECOMMENDED_MISSIONS, STREAK_CHECK_REWARD } from '../../data/domain'
import type { Mission, RecommendedMission } from '../../data/types'

export function MissionsPage() {
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
      <header className="flex items-center justify-between px-5 pb-3 pt-14">
        <h1 className="text-title font-extrabold tracking-tight text-ink">finmate</h1>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-ink shadow-soft"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      <PointCard points={points} gain={gain} onOpenShop={() => setShopOpen(true)} />
      <StreakCard todayChecked={todayChecked} onCheckToday={checkToday} />
      <MissionList missions={missions} quizDone={quizDone} onQuizComplete={completeQuiz} />
      <RecommendedList items={recommended} onAdopt={adopt} />

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
