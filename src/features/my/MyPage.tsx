import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { MetricCarousel } from './carousel/MetricCarousel'
import { ArtCardThumb } from './panels/ArtCardThumb'
import { LinkedListPanel } from './panels/LinkedListPanel'
import { WrappedOverlay } from './wrapped/WrappedOverlay'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { DEMO_TODAY, USER } from '../../data/demo'
import {
  METRICS,
  PERIODS,
  PERIOD_LABEL,
  SAVING_VIEWS,
  SAVING_VIEW_LABEL,
  nextPeriod,
  nextSavingView,
  type Metric,
  type Period,
  type SavingView,
} from './myState'

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const TINT: Record<Metric, string> = {
  budget: 'from-budget/18 via-budget/6',
  saving: 'from-saving/18 via-saving/6',
  invest: 'from-invest/18 via-invest/6',
}

/** "?card=budget-daily" → {metric, period} — 지표/기간 유니온에 '-'가 없어 split이 안전하다 */
function parseCardParam(raw: string | null): { metric: Metric; period: Period } | null {
  if (!raw) return null
  const [m, p] = raw.split('-')
  if (!METRICS.includes(m as Metric) || !PERIODS.includes(p as Period)) return null
  return { metric: m as Metric, period: p as Period }
}

export function MyPage() {
  const [metric, setMetric] = useState<Metric>('budget')
  const [period, setPeriod] = useState<Period>('daily')
  const [savingView, setSavingView] = useState<SavingView>('goal')
  const [params, setParams] = useSearchParams()

  const openCard = parseCardParam(params.get('card'))

  // 저축은 뷰 축이라 Wrapped는 월간 카드(파리)로 고정
  const openWrapped = () =>
    setParams({ card: metric === 'saving' ? 'saving-monthly' : `${metric}-${period}` })
  const closeWrapped = () => {
    const next = new URLSearchParams(params)
    next.delete('card')
    setParams(next)
  }

  // 활성 지표 액센트를 앱 전체(탭바 포함)에 전파
  useEffect(() => {
    document.documentElement.dataset.metric = metric
    return () => {
      delete document.documentElement.dataset.metric
    }
  }, [metric])

  return (
    <div className="relative min-h-full">
      {/* 지표별 배경 틴트 — 그라디언트 3장 크로스페이드 */}
      {(Object.keys(TINT) as Metric[]).map((m) => (
        <motion.div
          key={m}
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-gradient-to-b ${TINT[m]} to-transparent`}
          initial={false}
          animate={{ opacity: metric === m ? 1 : 0 }}
          transition={{ duration: 0.45 }}
        />
      ))}

      <header className="relative flex items-center justify-between px-5 pb-2 pt-14">
        <div>
          <p className="text-[13px] font-semibold text-ink-soft">
            {DEMO_TODAY.getMonth() + 1}월 {DEMO_TODAY.getDate()}일 {WEEKDAY[DEMO_TODAY.getDay()]}요일
          </p>
          <h1 className="mt-0.5 text-[22px] font-extrabold text-ink">
            안녕, {USER.nickname}
          </h1>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-elevated text-xl shadow-soft">
          {USER.emoji}
        </div>
      </header>

      <MetricCarousel
        metric={metric}
        period={period}
        savingView={savingView}
        onMetricChange={setMetric}
        onStackNext={() =>
          metric === 'saving' ? setSavingView(nextSavingView(savingView)) : setPeriod(nextPeriod(period))
        }
      />

      <div className="relative mt-2 flex justify-center">
        {metric === 'saving' ? (
          <SegmentedControl
            id="period"
            items={SAVING_VIEWS.map((v) => ({ value: v, label: SAVING_VIEW_LABEL[v] }))}
            value={savingView}
            onChange={setSavingView}
          />
        ) : (
          <SegmentedControl
            id="period"
            items={PERIODS.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
            value={period}
            onChange={setPeriod}
          />
        )}
      </div>

      <section className="relative mt-4 grid grid-cols-[1fr_1.15fr] gap-3 px-5 pb-6">
        <div className="h-[248px]">
          {openCard === null && (
            <ArtCardThumb period={period} metric={metric} onOpen={openWrapped} />
          )}
        </div>
        <div className="h-[248px]">
          <LinkedListPanel metric={metric} period={period} />
        </div>
      </section>

      <AnimatePresence>
        {openCard !== null && (
          <WrappedOverlay metric={openCard.metric} period={openCard.period} onClose={closeWrapped} />
        )}
      </AnimatePresence>
    </div>
  )
}
