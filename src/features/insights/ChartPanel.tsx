import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
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
      <ChartCarousel
        cards={[
          <ChartCard
            key="chart"
            title={title}
            caption={caption}
            metricClass={metricClass}
            chart={chart}
            animationKey={chartKey(state)}
            className="h-full"
          />,
          <GroupPositionCard key="position" targetLabel={compareTarget.label} />,
          <GroupSavingProductsCard key="products" targetLabel={compareTarget.label} />,
        ]}
      />
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

/**
 * 그룹 비교 3카드 캐러셀 — 마이 탭 MetricCarousel의 가로축 문법을 그대로 이식.
 * 팬 제스처 + 스프링 스냅, 옆 카드가 축소·반투명으로 살짝 보인다.
 */
function ChartCarousel({ cards }: { cards: React.ReactNode[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [vw, setVw] = useState(390)
  const [idx, setIdx] = useState(0)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setVw(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cardW = vw - 56
  const step = cardW + 12
  const x = useMotionValue(0)
  const dragging = useRef(false)

  const snapTo = (next: number) => {
    const clamped = Math.max(0, Math.min(cards.length - 1, next))
    setIdx(clamped)
    animate(x, -clamped * step, snappy)
  }

  return (
    <div className="mt-2">
      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        style={{ height: 224, touchAction: 'pan-y' }}
      >
        <motion.div
          className="relative h-full"
          style={{ x }}
          onPanStart={() => {
            dragging.current = true
          }}
          onPan={(_, info) => {
            x.set(-idx * step + info.offset.x)
          }}
          onPanEnd={(_, info) => {
            dragging.current = false
            const delta = info.offset.x < -50 || info.velocity.x < -400 ? 1 : info.offset.x > 50 || info.velocity.x > 400 ? -1 : 0
            snapTo(idx + delta)
          }}
        >
          {cards.map((card, i) => (
            <ChartCarouselSlot key={i} i={i} x={x} step={step} cardW={cardW} vw={vw}>
              {card}
            </ChartCarouselSlot>
          ))}
        </motion.div>
      </div>
      {/* 도트 인디케이터 — 스와이프 가능함을 암시 */}
      <div className="mt-1.5 flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}번 카드`}
            onClick={() => snapTo(i)}
            className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-accent' : 'w-1.5 bg-ink/15'}`}
          />
        ))}
      </div>
    </div>
  )
}

function ChartCarouselSlot({
  i,
  x,
  step,
  cardW,
  vw,
  children,
}: {
  i: number
  x: MotionValue<number>
  step: number
  cardW: number
  vw: number
  children: React.ReactNode
}) {
  const scale = useTransform(x, (v) => {
    const d = Math.abs(-v / step - i)
    return 1 - Math.min(d, 1) * 0.08
  })
  const opacity = useTransform(x, (v) => {
    const d = Math.abs(-v / step - i)
    return 1 - Math.min(d, 1) * 0.65
  })
  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{ left: (vw - cardW) / 2 + i * step, width: cardW, scale, opacity }}
    >
      {children}
    </motion.div>
  )
}

/** 캐러셀 2·3번 카드 공용 셸 — ChartCard와 같은 규격(제목·172px 본문·캡션) */
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
    <div className="clay-card h-full rounded-card px-4 pb-2.5 pt-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[17px] font-bold leading-snug text-ink">{title}</p>
        <p className="shrink-0 text-caption font-bold text-ink-faint">{eyebrow}</p>
      </div>
      <div className="relative mt-1 flex h-[172px] flex-col justify-center">
        {children}
        {caption && <p className="mt-2.5 text-center text-caption font-bold text-ink-soft">{caption}</p>}
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
    <div className={`grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2.5 ${item.className}`}>
      <span className="rounded-lg bg-current/10 py-1 text-center text-caption font-extrabold">{item.label}</span>
      <div className="min-w-0">
        {/* 트랙 + 위치까지 색 채움 — 마이 탭 잔량 바와 같은 문법 */}
        <div className="relative h-4">
          <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink/8">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-current/60"
              initial={{ width: 0 }}
              animate={{ width: `${item.position}%` }}
              transition={{ ...snappy, delay: 0.15 }}
            />
          </span>
          <span className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-white/80" />
          <motion.span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current shadow-soft ring-2 ring-white"
            initial={{ left: '0%', opacity: 0 }}
            animate={{ left: `${item.position}%`, opacity: 1 }}
            transition={{ ...snappy, delay: 0.15 }}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between">
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
      {/* 소비 탑5와 같은 순위 리스트 문법 */}
      <div className="flex flex-col divide-y divide-line/60">
        {GROUP_SAVING_PRODUCTS.map((name, i) => (
          <div key={name} className="flex items-center gap-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-point text-body font-extrabold text-point-ink">
              {i + 1}
            </span>
            <b className="min-w-0 flex-1 truncate text-body font-extrabold text-ink">{name}</b>
            <span className="shrink-0 rounded-full bg-ink/5 px-2 py-0.5 text-micro font-bold text-ink-soft">
              {['이용 1위', '인기', '인기'][i]}
            </span>
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
