import { WaterGlass } from '../../../shared/charts/WaterGlass'
import { RingGauge } from '../../../shared/charts/RingGauge'
import { LineChart } from '../../../shared/charts/LineChart'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { formatKrw, formatKrwCompact, formatKrwSigned } from '../../../shared/format/krw'
import { getBudget, getInvestSeries, getSavingProgress } from '../../../data/selectors'
import { METRIC_TEXT, PERIOD_PREFIX } from '../myState'
import type { Period } from '../../../data/types'

const BUDGET_TITLE: Record<Period, string> = {
  daily: '오늘의 예산',
  weekly: '이번 주 예산',
  monthly: '7월 예산',
}

export function BudgetCard({ period }: { period: Period }) {
  const b = getBudget(period)
  return (
    <CardShell title={BUDGET_TITLE[period]} metricClass={METRIC_TEXT.budget}>
      <WaterGlass pct={b.pct} width={132} height={148} />
      <p className="mt-1 text-[34px] font-extrabold leading-none">
        <AnimatedNumber value={b.pct * 100} format={(v) => `${Math.round(v)}%`} />
      </p>
      <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
        {formatKrw(b.spent)} 씀 · <b className="text-ink">{formatKrw(b.remaining)}</b> 남음
      </p>
    </CardShell>
  )
}

export function SavingCard({ period }: { period: Period }) {
  const s = getSavingProgress(period)
  return (
    <CardShell title="저축 목표" metricClass={METRIC_TEXT.saving}>
      <div className="py-1.5">
        <RingGauge pct={s.pct} size={144} thickness={14}>
          <span className="text-[30px] font-extrabold leading-none text-ink">
            <AnimatedNumber value={s.pct * 100} format={(v) => `${Math.round(v)}%`} />
          </span>
          <span className="mt-1 text-[12px] font-semibold text-ink-soft">{formatKrwCompact(s.target)}</span>
        </RingGauge>
      </div>
      <p className="mt-1 text-[15px] font-bold text-ink">{s.title}</p>
      <p className="mt-0.5 text-[13px] font-medium text-ink-soft">
        {PERIOD_PREFIX[period]} <b className="text-ink">{formatKrwSigned(s.delta)}</b> 저축
      </p>
    </CardShell>
  )
}

export function InvestCard({ period }: { period: Period }) {
  const inv = getInvestSeries(period)
  const positive = inv.returnPct >= 0
  return (
    <CardShell title="투자 현황" metricClass={METRIC_TEXT.invest}>
      <div className="pt-3">
        <LineChart points={inv.points} width={216} height={104} drawKey={period} />
      </div>
      <p className={`mt-2 text-[34px] font-extrabold leading-none ${positive ? '' : 'text-danger'}`}>
        <AnimatedNumber value={inv.returnPct} format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
      </p>
      <p className="mt-1.5 text-[13px] font-medium text-ink-soft">
        총 자산 <b className="text-ink">{formatKrwCompact(inv.totalValue)}</b>
      </p>
    </CardShell>
  )
}

function CardShell({
  title,
  metricClass,
  children,
}: {
  title: string
  metricClass: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex h-full flex-col items-center rounded-card bg-elevated px-5 pb-5 pt-4 shadow-float ${metricClass}`}>
      <p className="text-[14px] font-bold text-ink">{title}</p>
      <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  )
}
