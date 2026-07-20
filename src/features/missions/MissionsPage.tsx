import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, Check, X } from 'lucide-react'
import { PointCard } from './PointCard'
import { StreakCard } from './StreakCard'
import { MissionList } from './MissionList'
import { RecommendedList } from './RecommendedList'
import { RewardSheet } from './RewardSheet'
import { MISSIONS, PAST_MISSIONS, POINTS_BALANCE, QUIZ, RECOMMENDED_MISSIONS, STREAK_CHECK_REWARD } from '../../data/domain'
import type { Mission, RecommendedMission } from '../../data/types'
import { PageTitle } from '../../shared/ui/PageTitle'
import { overlayTarget } from '../../shared/ui/overlayTarget'

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
  const [quizOpen, setQuizOpen] = useState(false)
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

  const openQuiz = () => {
    if (quizDone) return
    setQuizOpen(true)
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
          className="clay-card flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-95"
          aria-label="알림"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* 당근식 상단 탭 — 활동미션 / 지난 내역 */}
      <div className="mx-5 flex rounded-full bg-point/45 p-1 shadow-soft">
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
            className={`relative flex-1 rounded-full py-2 text-section font-bold transition-transform active:scale-[0.98] ${
              tab === value ? 'text-saving' : 'text-ink-faint'
            }`}
          >
            {tab === value && (
              <motion.span layoutId="mission-tab" className="clay-pressed absolute inset-0 rounded-full bg-elevated" />
            )}
            <span className="relative">{label}</span>
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
            <MissionList missions={missions} quizDone={quizDone} onQuizComplete={openQuiz} />
            <PointCard points={points} gain={gain} onOpenShop={() => setShopOpen(true)} />
            <StreakCard todayChecked={todayChecked} onCheckToday={checkToday} />
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
        {quizOpen && (
          <QuizSheet
            onClose={() => setQuizOpen(false)}
            onComplete={() => {
              setQuizOpen(false)
              completeQuiz()
            }}
          />
        )}
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

function QuizSheet({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState<boolean | null>(null)
  const quiz = QUIZ[step]
  const correct = picked !== null && picked === quiz.answer
  const last = step === QUIZ.length - 1

  const next = () => {
    if (!last) {
      setStep((s) => s + 1)
      setPicked(null)
      return
    }
    onComplete()
  }

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
        className="absolute inset-x-0 bottom-0 max-h-[76%] overflow-y-auto rounded-t-sheet bg-surface px-5 pb-10 pt-3 shadow-float [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption font-bold text-invest">투자 O/X 퀴즈</p>
            <h2 className="mt-0.5 text-title font-extrabold text-ink">
              {step + 1} / {QUIZ.length}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="clay-card flex h-9 w-9 items-center justify-center rounded-full text-ink"
            aria-label="퀴즈 닫기"
          >
            <X size={16} />
          </button>
        </div>

        <section className="clay-card mt-4 rounded-card p-5">
          <p className="min-h-[44px] text-section font-bold leading-relaxed text-ink">{quiz.question}</p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {([true, false] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setPicked(v)}
                className={`flex h-16 items-center justify-center rounded-2xl text-display font-extrabold transition-transform active:scale-[0.96] ${
                  v ? 'bg-rise/10 text-rise' : 'bg-fall/10 text-fall'
                } ${picked === v ? 'ring-2 ring-current' : ''}`}
              >
                {v ? 'O' : 'X'}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {picked !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4"
              >
                <p className={`flex items-center gap-1.5 text-body font-extrabold ${correct ? 'text-saving' : 'text-fall'}`}>
                  {correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                  {correct ? '정답!' : `정답은 ${quiz.answer ? 'O' : 'X'}`}
                </p>
                <p className="mt-1 text-caption font-medium leading-relaxed text-ink-soft">{quiz.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <button
          type="button"
          disabled={picked === null}
          onClick={next}
          className="clay-cta mt-4 flex h-12 w-full items-center justify-center rounded-[18px] text-section font-bold disabled:opacity-35"
        >
          {last ? '미션 완료' : '다음 문제'}
        </button>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}

/** 지난 내역 — 완료한 미션과 누적 획득 포인트 */
function MissionHistory() {
  const total = PAST_MISSIONS.reduce((sum, m) => sum + m.reward, 0)
  return (
    <section className="mx-5 mt-3" data-testid="mission-history">
      <div className="clay-card rounded-card p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-title font-extrabold text-ink">지난 내역</h2>
          <p className="text-body font-bold text-point-ink">누적 +{total.toLocaleString('ko-KR')}P</p>
        </div>
        <div className="mt-2 flex flex-col">
          {PAST_MISSIONS.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-line/60 py-3 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-point/55 text-section">
                {m.emoji}
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
