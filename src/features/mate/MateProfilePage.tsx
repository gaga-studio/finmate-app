import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, Sparkles, Users } from 'lucide-react'
import { getMateListRows, getMateProfile } from '../../data/mates'
import { STORIES } from '../../data/social'
import { ART } from '../../data/art-manifest'
import { ProfileCard } from '../../shared/profile/ProfileCard'
import { MetricCarousel } from '../my/carousel/MetricCarousel'
import { LinkedListPanel } from '../my/panels/LinkedListPanel'
import { MetricTabs } from '../my/MetricTabs'
import { ViewChips } from '../my/ViewChips'
import { makeMateCardRenderer } from './MateMetricCards'
import { makeCompareCardRenderer } from './CompareCards'
import { MateAnalysisOverlay } from './MateAnalysisOverlay'
import { snappy } from '../../shared/motion/springs'
import {
  nextInvestView,
  nextPeriod,
  nextSavingView,
  prevInvestView,
  prevPeriod,
  prevSavingView,
  type InvestView,
  type Period,
  type SavingView,
} from '../my/myState'
import type { Metric } from '../../data/types'

const METRIC_TEXT: Record<Metric, string> = { budget: 'text-budget', saving: 'text-saving', invest: 'text-invest' }

interface ListItem {
  emoji: string
  label: string
  value: string
  valueClass?: string
}

