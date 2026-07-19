import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { formatKrw } from '../../shared/format/krw'
import { getDailySummary } from '../../data/selectors'
import { QUIZ, RECOMMENDED_MISSIONS } from '../../data/domain'
import {
  HABIT_MISSION,
  SAVING_SLIDER,
  makeSavingProjection,
  type InsightMsg,
  type InsightWidget,
} from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

interface Props {
  messages: InsightMsg[]
  typing: boolean
  /** 칩 탭 → 입력창에 템플릿 삽입 */
  onChip: (text: string) => void
  /** 추천옵션 탭 → 그 문장을 즉시 답변으로 전송 */
  onOption: (text: string) => void
  /** 슬라이더 이동 → 상단 차트 갱신 */
  onSlider: (monthly: number) => void
  /** 리포트 생성 버튼 → 리포트 오버레이 */
  onReport: (variant?: 'macbook') => void
  /** 메이트/그룹 선택지 → 해당 종류만 담긴 비교 바텀시트 열기 */
  onComparePick: (kind: 'mate' | 'group') => void
  /** 읽기 전용(저장된 대화 다시보기) — 위젯 조작 비활성 */
  readOnly?: boolean
}

export function ChatThread({ messages, typing, onChip, onOption, onSlider, onReport, onComparePick, readOnly }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, typing])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col gap-2.5">
        {messages.map((m, i) => (
          <Bubble
            key={m.id}
            msg={m}
            showAvatar={m.role === 'ai' && messages[i - 1]?.role !== 'ai'}
            onChip={onChip}
            onOption={onOption}
            onSlider={onSlider}
            onReport={onReport}
            onComparePick={onComparePick}
            readOnly={readOnly}
          />
        ))}
        {typing && <TypingIndicator />}
      </div>
    </div>
  )
}

