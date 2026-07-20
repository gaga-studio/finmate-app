import { AnimatePresence, motion } from 'motion/react'
import { LineChart } from '../../shared/charts/LineChart'
import { CompareChart } from '../../shared/charts/CompareChart'
import { formatKrwCompact } from '../../shared/format/krw'
import {
  COMPARE_TARGETS,
  getHabitProjection,
  getMacbookSim,
  HABIT_BOOST,
  MACBOOK,
  ETF_GOAL,
  makeEtfProjection,
  makeSavingProjection,
  PROJECTION_MONTHS,
  type InsightChartState,
} from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

const CHART_W = 330

/** 비교 계열 라인 색 — 기존 총자산 선은 유지하고, 메이트/그룹 선만 빨간색으로 추가 */
const COMPARE_COLORS: [string, string] = ['var(--color-saving)', 'var(--color-rise)']

/** 받침 유무에 따른 이/가 조사 */
function iGa(word: string): string {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return '이(가)'
  return (code - 0xac00) % 28 === 0 ? '가' : '이'
}

interface Props {
  state: InsightChartState
}

export function ChartPanel({ state }: Props) {
  const { title, caption, metricClass, chart } = renderState(state)
  const compareTarget =
    state.kind === 'compare' ? COMPARE_TARGETS.find((t) => t.id === state.targetId) : undefined

  if (compareTarget?.kind === 'group') {
    return (
      <div className="mt-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-3">
          <ChartCard
            title={title}
            caption={caption}
            metricClass={metricClass}
            chart={chart}
            animationKey={chartKey(state)}
            className="mx-0 mt-0 w-[372px] max-w-[calc(100vw-58px)] snap-center"
          />
          <GroupPositionCard targetLabel={compareTarget.label} />
          <GroupSavingProductsCard targetLabel={compareTarget.label} />
        </div>
      </div>
    )
  }

  return <ChartCard title={title} caption={caption} metricClass={metricClass} chart={chart} animationKey={chartKey(state)} />
}

function ChartCard({
  title,
  caption,
  metricClass,
  chart,
  animationKey,
  className,
}: {
  title: string
  caption?: string
  metricClass: string
  chart: React.ReactNode
  animationKey: string
  className?: string
}) {
  return (
    <div className={`clay-card rounded-card px-4 pb-2.5 pt-3 ${className ?? 'mx-5 mt-2'}`}>
      <div className="flex items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={title}
            className="text-[17px] font-bold leading-snug text-ink"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={snappy}
          >
            {title}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={`relative mt-1 flex h-[172px] flex-col items-center justify-center ${metricClass}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={animationKey}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={snappy}
          >
            {chart}
            {caption && (
              <p className="mt-1 text-caption font-bold text-ink-soft">{caption}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function GroupCarouselCard({
  title,
  eyebrow,
  children,
  caption,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
  caption?: string
}) {
  return (
    <div className="clay-card w-[372px] max-w-[calc(100vw-58px)] snap-center rounded-card px-4 pb-2.5 pt-3">
      <div>
        <p className="truncate text-[17px] font-bold leading-snug text-ink">{title}</p>
        <p className="mt-0.5 truncate text-caption font-bold text-ink-faint">{eyebrow}</p>
      </div>
      <div className="relative mt-1 flex h-[172px] flex-col justify-center">
        {children}
        {caption && <p className="mt-3 text-center text-caption font-bold text-ink-soft">{caption}</p>}
      </div>
    </div>
  )
}

const GROUP_POSITIONS = [
  {
    label: '소비',
    left: '과소비',
    right: '방어',
    position: 68,
    desc: '예산을 오래 남김',
    className: 'text-budget',
    dotClass: 'bg-budget',
  },
  {
    label: '저축',
    left: '느림',
    right: '빠름',
    position: 76,
    desc: '평균보다 빠른 페이스',
    className: 'text-saving',
    dotClass: 'bg-saving',
  },
  {
    label: '투자',
    left: '준비 전',
    right: '실행권',
    position: 59,
    desc: 'ETF 첫 시도 여유권',
    className: 'text-invest',
    dotClass: 'bg-invest',
  },
] as const

function GroupPositionCard({ targetLabel }: { targetLabel: string }) {
  return (
    <GroupCarouselCard
      title="그룹 안에서 내 위치"
      eyebrow={targetLabel}
      caption="점이 오른쪽일수록 이번 목표에 가까워요"
    >
      <div className="grid gap-3">
        {GROUP_POSITIONS.map((item) => (
          <PositionRail key={item.label} item={item} />
        ))}
      </div>
    </GroupCarouselCard>
  )
}

function PositionRail({ item }: { item: (typeof GROUP_POSITIONS)[number] }) {
  return (
    <div className="grid grid-cols-[38px_minmax(0,1fr)] items-center gap-3">
      <span className={`text-section font-extrabold ${item.className}`}>{item.label}</span>
      <div className="min-w-0">
        <div className="relative h-6">
          <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-white" />
          <motion.span
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${item.dotClass} shadow-soft ring-4 ring-white`}
            initial={{ left: '50%', opacity: 0 }}
            animate={{ left: `${item.position}%`, opacity: 1 }}
            transition={snappy}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-micro font-medium text-ink-faint">{item.left}</span>
          <span className="text-caption font-bold text-ink-soft">{item.desc}</span>
          <span className="text-micro font-medium text-ink-faint">{item.right}</span>
        </div>
      </div>
    </div>
  )
}

