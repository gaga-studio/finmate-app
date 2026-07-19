import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { MetricCarousel } from './carousel/MetricCarousel'
import { ArtCardThumb } from './panels/ArtCardThumb'
import { LinkedListPanel } from './panels/LinkedListPanel'
import { WrappedOverlay } from './wrapped/WrappedOverlay'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { DEMO_TODAY, USER } from '../../data/demo'
import { UserAvatar } from '../../shared/profile/UserAvatar'
import { PageTitle } from '../../shared/ui/PageTitle'
import {
  INVEST_VIEWS,
  INVEST_VIEW_LABEL,
  METRICS,
  PERIODS,
  PERIOD_LABEL,
  SAVING_VIEWS,
  SAVING_VIEW_LABEL,
  nextInvestView,
  nextPeriod,
  nextSavingView,
  prevInvestView,
  prevPeriod,
  prevSavingView,
  type InvestView,
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

interface OpenCard {
  metric: Metric
  period: Period
  savingView?: SavingView
  investView?: InvestView
}

/** "?card=budget-daily" 또는 뷰 카드 "?card=saving-goal", "?card=invest-portfolio" */
function parseCardParam(raw: string | null): OpenCard | null {
  if (!raw) return null
  const [m, p] = raw.split('-')
  if (!METRICS.includes(m as Metric)) return null
  if (m === 'saving') {
    if (!SAVING_VIEWS.includes(p as SavingView)) return null
    return { metric: 'saving', period: 'monthly', savingView: p as SavingView }
  }
  if (m === 'invest') {
    if (!INVEST_VIEWS.includes(p as InvestView)) return null
    return { metric: 'invest', period: 'monthly', investView: p as InvestView }
  }
  if (!PERIODS.includes(p as Period)) return null
  return { metric: m as Metric, period: p as Period }
}

export function MyPage() {
  const [metric, setMetric] = useState<Metric>('budget')
  const [period, setPeriod] = useState<Period>('daily')
  const [savingView, setSavingView] = useState<SavingView>('goal')
  const [investView, setInvestView] = useState<InvestView>('status')
  const [params, setParams] = useSearchParams()

  const openCard = parseCardParam(params.get('card'))

  // 저축·투자는 뷰 축 — 현재 뷰의 카드가 열린다
  const openWrapped = () =>
    setParams({
      card:
        metric === 'saving'
          ? `saving-${savingView}`
          : metric === 'invest'
            ? `invest-${investView}`
            : `${metric}-${period}`,
    })
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
        <PageTitle>마이</PageTitle>
        <div>
          <p className="text-body font-semibold text-ink-soft">
            {DEMO_TODAY.getMonth() + 1}월 {DEMO_TODAY.getDate()}일 {WEEKDAY[DEMO_TODAY.getDay()]}요일
          </p>
          <h1 className="mt-0.5 text-title font-extrabold text-ink">
            안녕, {USER.nickname}
          </h1>
        </div>
        <UserAvatar size={44} />
      </header>

      {/* 지표 소제목 — 캐러셀과 함께 전환 */}
      <h2 className="px-6 pb-1.5 text-title font-extrabold text-ink">
        {metric === 'budget' ? '예산' : metric === 'saving' ? '저축' : '투자'}
      </h2>

      <MetricCarousel
        metric={metric}
        period={period}
        savingView={savingView}
        investView={investView}
        onMetricChange={setMetric}
        onStackNext={() => {
          if (metric === 'saving') setSavingView(nextSavingView(savingView))
          else if (metric === 'invest') setInvestView(nextInvestView(investView))
          else setPeriod(nextPeriod(period))
        }}
        onStackPrev={() => {
          if (metric === 'saving') setSavingView(prevSavingView(savingView))
          else if (metric === 'invest') setInvestView(prevInvestView(investView))
          else setPeriod(prevPeriod(period))
        }}
      />

      <div className="relative mt-2 flex justify-center">
        {metric === 'saving' ? (
          <SegmentedControl
            id="period"
            items={SAVING_VIEWS.map((v) => ({ value: v, label: SAVING_VIEW_LABEL[v] }))}
            value={savingView}
            onChange={setSavingView}
          />
        ) : metric === 'invest' ? (
          <SegmentedControl
            id="period"
            items={INVEST_VIEWS.map((v) => ({ value: v, label: INVEST_VIEW_LABEL[v] }))}
            value={investView}
            onChange={setInvestView}
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

      <h2 className="mt-4 px-6 text-title font-extrabold text-ink">요약</h2>

      <section className="relative mt-2 grid grid-cols-[1fr_1.15fr] gap-3 px-5 pb-6">
        <div className="h-[248px]">
          {openCard === null && (
            <ArtCardThumb
              period={period}
              metric={metric}
              savingView={savingView}
              investView={investView}
              onOpen={openWrapped}
            />
          )}
        </div>
        <div className="h-[248px]">
          <LinkedListPanel metric={metric} period={period} savingView={savingView} investView={investView} />
        </div>
      </section>

      <AnimatePresence>
        {openCard !== null && (
          <WrappedOverlay
            metric={openCard.metric}
            period={openCard.period}
            savingView={openCard.savingView}
            investView={openCard.investView}
            onClose={closeWrapped}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
