import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { MetricCarousel } from './carousel/MetricCarousel'
import { ArtCardThumb } from './panels/ArtCardThumb'
import { LinkedListPanel } from './panels/LinkedListPanel'
import { SegmentedControl } from '../../shared/ui/SegmentedControl'
import { DEMO_TODAY, USER } from '../../data/demo'
import { PERIODS, PERIOD_LABEL, type Metric, type Period } from './myState'

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

const TINT: Record<Metric, string> = {
  budget: 'from-budget/18 via-budget/6',
  saving: 'from-saving/18 via-saving/6',
  invest: 'from-invest/18 via-invest/6',
}

export function MyPage() {
  const [metric, setMetric] = useState<Metric>('budget')
  const [period, setPeriod] = useState<Period>('daily')

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
        onMetricChange={setMetric}
        onPeriodChange={setPeriod}
      />

      <div className="relative mt-2 flex justify-center">
        <SegmentedControl
          id="period"
          items={PERIODS.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <section className="relative mt-4 grid grid-cols-[1fr_1.15fr] gap-3 px-5 pb-6">
        <div className="h-[248px]">
          <ArtCardThumb period={period} metric={metric} onOpen={() => {}} />
        </div>
        <div className="h-[248px]">
          <LinkedListPanel metric={metric} period={period} />
        </div>
      </section>
    </div>
  )
}
