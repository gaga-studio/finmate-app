import { Lock } from 'lucide-react'
import { WaterGlass } from '../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../shared/charts/SpeedGauge'
import { MiniBars } from '../../shared/charts/MiniBars'
import { LineChart } from '../../shared/charts/LineChart'
import { Treemap } from '../../shared/charts/Treemap'
import { MARKET_INDICES } from '../../data/domain'
import type { MateProfile } from '../../data/mates'
import type { InvestView, Metric, Period, SavingView } from '../my/myState'

const METRIC_TEXT: Record<Metric, string> = { budget: 'text-budget', saving: 'text-saving', invest: 'text-invest' }
const BUDGET_TITLE: Record<Period, string> = { daily: '오늘의 예산', weekly: '이번 주 예산', monthly: '7월 예산' }
const MONTH_LABELS = ['2월', '3월', '4월', '5월', '6월', '7월']
const BAR_LABELS = ['3월', '4월', '5월', '6월', '7월']

/** MetricCarousel의 renderCard로 꽂는 메이트 카드 9종 — 전부 %·구간·상대값만 */
export function makeMateCardRenderer(mate: MateProfile) {
  return function renderMateCard(m: Metric, period: Period, savingView: SavingView, investView: InvestView) {
    if (m === 'budget') return <MateBudgetCard mate={mate} period={period} />
    if (m === 'saving') return <MateSavingCard mate={mate} view={savingView} />
    return <MateInvestCard mate={mate} view={investView} />
  }
}

function MateBudgetCard({ mate, period }: { mate: MateProfile; period: Period }) {
  const v = mate.views.budget[period]
  return (
    <MateShell title={BUDGET_TITLE[period]} metricClass={METRIC_TEXT.budget}>
      <WaterGlass pct={v.leftPct / 100} width={116} height={132} />
      <p className="mt-1 text-display font-extrabold leading-none">{v.leftPct}%</p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">
        예산 남김 · <b className="text-ink">{v.band}</b> 소비
      </p>
    </MateShell>
  )
}

function MateSavingCard({ mate, view }: { mate: MateProfile; view: SavingView }) {
  const s = mate.views.saving

  if (view === 'goal') {
    return (
      <MateShell title="저축 목표" metricClass={METRIC_TEXT.saving}>
        <SpeedGauge pct={s.goalPct / 100} width={184} height={140} />
        <p className="mt-1 text-display font-extrabold leading-none">{s.goalPct}%</p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">
          목표 <b className="text-ink">{s.goalLabel}</b> 진행 중
        </p>
      </MateShell>
    )
  }

  if (view === 'monthly') {
    return (
      <MateShell title="월간 저축" metricClass={METRIC_TEXT.saving}>
        <div className="pt-3">
          <MiniBars
            bars={s.monthlyBars.map((rel, i) => ({
              label: BAR_LABELS[i],
              amount: Math.round(rel * 100),
              isCurrent: i === s.monthlyBars.length - 1,
            }))}
            width={216}
            height={112}
          />
        </div>
        <p className="mt-2 text-title font-extrabold leading-none">{s.paceBand}</p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">꾸준한 저축 페이스</p>
      </MateShell>
    )
  }

  return (
    <MateShell title="나의 자산" metricClass={METRIC_TEXT.saving}>
      <div className="pt-2">
        <LineChart
          points={s.assetTrend.map((v) => Math.round(v * 100))}
          width={216}
          height={116}
          drawKey={`mate-asset-${mate.id}`}
          markers
          xLabels={MONTH_LABELS}
        />
      </div>
      <p className="mt-2 text-title font-extrabold leading-none">{s.assetBand}</p>
      <p className="mt-1.5 text-body font-medium text-ink-soft">총자산 구간 · 꾸준히 우상향</p>
    </MateShell>
  )
}

function MateInvestCard({ mate, view }: { mate: MateProfile; view: InvestView }) {
  const inv = mate.views.invest

  if (view === 'status') {
    const rise = inv.returnPct >= 0
    return (
      <MateShell title="투자 현황" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <LineChart
            points={inv.trend.map((v) => Math.round(v * 100))}
            width={216}
            height={112}
            drawKey={`mate-invest-${mate.id}`}
            markers
            xLabels={MONTH_LABELS}
          />
        </div>
        <p className={`mt-2 text-display font-extrabold leading-none ${rise ? 'text-rise' : 'text-fall'}`}>
          {rise ? '+' : ''}
          {inv.returnPct}%
        </p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">총 수익률 · 원금은 비공개</p>
      </MateShell>
    )
  }

  if (view === 'portfolio') {
    return (
      <MateShell title="포트폴리오" metricClass={METRIC_TEXT.invest}>
        <div className="pt-2">
          <Treemap
            items={inv.portfolio.map((p) => ({
              key: p.label,
              label: p.label,
              value: Math.round(p.weight * 100),
              weight: p.weight,
            }))}
            width={224}
            height={148}
          />
        </div>
        <p className="mt-2 text-title font-extrabold leading-none">{inv.portfolio.length}개 분야 분산</p>
        <p className="mt-1.5 text-body font-medium text-ink-soft">종목명 대신 분야 비중만 공개</p>
      </MateShell>
    )
  }

  // 뉴스 — 시장 지수는 공용 정보라 마이와 동일
  return (
    <MateShell title="뉴스" metricClass={METRIC_TEXT.invest}>
      <div className="grid w-full grid-cols-3 divide-x divide-line py-2 text-center">
        {MARKET_INDICES.map((mkt) => {
          const rise = mkt.changePct >= 0
          return (
            <div key={mkt.id} className="flex flex-col items-center gap-2 px-1 py-1">
              <span className="text-body font-bold text-ink">{mkt.name}</span>
              <b className="text-section font-extrabold leading-none tracking-tight text-ink tabular-nums">
                {mkt.value}
              </b>
              <span className={`text-micro font-bold leading-tight ${rise ? 'text-rise' : 'text-fall'}`}>
                {rise ? '▲' : '▼'}
                {mkt.changeAbs}
                <br />({rise ? '+' : '-'}
                {Math.abs(mkt.changePct).toFixed(2)}%)
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-body font-medium text-ink-soft">2026. 7. 22. 장 마감 기준</p>
    </MateShell>
  )
}

/** 마이 CardShell과 동일 문법 + 하단 비공개 캡션 */
function MateShell({
  title,
  metricClass,
  children,
}: {
  title: string
  metricClass: string
  children: React.ReactNode
}) {
  return (
    <div className={`clay-card flex h-full flex-col items-center overflow-hidden rounded-card ${metricClass}`}>
      <div className="w-full px-5 pb-1 pt-4 text-center">
        <p className="text-section font-bold text-ink">{title}</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5 pt-2">{children}</div>
      <p className="flex items-center gap-1 pb-2.5 text-micro font-semibold text-ink-faint">
        <Lock size={10} />
        카테고리 · 구간만 공개
      </p>
    </div>
  )
}
