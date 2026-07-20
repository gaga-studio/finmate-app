import { WaterGlass } from '../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../shared/charts/SpeedGauge'
import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { MARKET_INDICES } from '../../data/domain'
import { formatKrwCompact, formatKrwSigned } from '../../shared/format/krw'
import { getBudget, getInvestStatus, getNetWorth, getPortfolio, getSavingProgress } from '../../data/selectors'
import type { MateProfile } from '../../data/mates'
import type { InvestView, Metric, Period, SavingView } from '../my/myState'

const METRIC_TEXT: Record<Metric, string> = { budget: 'text-budget', saving: 'text-saving', invest: 'text-invest' }
const BUDGET_TITLE: Record<Period, string> = { daily: '오늘의 예산', weekly: '이번 주 예산', monthly: '7월 예산' }

/** 비교 모드 캐러셀 카드 — 한 카드 안에서 좌 메이트/우 나가 정상 크기로 대결한다 */
export function makeCompareCardRenderer(mate: MateProfile) {
  return function renderCompareCard(m: Metric, period: Period, savingView: SavingView, investView: InvestView) {
    if (m === 'budget') return <CompareBudget mate={mate} period={period} />
    if (m === 'saving') return <CompareSaving mate={mate} view={savingView} />
    return <CompareInvest mate={mate} view={investView} />
  }
}

/* ---------- 공통 골격 ---------- */

