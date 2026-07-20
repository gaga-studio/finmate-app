import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { BudgetCard, InvestCard, SavingCard } from '../cards/MetricCards'
import { METRICS, type InvestView, type Metric, type Period, type SavingView } from '../myState'
import { snappy } from '../../../shared/motion/springs'

interface Props {
  metric: Metric
  period: Period
  savingView: SavingView
  investView: InvestView
  onMetricChange: (m: Metric) => void
  /** 스택 전환(위로 밀기·휠 다운 = 다음 / 아래로·휠 업 = 이전) — 순환 대상은 MyPage가 결정 */
  onStackNext: () => void
  onStackPrev: () => void
  /** 카드 렌더 주입 — 생략 시 마이 탭 기본 카드. 메이트 프로필이 같은 구조로 다른 카드를 꽂는다 */
  renderCard?: (m: Metric, period: Period, savingView: SavingView, investView: InvestView) => React.ReactNode
}

const CARD_H = 316
const LIFT_MAX = 130
const LIFT_THRESHOLD = 70
const AXIS_LOCK = 12

/**
 * 2축 캐러셀: 가로 스와이프 = 지표 전환, 위로 밀기 = 기간 스택 전환.
 * Motion의 drag prop 대신 onPan으로 직접 구현해 첫 12px 이동으로
 * 축을 잠근다(제스처 충돌 방지). 기간 칩이 항상 폴백으로 존재하므로
 * 제스처가 실패해도 같은 장면을 재현할 수 있다.
 */
