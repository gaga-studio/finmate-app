import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, Sparkles, Users } from 'lucide-react'
import { getMateProfile, type MateCategoryRow, type MateProfile } from '../../data/mates'
import { getBudget, getInvestStatus, getSavingProgress, getTopPurchases } from '../../data/selectors'
import { HOLDINGS, MY_ASSETS } from '../../data/domain'
import { STORIES } from '../../data/social'
import { ART } from '../../data/art-manifest'
import { CATEGORY_META } from '../../data/categories'
import { formatKrw, formatKrwCompact } from '../../shared/format/krw'
import { ProfileCard } from '../../shared/profile/ProfileCard'
import { MetricCarousel } from '../my/carousel/MetricCarousel'
import { MetricTabs } from '../my/MetricTabs'
import { ViewChips } from '../my/ViewChips'
import { makeMateCardRenderer } from './MateMetricCards'
import { PageTitle } from '../../shared/ui/PageTitle'
import { WaterGlass } from '../../shared/charts/WaterGlass'
import { SpeedGauge } from '../../shared/charts/SpeedGauge'
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
const CARD_TITLE: Record<Metric, string> = { budget: '오늘의 예산', saving: '저축 목표', invest: '투자 현황' }
const LIST_TITLE: Record<Metric, string> = { budget: '소비 탑 3', saving: '저축 구성', invest: '투자 구성' }

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
  const [metric, setMetric] = useState<Metric>(id === 'a-bear' ? 'invest' : 'budget')
  const [period, setPeriod] = useState<Period>('daily')
  const [savingView, setSavingView] = useState<SavingView>('goal')
  const [investView, setInvestView] = useState<InvestView>('status')
  const [following, setFollowing] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  if (!mate) return <Navigate to="/feed" replace />

  // 마이 탭 하단 아트 카드 자리 — 이 메이트가 올린 스토리 이미지 재활용 (지표 일치 우선)
  const story =
    STORIES.find((s) => s.author.id === mate.id && s.metric === metric) ??
    STORIES.find((s) => s.author.id === mate.id)

  return (
    <div className="relative min-h-full pb-8">
      <header className="relative flex items-center justify-between px-5 pb-1 pt-14">
        <PageTitle>메이트</PageTitle>
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

      <ProfileCard profile={mate} className="px-5" />

      {/* 지표 밑줄 탭 — 마이와 동일 문법, 프로필/비교 공용 */}
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
            className="mt-3 px-5"
          >
            <CompareView mate={mate} metric={metric} />
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
                <MateListCard title={LIST_TITLE[metric]} metricClass={METRIC_TEXT[metric]} items={mateRows(mate, metric)} />
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
          onClick={() => (comparing ? setAnalysisOpen(true) : setComparing(true))}
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

/** 메이트 쪽 리스트 rows — 카테고리 + 구간만 */
function mateRows(mate: MateProfile, metric: Metric): ListItem[] {
  return mate.topCategories[metric].map((row: MateCategoryRow) => ({
    emoji: row.emoji,
    label: row.label,
    value: row.band,
  }))
}

/** 내 쪽 리스트 rows — 내 데이터라 실명·실측 그대로 */
function myRows(metric: Metric): ListItem[] {
  if (metric === 'budget') {
    return getTopPurchases('monthly', 3).map((t) => ({
      emoji: CATEGORY_META[t.category].emoji,
      label: t.merchant,
      value: formatKrw(t.amount),
      valueClass: 'text-budget',
    }))
  }
  if (metric === 'saving') {
    return [...MY_ASSETS]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((a) => ({ emoji: a.emoji, label: a.title, value: formatKrwCompact(a.value), valueClass: 'text-saving' }))
  }
  return [...HOLDINGS]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((h) => ({
      emoji: '📈',
      label: h.name,
      value: `${h.returnPct >= 0 ? '+' : ''}${h.returnPct}%`,
      valueClass: h.returnPct >= 0 ? 'text-rise' : 'text-fall',
    }))
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
      <p className={`mb-1 font-bold text-ink ${dense ? 'text-body' : 'text-section'}`}>{title}</p>
      <div className="flex flex-1 flex-col justify-evenly">
        {items.map((row, i) => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-3.5 text-caption font-extrabold text-ink-faint">{i + 1}</span>
            <span className={`flex shrink-0 items-center justify-center rounded-lg bg-point/55 ${dense ? 'h-7 w-7 text-caption' : 'h-8 w-8 text-body'}`}>
              {row.emoji}
            </span>
            <span className={`min-w-0 flex-1 truncate font-semibold text-ink ${dense ? 'text-caption' : 'text-body'}`}>
              {row.label}
            </span>
            <span className={`shrink-0 font-bold ${dense ? 'text-caption' : 'text-body'} ${row.valueClass ?? metricClass}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 나와 비교하기 — 좌 메이트 / 우 지혜, 각 열에 [지표 카드 + 리스트 카드] */
function CompareView({ mate, metric }: { mate: MateProfile; metric: Metric }) {
  const my = {
    budgetLeftPct: Math.round(getBudget('daily').pct * 100),
    savingPct: Math.round(getSavingProgress('monthly').pct * 100),
    investReturnPct: getInvestStatus().returnPct,
  }
  const mateVal =
    metric === 'budget' ? mate.metrics.budgetLeftPct : metric === 'saving' ? mate.metrics.savingPct : mate.metrics.investReturnPct
  const myVal = metric === 'budget' ? my.budgetLeftPct : metric === 'saving' ? my.savingPct : my.investReturnPct

  return (
    <div data-testid="compare-columns">
      <div className="mb-2 grid grid-cols-2 gap-2.5 text-center">
        <p className="text-body font-extrabold text-ink">
          {mate.emoji} {mate.nickname}
        </p>
        <p className="text-body font-extrabold text-ink">🙋‍♀️ 지혜</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5" data-metric={metric}>
        <MiniMetricCard metric={metric} value={mateVal} />
        <MiniMetricCard metric={metric} value={myVal} />
        <div className="h-[190px]">
          <MateListCard title={LIST_TITLE[metric]} metricClass={METRIC_TEXT[metric]} items={mateRows(mate, metric)} dense />
        </div>
        <div className="h-[190px]">
          <MateListCard title={LIST_TITLE[metric]} metricClass={METRIC_TEXT[metric]} items={myRows(metric)} dense />
        </div>
      </div>
    </div>
  )
}

function MiniMetricCard({ metric, value }: { metric: Metric; value: number }) {
  return (
    <div className={`flex flex-col items-center overflow-hidden rounded-2xl bg-elevated shadow-soft ${METRIC_TEXT[metric]}`}>
      <div className="w-full bg-current/25 py-1.5 text-center">
        <p className="text-caption font-bold text-ink">{CARD_TITLE[metric]}</p>
      </div>
      <div className="flex min-h-[124px] flex-col items-center justify-center px-3 py-2.5">
        {metric === 'budget' && <WaterGlass pct={value / 100} width={58} height={66} />}
        {metric === 'saving' && <SpeedGauge pct={value / 100} width={96} height={74} />}
        {metric === 'invest' ? (
          <p className={`text-[26px] font-extrabold leading-none ${value >= 0 ? 'text-rise' : 'text-fall'}`}>
            {value >= 0 ? '+' : ''}
            {value}%
          </p>
        ) : (
          <p className="mt-1 text-title font-extrabold leading-none">{value}%</p>
        )}
      </div>
    </div>
  )
}