function CompareShell({
  title,
  metricClass,
  mate,
  verdict,
  children,
}: {
  title: string
  metricClass: string
  mate: MateProfile
  /** 하단 대결 캡션 */
  verdict: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex h-full flex-col items-center overflow-hidden rounded-card bg-elevated shadow-float ${metricClass}`}>
      <div className="w-full bg-current/25 px-5 py-2.5 text-center">
        <p className="text-section font-bold text-ink">{title}</p>
      </div>
      {/* 열 라벨 */}
      <div className="grid w-full grid-cols-2 pt-2 text-center">
        <p className="flex items-center justify-center gap-1 text-caption font-extrabold text-ink-soft">
          <EmojiIcon emoji={mate.emoji} size={12} /> {mate.nickname}
        </p>
        <p className="flex items-center justify-center gap-1 text-caption font-extrabold text-ink-soft">
          <EmojiIcon emoji="🙋‍♀️" size={12} /> 지혜
        </p>
      </div>
      <div className="grid w-full flex-1 grid-cols-2 items-center divide-x divide-line/70">{children}</div>
      <p className="pb-3 text-body font-bold text-ink">{verdict}</p>
    </div>
  )
}

function Col({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center gap-1 px-2 py-1">{children}</div>
}

/** 받침 유무 조사 */
function iGa(word: string): string {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return '이(가)'
  return (code - 0xac00) % 28 === 0 ? '가' : '이'
}

function pctVerdict(name: string, mateVal: number, myVal: number, unit = '%p'): string {
  if (mateVal === myVal) return '막상막하, 완벽한 동률!'
  const diff = Math.abs(Math.round((mateVal - myVal) * 10) / 10)
  return mateVal > myVal ? `${name}${iGa(name)} ${diff}${unit} 앞서요` : `내가 ${diff}${unit} 앞서요!`
}

/* ---------- 소비 (일/주/월) ---------- */

function CompareBudget({ mate, period }: { mate: MateProfile; period: Period }) {
  const mv = mate.views.budget[period]
  const my = getBudget(period)
  const myPct = Math.round(my.pct * 100)

  return (
    <CompareShell
      title={BUDGET_TITLE[period]}
      metricClass={METRIC_TEXT.budget}
      mate={mate}
      verdict={pctVerdict(mate.nickname, mv.leftPct, myPct)}
    >
      <Col>
        <WaterGlass pct={mv.leftPct / 100} width={78} height={88} />
        <p className="text-title font-extrabold leading-none">{mv.leftPct}%</p>
        <p className="text-caption font-medium text-ink-soft">{mv.band}</p>
      </Col>
      <Col>
        <WaterGlass pct={my.pct} width={78} height={88} />
        <p className="text-title font-extrabold leading-none">{myPct}%</p>
        <p className="text-caption font-medium text-ink-soft">남음 {formatKrwCompact(my.remaining)}</p>
      </Col>
    </CompareShell>
  )
}

/* ---------- 저축 (목표/월간/자산) ---------- */

function CompareSaving({ mate, view }: { mate: MateProfile; view: SavingView }) {
  const s = mate.views.saving
  const my = getSavingProgress('monthly')
  const myPct = Math.round(my.pct * 100)

  if (view === 'goal') {
    return (
      <CompareShell
        title="저축 목표"
        metricClass={METRIC_TEXT.saving}
        mate={mate}
        verdict={pctVerdict(mate.nickname, s.goalPct, myPct)}
      >
        <Col>
          <SpeedGauge pct={s.goalPct / 100} width={110} height={82} />
          <p className="text-title font-extrabold leading-none">{s.goalPct}%</p>
          <p className="max-w-full truncate text-caption font-medium text-ink-soft">{s.goalLabel}</p>
        </Col>
        <Col>
          <SpeedGauge pct={my.pct} width={110} height={82} />
          <p className="text-title font-extrabold leading-none">{myPct}%</p>
          <p className="max-w-full truncate text-caption font-medium text-ink-soft">{my.title}</p>
        </Col>
      </CompareShell>
    )
  }

  if (view === 'monthly') {
    return (
      <CompareShell
        title="월간 저축"
        metricClass={METRIC_TEXT.saving}
        mate={mate}
        verdict="페이스 유지가 곧 승리!"
      >
        <Col>
          <p className="text-[22px] font-extrabold leading-tight">{s.paceBand}</p>
          <p className="text-caption font-medium text-ink-soft">월 저축 페이스</p>
        </Col>
        <Col>
          <p className="text-[22px] font-extrabold leading-tight">{formatKrwSigned(my.delta)}</p>
          <p className="text-caption font-medium text-ink-soft">이번 달 저축</p>
        </Col>
      </CompareShell>
    )
  }

  const nw = getNetWorth()
  return (
    <CompareShell title="나의 자산" metricClass={METRIC_TEXT.saving} mate={mate} verdict="구간 vs 실측 — 꾸준함의 대결">
      <Col>
        <p className="text-[22px] font-extrabold leading-tight">{s.assetBand}</p>
        <p className="text-caption font-medium text-ink-soft">총자산 구간</p>
      </Col>
      <Col>
        <p className="text-[22px] font-extrabold leading-tight">{formatKrwCompact(nw.total)}</p>
        <p className="text-caption font-medium text-ink-soft">이번 달 +{formatKrwCompact(nw.monthGain)}</p>
      </Col>
    </CompareShell>
  )
}

/* ---------- 투자 (현황/포폴/뉴스) ---------- */

function CompareInvest({ mate, view }: { mate: MateProfile; view: InvestView }) {
  const inv = mate.views.invest
  const my = getInvestStatus()

  if (view === 'status') {
    return (
      <CompareShell
        title="투자 현황"
        metricClass={METRIC_TEXT.invest}
        mate={mate}
        verdict={pctVerdict(mate.nickname, inv.returnPct, my.returnPct)}
      >
        <Col>
          <p className={`text-[34px] font-extrabold leading-none ${inv.returnPct >= 0 ? 'text-rise' : 'text-fall'}`}>
            {inv.returnPct >= 0 ? '+' : ''}
            {inv.returnPct}%
          </p>
          <p className="text-caption font-medium text-ink-soft">총 수익률</p>
        </Col>
        <Col>
          <p className={`text-[34px] font-extrabold leading-none ${my.returnPct >= 0 ? 'text-rise' : 'text-fall'}`}>
            +{my.returnPct}%
          </p>
          <p className="text-caption font-medium text-ink-soft">원금 {formatKrwCompact(my.principalTotal)}</p>
        </Col>
      </CompareShell>
    )
  }

  if (view === 'portfolio') {
    const mateTop = inv.portfolio[0]
    const myTop = getPortfolio().slices[0]
    return (
      <CompareShell
        title="포트폴리오"
        metricClass={METRIC_TEXT.invest}
        mate={mate}
        verdict="1등 자리는 각자의 스타일로"
      >
        <Col>
          <p className="text-title font-extrabold leading-tight">{mateTop.label}</p>
          <p className="text-[26px] font-extrabold leading-none text-invest">{Math.round(mateTop.weight * 100)}%</p>
          <p className="text-caption font-medium text-ink-soft">비중 1위 · {inv.portfolio.length}개 분야</p>
        </Col>
        <Col>
          <p className="text-title font-extrabold leading-tight">S&P500</p>
          <p className="text-[26px] font-extrabold leading-none text-invest">{Math.round(myTop.weight * 100)}%</p>
          <p className="text-caption font-medium text-ink-soft">비중 1위 · 5종목</p>
        </Col>
      </CompareShell>
    )
  }

  // 뉴스 — 시장은 공용 정보라 비교 대신 공용 보드
  return (
    <div className={`flex h-full flex-col items-center overflow-hidden rounded-card bg-elevated shadow-float ${METRIC_TEXT.invest}`}>
      <div className="w-full bg-current/25 px-5 py-2.5 text-center">
        <p className="text-section font-bold text-ink">뉴스</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-5">
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
      </div>
      <p className="pb-3 text-body font-medium text-ink-soft">같은 시장, 다른 선택 — 2026. 7. 22. 기준</p>
    </div>
  )
}