const GROUP_SAVING_PRODUCTS = [
  '하나은행 청년미래적금',
  '하나은행 청년 주택드림 청약 통장',
  '하나은행 청년내일저축계좌',
] as const

function GroupSavingProductsCard({ targetLabel }: { targetLabel: string }) {
  return (
    <GroupCarouselCard
      title="그룹이 많이 쓰는 저축 상품"
      eyebrow={targetLabel}
      caption="그룹에서 자주 선택한 저축 루틴 기준"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {GROUP_SAVING_PRODUCTS.map((name, i) => (
          <div key={name} className="flex min-h-[118px] flex-col items-center justify-center rounded-2xl border border-line bg-white px-2.5 py-3 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-point text-body font-extrabold text-point-ink">
              {i + 1}
            </span>
            <b className="mt-2 line-clamp-3 break-keep text-caption font-extrabold leading-snug text-ink">{name}</b>
          </div>
        ))}
      </div>
    </GroupCarouselCard>
  )
}

/** 상태 전환 애니메이션 키 — 슬라이더 이동은 같은 키(내부 재드로잉만), 비교는 대상별 재생 */
function chartKey(state: InsightChartState): string {
  if (state.kind === 'compare') return `compare-${state.targetId}`
  if (state.kind === 'sim-macbook') return `macbook-${state.targetId ?? 'solo'}${state.habit ? '-habit' : ''}`
  return state.kind
}

