import { AnimatePresence, motion } from 'motion/react'
import { Check, ChevronRight } from 'lucide-react'
import { snappy } from '../../shared/motion/springs'
import { formatKrw } from '../../shared/format/krw'
import { getMissionProgress } from '../../data/selectors'
import type { Mission } from '../../data/types'

interface Props {
  missions: Mission[]
  quizDone: boolean
  onQuizComplete: () => void
}

/** 진행 중인 미션 — 진행률은 거래 파생, 퀴즈는 탭 완료형 */
export function MissionList({ missions, quizDone, onQuizComplete }: Props) {
  return (
    <section className="mx-5 mt-3 rounded-card bg-elevated p-5 shadow-float">
      <h2 className="text-section font-bold text-ink">진행 중인 미션</h2>
      <AnimatePresence mode="popLayout" initial={false}>
        {missions.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={snappy}
          >
            <MissionRow mission={m} quizDone={quizDone} onQuizComplete={onQuizComplete} />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  )
}

function MissionRow({
  mission,
  quizDone,
  onQuizComplete,
}: {
  mission: Mission
  quizDone: boolean
  onQuizComplete: () => void
}) {
  const isQuiz = mission.kind === 'quiz'
  const done = isQuiz && quizDone

  const body = (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink/5 text-section">
        {done ? <Check size={18} strokeWidth={3} className="text-point-ink" /> : mission.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-body font-semibold ${done ? 'text-ink-faint line-through' : 'text-ink'}`}>
          {mission.title}
        </p>
        <MissionSub mission={mission} done={done} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className={`text-body font-extrabold ${done ? 'text-point-ink' : 'text-point-ink'}`}>
          +{mission.reward}P
        </span>
        {isQuiz && !done && <ChevronRight size={15} className="text-ink-faint" />}
      </div>
    </div>
  )

  if (isQuiz && !done) {
    return (
      <motion.button type="button" onClick={onQuizComplete} whileTap={{ scale: 0.98 }} className="block w-full text-left">
        {body}
      </motion.button>
    )
  }
  return body
}

function MissionSub({ mission, done }: { mission: Mission; done: boolean }) {
  if (done) {
    return <p className="text-caption font-medium text-point-ink">완료! 포인트 적립됨</p>
  }
  if (mission.kind === 'quiz') {
    const p = getMissionProgress('quiz')
    return (
      <p className="mt-0.5 text-caption font-medium text-ink-soft">
        {p.current} / {p.target} 문제 · 탭해서 마저 풀기
      </p>
    )
  }
  if (mission.kind === 'simple') {
    return <p className="mt-0.5 text-caption font-medium text-ink-soft">오늘 담은 미션 · 내일부터 판정</p>
  }
  const p = getMissionProgress(mission.kind)
  return (
    <div className="mt-1.5">
      <div className="h-1 overflow-hidden rounded-full bg-ink/8">
        <motion.div
          className={`h-full rounded-full ${mission.kind === 'daily-budget' && p.pct >= 1 ? 'bg-danger' : 'bg-point-ink'}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: p.pct }}
          transition={{ ...snappy, delay: 0.2 }}
          style={{ originX: 0 }}
        />
      </div>
      <p className="mt-1 text-caption font-medium text-ink-soft">
        {formatKrw(p.current)} / {formatKrw(p.target)}
        {mission.kind === 'daily-budget' && ' 한도'}
      </p>
    </div>
  )
}