function Bubble({
  msg,
  showAvatar,
  onChip,
  onOption,
  onSlider,
  onReport,
  onComparePick,
  readOnly,
}: {
  msg: InsightMsg
  showAvatar: boolean
  onChip: (text: string) => void
  onOption: (text: string) => void
  onSlider: (monthly: number) => void
  onReport: (variant?: 'macbook') => void
  onComparePick: (kind: 'mate' | 'group') => void
  readOnly?: boolean
}) {
  if (msg.role === 'user') {
    return (
      <motion.div
        className="max-w-[78%] self-end rounded-2xl rounded-tr-md bg-accent px-3.5 py-2.5 text-body font-medium text-white"
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={snappy}
      >
        {msg.text}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="flex items-start gap-2"
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={snappy}
    >
      <Avatar visible={showAvatar} />
      <div className="flex max-w-[82%] flex-col gap-2">
        {msg.text && (
          <div className="whitespace-pre-line rounded-2xl rounded-tl-md bg-elevated px-3.5 py-2.5 text-body font-medium text-ink shadow-soft">
            {msg.text}
          </div>
        )}
        {msg.widget && (
          <Widget
            widget={msg.widget}
            onChip={onChip}
            onOption={onOption}
            onSlider={onSlider}
            onReport={onReport}
            onComparePick={onComparePick}
            readOnly={readOnly}
          />
        )}
      </div>
    </motion.div>
  )
}

function Avatar({ visible }: { visible: boolean }) {
  return (
    <div
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-invest text-[13px] ${visible ? '' : 'invisible'}`}
      aria-hidden
    >
      ✨
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <Avatar visible />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-elevated px-3.5 py-3 shadow-soft">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-ink-faint"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}

function Widget({
  widget,
  onChip,
  onOption,
  onSlider,
  onReport,
  onComparePick,
  readOnly,
}: {
  widget: InsightWidget
  onChip: (text: string) => void
  onOption: (text: string) => void
  onSlider: (monthly: number) => void
  onReport: (variant?: 'macbook') => void
  onComparePick: (kind: 'mate' | 'group') => void
  readOnly?: boolean
}) {
  if (widget.type === 'summary') return <SummaryCard />
  if (widget.type === 'slider') return <SliderWidget onSlider={onSlider} readOnly={readOnly} />
  if (widget.type === 'quiz') return <QuizWidget quizId={widget.quizId} readOnly={readOnly} />
  if (widget.type === 'mission') return <MissionWidget missionId={widget.missionId} readOnly={readOnly} />
  if (widget.type === 'options') return <OptionsWidget options={widget.options} onOption={onOption} readOnly={readOnly} />
  if (widget.type === 'compare-picker') return <ComparePickerWidget onComparePick={onComparePick} readOnly={readOnly} />
  if (widget.type === 'mission-accept') return <MissionAcceptWidget onAccept={onOption} readOnly={readOnly} />
  if (widget.type === 'report') return <ReportWidget variant={widget.variant} onReport={onReport} readOnly={readOnly} />
  return (
    <div className="flex flex-wrap gap-1.5">
      {widget.chips.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => !readOnly && onChip(c)}
          className="rounded-full border border-accent/30 bg-accent/8 px-3 py-1.5 text-caption font-bold text-accent"
        >
          {c}
        </button>
      ))}
    </div>
  )
}

/** 추천옵션 — 탭하면 그 문장이 즉시 답변으로 전송, 한 번 고르면 잠긴다 */
function OptionsWidget({
  options,
  onOption,
  readOnly,
}: {
  options: string[]
  onOption: (text: string) => void
  readOnly?: boolean
}) {
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-start gap-1.5" data-testid="options-widget">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={readOnly || picked !== null}
          onClick={() => {
            setPicked(o)
            onOption(o)
          }}
          className={`rounded-full px-3.5 py-2 text-body font-bold transition-opacity ${
            picked === o
              ? 'bg-accent text-white'
              : 'border border-accent/35 bg-elevated text-accent shadow-soft'
          } ${picked !== null && picked !== o ? 'opacity-35' : ''}`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** 메이트/그룹 선택지 — 고른 종류만 담긴 비교 바텀시트를 연다 */
function ComparePickerWidget({
  onComparePick,
  readOnly,
}: {
  onComparePick: (kind: 'mate' | 'group') => void
  readOnly?: boolean
}) {
  const items = [
    { kind: 'mate' as const, label: '🤝 메이트 고르기' },
    { kind: 'group' as const, label: '👥 그룹 고르기' },
  ]
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="compare-picker">
      {items.map(({ kind, label }) => (
        <button
          key={kind}
          type="button"
          disabled={readOnly}
          onClick={() => onComparePick(kind)}
          className="rounded-full border border-accent/35 bg-elevated px-3.5 py-2 text-body font-bold text-accent shadow-soft"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** 리포트 생성 — 리포트 오버레이 화면을 연다 */
function ReportWidget({
  variant,
  onReport,
  readOnly,
}: {
  variant?: 'macbook'
  onReport: (variant?: 'macbook') => void
  readOnly?: boolean
}) {
  const macbook = variant === 'macbook'
  return (
    <button
      type="button"
      disabled={readOnly}
      onClick={() => onReport(variant)}
      className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-elevated px-4 py-3 shadow-soft"
      data-testid="report-widget"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-[17px]">
        {macbook ? '💻' : '📋'}
      </span>
      <span className="text-left">
        <span className="block text-body font-bold text-ink">
          {macbook ? '7월 예상 리포트 보기' : '7월 리포트 보기'}
        </span>
        <span className="block text-caption font-medium text-ink-soft">
          {macbook ? '맥북 M5 프로 반영 시뮬레이션' : '소비 · 저축 · 투자 한 장 정리'}
        </span>
      </span>
      <ChevronRight size={15} className="ml-1 text-ink-faint" />
    </button>
  )
}

/** 오늘의 총평 — 마이 탭과 동일 셀렉터 수치, '자세히'로 근거 펼침 */
function SummaryCard() {
  const [open, setOpen] = useState(false)
  const s = getDailySummary()
  const lines = [
    {
      emoji: '☕️',
      text: `소비 ${formatKrw(s.spent)} · 예산 ${s.budgetLeftPct}% 남김`,
      detail: `오늘 1위 ${s.top.merchant} ${formatKrw(s.top.amount)} — 한도 안 방어 성공!`,
    },
    {
      emoji: '✈️',
      text: `파리 자금 +${formatKrw(s.savingDelta)} · 목표 ${s.savingPct}%`,
      detail: '오늘의 미션 저축 완료, 절반이 코앞!',
    },
    {
      emoji: '📈',
      text: `포트 +${s.investReturnPct}% 유지`,
      detail: '급락장에도 분산 투자가 버팀목!',
    },
  ]

  return (
    <div className="w-full rounded-2xl rounded-tl-md bg-elevated px-4 py-3.5 shadow-soft" data-testid="daily-summary">
      <div className="flex flex-col gap-2.5">
        {lines.map((l, i) => (
          <div key={l.emoji} className="flex items-start gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink/6 text-micro font-extrabold text-ink-soft">
              {i + 1}
            </span>
            <div>
              <p className="text-body font-bold leading-snug text-ink">
                {l.emoji} {l.text}
              </p>
              {open && (
                <motion.p
                  className="mt-0.5 text-caption font-medium text-ink-soft"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={snappy}
                >
                  {l.detail}
                </motion.p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2.5 flex items-center gap-0.5 text-caption font-bold text-accent"
      >
        {open ? '접기' : '자세히'}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  )
}

/** 월 저축액 슬라이더 — 움직이면 상단 투영 차트·도달 문구가 실시간 변화 */
function SliderWidget({ onSlider, readOnly }: { onSlider: (v: number) => void; readOnly?: boolean }) {
  const [monthly, setMonthly] = useState<number>(SAVING_SLIDER.initial)
  const p = makeSavingProjection(monthly)

  return (
    <div className="w-full rounded-2xl rounded-tl-md bg-elevated px-4 py-3.5 shadow-soft" data-testid="saving-slider">
      <div className="flex items-baseline justify-between">
        <p className="text-body font-bold text-ink">월 저축액</p>
        <p className="text-section font-extrabold text-saving">{Math.round(monthly / 10000)}만원</p>
      </div>
      <input
        type="range"
        min={SAVING_SLIDER.min}
        max={SAVING_SLIDER.max}
        step={SAVING_SLIDER.step}
        value={monthly}
        disabled={readOnly}
        onChange={(e) => {
          const v = Number(e.target.value)
          setMonthly(v)
          onSlider(v)
        }}
        className="mt-2 w-full accent-[var(--color-saving)]"
        aria-label="월 저축액"
      />
      <div className="mt-0.5 flex justify-between text-micro font-semibold text-ink-faint">
        <span>10만</span>
        <span>50만</span>
      </div>
      <p className="mt-1.5 text-caption font-bold text-ink-soft">
        {p.months}개월 뒤 목표 달성 · {p.arrivalLabel} 파리 출발 ✈️
      </p>
    </div>
  )
}

/** OX 퀴즈 — 답하면 해설 + 포인트 */
function QuizWidget({ quizId, readOnly }: { quizId: string; readOnly?: boolean }) {
  const quiz = QUIZ.find((q) => q.id === quizId) ?? QUIZ[0]
  const [picked, setPicked] = useState<boolean | null>(null)
  const correct = picked !== null && picked === quiz.answer

  return (
    <div className="w-full rounded-2xl rounded-tl-md bg-elevated px-4 py-3.5 shadow-soft" data-testid="quiz-card">
      <p className="text-body font-bold leading-snug text-ink">{quiz.question}</p>

      {picked === null ? (
        <div className="mt-2.5 flex gap-2">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              type="button"
              disabled={readOnly}
              onClick={() => setPicked(v)}
              className={`flex-1 rounded-xl py-2 text-title font-extrabold ${
                v ? 'bg-rise/10 text-rise' : 'bg-fall/10 text-fall'
              }`}
            >
              {v ? 'O' : 'X'}
            </button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={snappy}>
          <div className="mt-2.5 flex items-center gap-2">
            <span className={`text-body font-extrabold ${correct ? 'text-saving' : 'text-fall'}`}>
              {correct ? '정답! 🎉' : '아쉽다! 정답은 ' + (quiz.answer ? 'O' : 'X')}
            </span>
            {correct && (
              <span className="rounded-full bg-point px-2 py-0.5 text-micro font-extrabold text-point-ink">
                +60P
              </span>
            )}
          </div>
          <p className="mt-1 text-caption font-medium leading-relaxed text-ink-soft">{quiz.explanation}</p>
        </motion.div>
      )}
    </div>
  )
}

/** 습관 미션 제안 — 수락하면 예상 리포트 단계로 이어진다 */
function MissionAcceptWidget({ onAccept, readOnly }: { onAccept: (text: string) => void; readOnly?: boolean }) {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="w-full rounded-2xl rounded-tl-md bg-elevated px-4 py-3.5 shadow-soft" data-testid="mission-accept">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-point text-[20px]">
          {HABIT_MISSION.emoji}
        </span>
        <div className="min-w-0">
          <p className="text-body font-bold text-ink">{HABIT_MISSION.title}</p>
          <p className="text-caption font-medium text-ink-soft">
            {HABIT_MISSION.reason} · +{HABIT_MISSION.reward}P
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={readOnly || accepted}
        onClick={() => {
          setAccepted(true)
          onAccept('미션 수락!')
        }}
        className={`mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-body font-bold ${
          accepted ? 'bg-ink/6 text-ink-faint' : 'bg-accent text-white'
        }`}
      >
        {accepted ? '수락 완료 ✓' : '미션 수락'}
      </button>
    </div>
  )
}

/** 추천 미션 카드 — 미션 탭으로 이동 */
function MissionWidget({ missionId, readOnly }: { missionId: string; readOnly?: boolean }) {
  const navigate = useNavigate()
  const m = RECOMMENDED_MISSIONS.find((r) => r.id === missionId) ?? RECOMMENDED_MISSIONS[0]

  return (
    <div className="w-full rounded-2xl rounded-tl-md bg-elevated px-4 py-3.5 shadow-soft" data-testid="mission-card">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-point text-[20px]">{m.emoji}</span>
        <div className="min-w-0">
          <p className="text-body font-bold text-ink">{m.title}</p>
          <p className="text-caption font-medium text-ink-soft">
            {m.reason} · +{m.reward}P
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => !readOnly && navigate('/missions')}
        className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-point py-2 text-body font-bold text-point-ink"
      >
        미션 탭에서 담기
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