function renderState(state: InsightChartState) {
  if (state.kind === 'sim-macbook') {
    const sim = getMacbookSim()
    const target = state.targetId ? COMPARE_TARGETS.find((t) => t.id === state.targetId) : undefined

    // 비교 중이었다면 메이트 선을 유지 — 맥북을 사면 격차가 어떻게 변하는지가 포인트
    if (target) {
      // 습관 따라하기: 메이트 패턴 + 내 기존 흐름 시너지(HABIT_BOOST) — 10~11월 사이 역전
      const myCurve = state.habit
        ? target.curve.map((v) => sim.base[0] - MACBOOK.price + Math.round((v - target.curve[0]) * HABIT_BOOST))
        : sim.bought
      const end = myCurve[myCurve.length - 1]
      const diff = end - target.curve[target.curve.length - 1]
      // 역전이 일어나는 첫 달
      const crossIdx = state.habit ? myCurve.findIndex((v, i) => i > 0 && v >= target.curve[i]) : -1

      return {
        title: state.habit
          ? `습관 따라하면 12월 ${formatKrwCompact(end)}`
          : `맥북 사면 12월 ${formatKrwCompact(end)}`,
        caption: state.habit
          ? crossIdx > 0
            ? `${PROJECTION_MONTHS[crossIdx]}이면 ${target.label} 역전 — 12월 +${formatKrwCompact(diff)}!`
            : `맥북 반영 대비 +${formatKrwCompact(end - sim.endBought)} 만회!`
          : diff >= 0
            ? `그래도 ${target.label}보다 +${formatKrwCompact(diff)} 앞서요`
            : `이러면 ${target.label}${iGa(target.label)} +${formatKrwCompact(-diff)} 앞서요`,
        metricClass: 'text-ink',
        chart: (
          <CompareChart
            value={myCurve}
            principal={target.curve}
            labels={['나', target.label]}
            colors={COMPARE_COLORS}
            width={CHART_W}
            height={132}
            xLabels={PROJECTION_MONTHS}
          />
        ),
      }
    }

    return {
      title: `${MACBOOK.name} ${formatKrwCompact(MACBOOK.price)}이면`,
      caption: `12월 ${formatKrwCompact(sim.endBase)} → ${formatKrwCompact(sim.endBought)}`,
      metricClass: 'text-budget',
      chart: (
        <CompareChart
          value={sim.base}
          principal={sim.bought}
          labels={['그대로', '맥북 사면']}
          width={CHART_W}
          height={132}
          xLabels={PROJECTION_MONTHS}
        />
      ),
    }
  }

  if (state.kind === 'sim-saving') {
    const p = makeSavingProjection(state.monthly)
    return {
      title: `월 ${formatKrwCompact(state.monthly)}씩 모으면`,
      caption: `${p.months}개월 뒤, ${p.arrivalLabel} 파리 출발 ✈️`,
      metricClass: 'text-saving',
      chart: (
        <LineChart
          points={p.curve}
          width={CHART_W}
          height={128}
          drawKey={`proj-${state.monthly}`}
          xLabels={['지금', `${p.months}개월`]}
          yTicks
        />
      ),
    }
  }

  if (state.kind === 'sim-etf') {
    const p = makeEtfProjection(state.monthly)
    return {
      title: `${p.months}개월 뒤 ${formatKrwCompact(p.target)} 달성`,
      caption: `${ETF_GOAL.product} 첫 매수 자금 확보!`,
      metricClass: 'text-invest',
      chart: (
        <div className="flex flex-col items-center">
          <p className="text-title font-extrabold leading-none text-ink">
            월 <span className="text-invest">{formatKrwCompact(p.monthly)}</span>
            <span className="mx-1.5 text-ink-faint">×</span>
            {p.months}개월
          </p>
          <div className="mt-2">
            <LineChart
              points={p.curve}
              width={CHART_W}
              height={108}
              drawKey={`etf-${p.monthly}`}
              markers
              xLabels={['시작', `${p.months}개월`]}
              yTicks
            />
          </div>
        </div>
      ),
    }
  }

  const my = getHabitProjection()

  if (state.kind === 'compare') {
    const target = COMPARE_TARGETS.find((t) => t.id === state.targetId) ?? COMPARE_TARGETS[0]
    return {
      title: `나 vs ${target.label}`,
      caption: target.summary,
      metricClass: 'text-ink',
      chart: (
        <CompareChart
          value={my.curve}
          principal={target.curve}
          labels={['나', target.label]}
          colors={COMPARE_COLORS}
          width={CHART_W}
          height={132}
          xLabels={PROJECTION_MONTHS}
        />
      ),
    }
  }

  // 기본: 평소 습관 기반 미래 6개월 투영 — 현재 → 12월 예상을 한 줄로
  return {
    title: '총자산',
    caption: `지금 습관대로면 6개월 뒤 +${formatKrwCompact(my.totalGain)}`,
    metricClass: 'text-saving',
    chart: (
      <div className="flex flex-col items-center">
        <div className="flex items-end gap-5">
          <div className="text-center">
            <p className="text-caption font-bold text-ink-faint">현재</p>
            <p className="mt-0.5 text-title font-extrabold leading-none text-ink">
              {formatKrwCompact(my.curve[0])}
            </p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className="text-caption font-bold text-ink-faint">12월 예상</p>
            <p className="mt-0.5 text-title font-extrabold leading-none text-saving">
              {formatKrwCompact(my.curve[my.curve.length - 1])}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <LineChart
            points={my.curve}
            width={CHART_W}
            height={108}
            drawKey="habit-projection"
            markers
            xLabels={PROJECTION_MONTHS}
            yTicks
          />
        </div>
      </div>
    ),
  }
}
