import { WaterGlass } from '../../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../../shared/charts/SpeedGauge'
import { MiniBars } from '../../../shared/charts/MiniBars'
import { LineChart } from '../../../shared/charts/LineChart'
import { CompareChart } from '../../../shared/charts/CompareChart'
import { Treemap } from '../../../shared/charts/Treemap'
import { AnimatedNumber } from '../../../shared/ui/AnimatedNumber'
import { formatKrw, formatKrwCompact, formatKrwSigned } from '../../../shared/format/krw'
import { MARKET_INDICES } from '../../../data/domain'
import {
  getBudget,
  getInvestStatus,
  getNetWorth,
  getPortfolio,
  getSavingMonthBars,
  getSavingProgress,
} from '../../../data/selectors'
import { METRIC_TEXT, type InvestView, type SavingView } from '../myState'
import type { Period } from '../../../data/types'

/** 월별 추이 차트 공용 x축 라벨 (2~7월) */
const MONTH_LABELS = ['2월', '3월', '4월', '5월', '6월', '7월']

/** 트리맵 셀용 짧은 종목명 */
const SHORT_NAME: Record<string, string> = {
  'TIGER S&P500': 'S&P500',
  'KODEX 200': 'KODEX 200',
  '005930': '삼성전자',
  'KODEX 미국나스닥': '나스닥',
  SPACEX: '스페이스X',
}

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
      <p className="mt-1 text-display font-extrabold leading-none">
        <AnimatedNumber value={b.pct * 100} format={(v) => `${Math.round(v)}%`} />
      </p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">
        {formatKrw(b.spent)} 씀 · <b className="text-ink">{formatKrw(b.remaining)}</b> 남음
      </p>
    </CardShell>
  )
}

export function SavingCard({ view }: { view: SavingView }) {
  const s = getSavingProgress('monthly')

  if (view === 'goal') {
    return (
      <CardShell title="저축 목표" metricClass={METRIC_TEXT.saving}>
        <SpeedGauge pct={s.pct} width={200} height={152} />
        <p className="mt-1 text-display font-extrabold leading-none">
          <AnimatedNumber value={s.pct * 100} format={(v) => `${Math.round(v)}%`} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          {s.title} · <b className="text-ink">{formatKrwCompact(s.current)}</b> / {formatKrwCompact(s.target)}
        </p>
      </CardShell>
    )
  }

  if (view === 'monthly') {
    return (
      <CardShell title="월간 저축" metricClass={METRIC_TEXT.saving}>
        <div className="pt-3">
          <MiniBars bars={getSavingMonthBars()} width={216} height={118} />
        </div>
        <p className="mt-2 text-display font-extrabold leading-none">
          <AnimatedNumber value={s.delta} format={(v) => formatKrwSigned(Math.round(v))} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">이번 달 수입에서 저축</p>
      </CardShell>
    )
  }

  const nw = getNetWorth()
  return (
    <CardShell title="나의 자산" metricClass={METRIC_TEXT.saving}>
      <div className="pt-2">
        <LineChart
          points={nw.points}
          width={216}
          height={126}
          drawKey="saving-asset"
          markers
          xLabels={MONTH_LABELS}
          yTicks
        />
      </div>
      <p className="mt-2 text-display font-extrabold leading-none">
        <AnimatedNumber value={nw.total} format={(v) => formatKrwCompact(Math.round(v))} />
      </p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">
        총자산 · 이번 달 <b className="text-ink">+{formatKrwCompact(nw.monthGain)}</b>
      </p>
    </CardShell>
  )
}

export function InvestCard({ view }: { view: InvestView }) {
  if (view === 'status') {
    const inv = getInvestStatus()
    return (
      <CardShell title="투자 현황" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <CompareChart
            value={inv.value}
            principal={inv.principal}
            width={216}
            height={132}
            xLabels={MONTH_LABELS}
          />
        </div>
        <p className={`mt-2 text-display font-extrabold leading-none ${inv.returnPct >= 0 ? 'text-rise' : 'text-fall'}`}>
          <AnimatedNumber value={inv.returnPct} format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          원금 <b className="text-ink">{formatKrwCompact(inv.principalTotal)}</b> → 평가{' '}
          <b className="text-ink">{formatKrwCompact(inv.total)}</b>
        </p>
      </CardShell>
    )
  }

  if (view === 'portfolio') {
    const pf = getPortfolio()
    return (
      <CardShell title="포트폴리오" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <Treemap
            items={pf.slices.map((s) => ({
              key: s.ticker,
              label: SHORT_NAME[s.ticker] ?? s.ticker,
              value: s.value,
              weight: s.weight,
            }))}
            width={224}
            height={150}
          />
        </div>
        <p className="mt-2 text-display font-extrabold leading-none">
          <AnimatedNumber value={pf.total} format={(v) => formatKrwCompact(Math.round(v))} />
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">{pf.slices.length}종목 분산 투자</p>
      </CardShell>
    )
  }

  return (
    <CardShell title="뉴스" metricClass={METRIC_TEXT.invest}>
      {/* 증시 전광판처럼 3열 배치 — 열 사이 은은한 구분선 */}
      <div className="grid w-full grid-cols-3 divide-x divide-line py-2 text-center">
        {MARKET_INDICES.map((m) => {
          const rise = m.changePct >= 0
          return (
            <div key={m.id} className="flex flex-col items-center gap-2 px-1 py-1">
              <span className="text-body font-bold text-ink">{m.name}</span>
              <b className="text-section font-extrabold leading-none tracking-tight text-ink tabular-nums">
                {m.value}
              </b>
              <span className={`text-micro font-bold leading-tight ${rise ? 'text-rise' : 'text-fall'}`}>
                {rise ? '▲' : '▼'}{m.changeAbs}
                <br />({rise ? '+' : '-'}{Math.abs(m.changePct).toFixed(2)}%)
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-body font-medium text-ink-soft">2026. 7. 17. 장 마감 기준</p>
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
      <p className="text-section font-bold text-ink">{title}</p>
      <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  )
}