export function MetricCarousel({
  metric,
  period,
  savingView,
  investView,
  onMetricChange,
  onStackNext,
  onStackPrev,
  renderCard,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [vw, setVw] = useState(390)

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setVw(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cardW = vw - 104
  const step = cardW + 16
  const idx = METRICS.indexOf(metric)

  const x = useMotionValue(-idx * step)
  const lift = useMotionValue(0)
  const axisRef = useRef<'x' | 'y' | null>(null)
  const baseXRef = useRef(0)

  // 뷰포트 리사이즈 시 스냅 위치 재정렬
  useLayoutEffect(() => {
    x.set(-METRICS.indexOf(metric) * step)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // 외부 전환(지표 토글 등) — metric prop이 바뀌면 캐러셀도 따라 슬라이드
  useLayoutEffect(() => {
    const target = -METRICS.indexOf(metric) * step
    if (x.get() !== target) animate(x, target, snappy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric])

  const snapTo = (target: number) => {
    const clamped = Math.max(0, Math.min(METRICS.length - 1, target))
    animate(x, -clamped * step, snappy)
    if (METRICS[clamped] !== metric) onMetricChange(METRICS[clamped])
  }

  // 데스크톱 휠 지원 — 가로 휠 = 지표 전환, 세로 휠 = 스택(기간/뷰) 전환.
  // 최신 idx/콜백은 ref로 참조한다.
  const wheelRef = useRef({ idx, snapTo, onStackNext, onStackPrev })
  wheelRef.current = { idx, snapTo, onStackNext, onStackPrev }
  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    let accumX = 0
    let accumY = 0
    let cooling = false
    let idleTimer: number | undefined
    const fire = (action: () => void) => {
      accumX = 0
      accumY = 0
      cooling = true
      window.setTimeout(() => {
        cooling = false
      }, 450)
      action()
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (cooling) return
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        accumX = 0
        accumY = 0
      }, 200)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        accumX += e.deltaX
        if (Math.abs(accumX) > 60) {
          const dir = accumX > 0 ? 1 : -1
          fire(() => wheelRef.current.snapTo(wheelRef.current.idx + dir))
        }
      } else {
        accumY += e.deltaY
        if (Math.abs(accumY) > 60) {
          const forward = accumY > 0
          fire(() => (forward ? wheelRef.current.onStackNext() : wheelRef.current.onStackPrev()))
        }
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(idleTimer)
    }
  }, [])

  return (
    <div
      ref={viewportRef}
      className="relative select-none"
      style={{ height: CARD_H + 34, touchAction: 'none' }}
    >
      {/* 기간 고스트 스택 — 활성 카드 뒤 2장 */}
      <GhostCard offset={-14} scale={0.955} opacity={0.5} lift={lift} liftFactor={0.16} cardW={cardW} vw={vw} />
      <GhostCard offset={-27} scale={0.912} opacity={0.28} lift={lift} liftFactor={0.3} cardW={cardW} vw={vw} />

      <motion.div
        className="absolute inset-x-0 top-[30px]"
        style={{ y: useTransform(lift, (l) => -l * 0.4) }}
        onPanStart={() => {
          axisRef.current = null
          baseXRef.current = x.get()
        }}
        onPan={(_, info) => {
          if (axisRef.current === null) {
            if (Math.abs(info.offset.x) > AXIS_LOCK) axisRef.current = 'x'
            else if (Math.abs(info.offset.y) > AXIS_LOCK) axisRef.current = 'y'
          }
          if (axisRef.current === 'x') {
            const raw = baseXRef.current + info.offset.x
            const min = -(METRICS.length - 1) * step
            // 가장자리 러버밴딩 — 오버슈트는 최대 70px로 하드 클램프 (화면 밖 이탈 방지)
            const over = raw > 0 ? raw : raw < min ? raw - min : 0
            const damped = Math.sign(over) * Math.min(Math.abs(over) * 0.35, 70)
            x.set(over ? (raw > 0 ? damped : min + damped) : raw)
          } else if (axisRef.current === 'y') {
            // 위로 = 양수(다음), 아래로 = 음수(이전)
            lift.set(Math.max(-LIFT_MAX, Math.min(LIFT_MAX, -info.offset.y)))
          }
        }}
        onPanEnd={(_, info) => {
          if (axisRef.current === 'x') {
            const current = -x.get() / step
            const boost = Math.abs(info.velocity.x) > 420 ? (info.velocity.x < 0 ? 0.5 : -0.5) : 0
            snapTo(Math.round(current + boost))
          } else if (axisRef.current === 'y') {
            if (lift.get() > LIFT_THRESHOLD) onStackNext()
            else if (lift.get() < -LIFT_THRESHOLD) onStackPrev()
            animate(lift, 0, snappy)
          }
          axisRef.current = null
        }}
      >
        <motion.div className="relative" style={{ x, height: CARD_H }}>
          {METRICS.map((m, i) => (
            <CarouselSlot key={m} i={i} x={x} step={step} cardW={cardW} vw={vw}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={
                    m === 'saving'
                      ? `saving-${savingView}`
                      : m === 'invest'
                        ? `invest-${investView}`
                        : `${m}-${period}`
                  }
                  className="h-full"
                  initial={{ y: -20, scale: 0.94, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 64, scale: 1.04, opacity: 0 }}
                  transition={snappy}
                >
                  {renderCard ? (
                    renderCard(m, period, savingView, investView)
                  ) : m === 'budget' ? (
                    <BudgetCard period={period} />
                  ) : m === 'saving' ? (
                    <SavingCard view={savingView} />
                  ) : (
                    <InvestCard view={investView} />
                  )}
                </motion.div>
              </AnimatePresence>
            </CarouselSlot>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

function CarouselSlot({
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
    return 1 - Math.min(d, 1) * 0.1
  })
  const opacity = useTransform(x, (v) => {
    const d = Math.abs(-v / step - i)
    return 1 - Math.min(d, 1) * 0.75
  })
  return (
    <motion.div
      className="absolute top-0"
      style={{
        left: (vw - cardW) / 2 + i * step,
        width: cardW,
        height: CARD_H,
        scale,
        opacity,
      }}
    >
      {children}
    </motion.div>
  )
}

function GhostCard({
  offset,
  scale,
  opacity,
  lift,
  liftFactor,
  cardW,
  vw,
}: {
  offset: number
  scale: number
  opacity: number
  lift: MotionValue<number>
  liftFactor: number
  cardW: number
  vw: number
}) {
  const y = useTransform(lift, (l) => 30 + offset + l * liftFactor)
  const s = useTransform(lift, (l) => scale + (l / LIFT_MAX) * (1 - scale) * 0.9)
  return (
    <motion.div
      aria-hidden
      className="clay-card absolute top-0 rounded-card"
      style={{ left: (vw - cardW) / 2, width: cardW, height: CARD_H, y, scale: s, opacity }}
    />
  )
}