/** 메이트 프로필 — 마이 탭과 같은 화면 문법, 데이터는 카테고리·구간으로 필터링 */
export function MateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mate = id ? getMateProfile(id) : undefined
  const rootRef = useRef<HTMLDivElement>(null)
  const [metric, setMetric] = useState<Metric>('budget')
  const [period, setPeriod] = useState<Period>('daily')
  const [savingView, setSavingView] = useState<SavingView>('goal')
  const [investView, setInvestView] = useState<InvestView>('status')
  const [following, setFollowing] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  if (!mate) return <Navigate to="/feed" replace />

  // 지혜 쪽 LinkedListPanel과 대칭 — 지표+뷰 9가지를 함께 갈아입는다
  const mateList = getMateListRows(mate, metric, period, savingView, investView)

  // 마이 탭 하단 아트 카드 자리 — 이 메이트가 올린 스토리 이미지 재활용 (지표 일치 우선)
  const story =
    STORIES.find((s) => s.author.id === mate.id && s.metric === metric) ??
    STORIES.find((s) => s.author.id === mate.id)

  return (
    <div ref={rootRef} className="relative min-h-full pb-8">
      <header className="relative flex items-center justify-between px-5 pb-1 pt-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="clay-card flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform active:scale-95"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setFollowing((v) => !v)}
          className={`flex h-9 items-center rounded-full px-4 text-body font-bold ${
            following ? 'clay-pressed bg-point/45 text-ink-soft' : 'clay-cta'
          }`}
        >
          {following ? '팔로잉 ✓' : '팔로우'}
        </button>
      </header>

      <ProfileCard profile={mate} className="px-5" compactName similarityRing />

      {/* 지표 밑줄 탭 — 프로필/비교 공용 */}
      <div className="mt-3">
        <MetricTabs metric={metric} onChange={setMetric} layoutId="mate-metric-tab" />
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {comparing ? (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
          >
            {/* 캐러셀 그대로 — 카드 슬롯에 좌 메이트/우 나 쌍이 함께 넘어간다 */}
            <div className="pt-2" data-metric={metric}>
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
                renderCard={makeCompareCardRenderer(mate)}
              />
            </div>

            <div className="relative mt-2 flex justify-center">
              <ViewChips
                id="mate-compare-period"
                metric={metric}
                period={period}
                savingView={savingView}
                investView={investView}
                onPeriod={setPeriod}
                onSavingView={setSavingView}
                onInvestView={setInvestView}
              />
            </div>

            {/* 연동 리스트 2열 — 좌 메이트(카테고리·구간) / 우 나(실측, 뷰 따라 전환) */}
            <section className="mt-4 px-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-line/80" />
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-caption font-extrabold text-ink-faint">
                  비교 요약
                </span>
                <span className="h-px flex-1 bg-line/80" />
              </div>
              <div className="mb-2.5 grid grid-cols-2 gap-3 text-center">
                <p className="mx-auto grid w-full max-w-[132px] grid-cols-[32px_minmax(0,1fr)] items-center gap-1 text-[17px] font-extrabold leading-snug text-ink">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white shadow-soft">
                    <EmojiIcon emoji="🙋‍♀️" size={16} className="text-accent" />
                  </span>
                  <span className="truncate">지혜</span>
                </p>
                <p className="mx-auto grid w-full max-w-[132px] grid-cols-[32px_minmax(0,1fr)] items-center gap-1 text-[17px] font-extrabold leading-snug text-ink">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white shadow-soft">
                    <EmojiIcon emoji={mate.emoji} avatarId={mate.id} size={22} className="text-accent" />
                  </span>
                  <span className="truncate">{mate.nickname}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-[248px]">
                  <LinkedListPanel
                    metric={metric}
                    period={period}
                    savingView={savingView}
                    investView={investView}
                    hideSub
                  />
                </div>
                <div className="h-[248px]">
                  <MateListCard
                    title={mateList.title}
                    metricClass={METRIC_TEXT[metric]}
                    items={mateList.items.map((r) => ({ emoji: r.emoji, label: r.label, value: r.band }))}
                    dense
                  />
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={snappy}
          >
            {/* 마이 탭과 동일한 캐러셀 — 가로 스와이프=지표, 세로/휠=뷰 스택 */}
            <div className="pt-2" data-metric={metric}>
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
                renderCard={makeMateCardRenderer(mate)}
              />
            </div>

            <div className="relative mt-2 flex justify-center">
              <ViewChips
                id="mate-period"
                metric={metric}
                period={period}
                savingView={savingView}
                investView={investView}
                onPeriod={setPeriod}
                onSavingView={setSavingView}
                onInvestView={setInvestView}
              />
            </div>

            {/* 하단 2열 — 마이 탭처럼 좌 이미지 카드, 우 리스트 카드 */}
            <section className="mt-3 grid grid-cols-[1fr_1.15fr] gap-3 px-5">
              <div className="clay-card relative h-[232px] overflow-hidden rounded-card">
                {story && (
                  <img
                    src={ART.stories[story.artKey]}
                    alt=""
                    draggable={false}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                  />
                )}
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-caption font-bold text-white backdrop-blur-sm">
                  메이트의 스토리
                </span>
              </div>
              <div className="h-[232px]">
                <MateListCard
                  title={mateList.title}
                  metricClass={METRIC_TEXT[metric]}
                  items={mateList.items.map((r) => ({ emoji: r.emoji, label: r.label, value: r.band }))}
                />
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 하단 중앙 버튼 — 콘텐츠 흐름 안이라 리스트를 가리지 않는다 */}
      <div className="mt-5 flex items-center justify-center gap-2.5 px-5">
        <motion.button
          type="button"
          layout
          onClick={() => {
            if (comparing) {
              setAnalysisOpen(true)
              return
            }
            setComparing(true)
            // 비교 모드는 캐러셀부터 다시 보이도록 — 스크롤 컨테이너(TabLayout <main>)를 맨 위로
            rootRef.current?.closest('main')?.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          whileTap={{ scale: 0.96 }}
          className="clay-cta flex h-12 items-center gap-2 rounded-[18px] px-6 text-section font-bold"
          transition={snappy}
        >
          {comparing ? <Sparkles size={16} /> : <Users size={16} />}
          {comparing ? '분석 비교' : '나와 비교하기'}
        </motion.button>
        {comparing && (
          <button
            type="button"
            onClick={() => setComparing(false)}
            className="clay-pressed flex h-12 items-center rounded-[18px] bg-point/45 px-4 text-body font-bold text-ink"
          >
            프로필로
          </button>
        )}
      </div>

      <AnimatePresence>
        {analysisOpen && <MateAnalysisOverlay mate={mate} onClose={() => setAnalysisOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

function MateListCard({
  title,
  metricClass,
  items,
  dense,
}: {
  title: string
  metricClass: string
  items: ListItem[]
  dense?: boolean
}) {
  return (
    <div className="clay-card flex h-full flex-col rounded-card px-3.5 py-3">
      <p className="mb-1 text-section font-bold text-ink">{title}</p>
      {/* 뷰 전환 시 지혜 쪽 패널과 같은 갈아입기 모션 */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${title}-${items.map((r) => r.label).join('|')}`}
          className="flex flex-1 flex-col justify-evenly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={snappy}
        >
          {items.map((row, i) => (
            <div key={row.label} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2">
              <span
                className={`flex shrink-0 items-center justify-center rounded-lg bg-ink/5 font-extrabold text-ink-soft ${
                  dense ? 'h-7 w-7 text-body' : 'h-8 w-8 text-body'
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink">
                {row.label}
              </span>
              <span
                className={`shrink-0 text-body font-bold ${row.valueClass ?? metricClass}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
