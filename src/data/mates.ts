import { AUTHORS } from './social'
import { mulberry32 } from './seed'
import type { Metric, ProfileSummary } from './types'

/**
 * 메이트 프로필 — my 탭과 같은 구조지만 프라이버시 필터링이 걸린 데이터.
 * 상호명 대신 카테고리, 정확한 금액 대신 구간(밴드)만 노출한다.
 */

export interface MateCategoryRow {
  emoji: string
  /** 카테고리명 — 구체 상호명 금지 */
  label: string
  /** 금액 구간 표기 */
  band: string
}

/** 마이 탭 9뷰에 대응하는 필터링 데이터 — 전부 %·구간·상대값 */
export interface MateViews {
  budget: Record<'daily' | 'weekly' | 'monthly', { leftPct: number; band: string }>
  saving: {
    goalPct: number
    goalLabel: string
    /** 월 저축 페이스 구간 */
    paceBand: string
    /** 월별 저축 상대 막대(금액 비공개) — 마지막이 이번 달 */
    monthlyBars: number[]
    /** 총자산 구간 */
    assetBand: string
    /** 자산 추이 정규화 곡선 */
    assetTrend: number[]
  }
  invest: {
    returnPct: number
    /** 평가액 추이 정규화 곡선 */
    trend: number[]
    /** 카테고리 비중 — 합 1 */
    portfolio: { label: string; weight: number }[]
  }
}

export interface MateProfile extends ProfileSummary {
  metrics: {
    /** 예산 남은 비율 % */
    budgetLeftPct: number
    /** 하루 소비 구간 카피 */
    budgetBand: string
    /** 저축 목표 진행률 % */
    savingPct: number
    /** 저축 목표 이름 (금액 비공개) */
    savingGoal: string
    /** 총 수익률 % */
    investReturnPct: number
  }
  /** 지표별 탑3 — 카테고리 + 구간만 */
  topCategories: Record<Metric, MateCategoryRow[]>
  /** 마이 탭 9뷰 대응 데이터 */
  views: MateViews
}

const SPEND_POOL: MateCategoryRow[] = [
  { emoji: '☕️', label: '카페', band: '3~5만원' },
  { emoji: '🍜', label: '외식', band: '10~15만원' },
  { emoji: '👟', label: '패션', band: '10~15만원' },
  { emoji: '🛒', label: '생활·잡화', band: '5~10만원' },
  { emoji: '🎬', label: '문화·여가', band: '5~10만원' },
  { emoji: '💻', label: '전자기기', band: '15~20만원' },
  { emoji: '🚇', label: '교통', band: '3~5만원' },
  { emoji: '💄', label: '뷰티', band: '5~10만원' },
]

const SAVING_POOL: MateCategoryRow[] = [
  { emoji: '🏠', label: '주택청약', band: '월 10~20만원' },
  { emoji: '✈️', label: '여행 통장', band: '월 20~30만원' },
  { emoji: '🛡️', label: '비상금', band: '월 10~20만원' },
  { emoji: '💰', label: '정기적금', band: '월 30~50만원' },
  { emoji: '🎓', label: '자기계발', band: '월 5~10만원' },
]

const INVEST_POOL: MateCategoryRow[] = [
  { emoji: '📊', label: '국내 ETF', band: '30~50%' },
  { emoji: '🌎', label: '해외 ETF', band: '20~40%' },
  { emoji: '🏢', label: '개별 주식', band: '10~30%' },
  { emoji: '🚀', label: '비상장', band: '5~15%' },
  { emoji: '🏦', label: '파킹·예금', band: '10~30%' },
]

const SAVING_GOALS = ['첫 집 마련', '유럽 여행', '비상금 완성', '노트북 교체', '대학원 등록금']

function pick3(rng: () => number, pool: MateCategoryRow[]): MateCategoryRow[] {
  const shuffled = [...pool].sort(() => rng() - 0.5)
  return shuffled.slice(0, 3)
}

const ASSET_BANDS = ['500~1,000만', '1,000~1,500만', '1,500~2,000만', '2,000만 이상']

function paceBandOf(goalPct: number): string {
  return goalPct >= 70 ? '월 50만원 이상' : goalPct >= 45 ? '월 30~50만원' : '월 10~30만원'
}

/** 완만한 우상향 정규화 곡선(0~1) — 시드 기반 굴곡 */
function trendOf(rng: () => number, points = 6): number[] {
  const out: number[] = []
  let v = 0.15 + rng() * 0.2
  for (let i = 0; i < points; i++) {
    out.push(Math.min(1, v))
    v += 0.08 + rng() * 0.14
  }
  return out
}

/** id 시드 기반 제너릭 프로필 — 같은 메이트는 언제나 같은 수치(촬영 재현성) */
function generate(author: ProfileSummary): MateProfile {
  let seed = 0
  for (const ch of author.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rng = mulberry32(seed)
  const budgetLeftPct = 15 + Math.round(rng() * 55)
  const savingPct = 25 + Math.round(rng() * 55)
  const savingGoal = SAVING_GOALS[Math.floor(rng() * SAVING_GOALS.length)]
  const investReturnPct = Math.round((rng() * 25 - 5) * 10) / 10

  const weights = [0.5, 0.3, 0.2]
  const portfolio = pick3(rng, INVEST_POOL).map((row, i) => ({ label: row.label, weight: weights[i] }))

  return {
    ...author,
    similarity: author.similarity ?? 0.5 + Math.round(rng() * 40) / 100,
    metrics: {
      budgetLeftPct,
      budgetBand: budgetLeftPct > 40 ? '하루 1~2만원대' : '하루 2~3만원대',
      savingPct,
      savingGoal,
      investReturnPct,
    },
    topCategories: {
      budget: pick3(rng, SPEND_POOL),
      saving: pick3(rng, SAVING_POOL),
      invest: pick3(rng, INVEST_POOL),
    },
    views: {
      budget: {
        daily: { leftPct: budgetLeftPct, band: budgetLeftPct > 40 ? '하루 1~2만원대' : '하루 2~3만원대' },
        weekly: {
          leftPct: Math.max(10, Math.min(75, budgetLeftPct + Math.round(rng() * 20 - 10))),
          band: budgetLeftPct > 40 ? '주 7~10만원대' : '주 10~15만원대',
        },
        monthly: {
          leftPct: Math.max(10, Math.min(75, budgetLeftPct + Math.round(rng() * 20 - 10))),
          band: budgetLeftPct > 40 ? '월 40~60만원대' : '월 60~80만원대',
        },
      },
      saving: {
        goalPct: savingPct,
        goalLabel: savingGoal,
        paceBand: paceBandOf(savingPct),
        monthlyBars: Array.from({ length: 5 }, () => 0.35 + rng() * 0.65),
        assetBand: ASSET_BANDS[Math.floor(rng() * ASSET_BANDS.length)],
        assetTrend: trendOf(rng),
      },
      invest: {
        returnPct: investReturnPct,
        trend: trendOf(rng),
        portfolio,
      },
    },
  }
}

/** 시연 핵심 메이트는 수기 오버라이드 — 인사이트 비교(COMPARE_TARGETS) 서사와 정합 */
const OVERRIDES: Record<string, Partial<MateProfile['metrics']> & { similarity?: number; topCategories?: Partial<Record<Metric, MateCategoryRow[]>>; assetBand?: string; portfolio?: { label: string; weight: number }[] }> = {
  'a-paris': {
    similarity: 0.86,
    assetBand: '2,000만 이상',
    portfolio: [
      { label: '해외 ETF', weight: 0.4 },
      { label: '국내 ETF', weight: 0.35 },
      { label: '파킹·예금', weight: 0.25 },
    ],
    budgetLeftPct: 52,
    budgetBand: '하루 1~2만원대',
    savingPct: 78,
    savingGoal: '파리 이주 자금',
    investReturnPct: 9.4,
    topCategories: {
      saving: [
        { emoji: '✈️', label: '파리 통장', band: '월 50만원 이상' },
        { emoji: '💰', label: '정기적금', band: '월 30~50만원' },
        { emoji: '🛡️', label: '비상금', band: '월 10~20만원' },
      ],
    },
  },
  'a-tuna': {
    similarity: 0.91,
    budgetLeftPct: 61,
    budgetBand: '하루 1만원 이하',
    savingPct: 55,
    savingGoal: '비상금 완성',
    investReturnPct: 4.2,
  },
  'a-bear': {
    similarity: 0.78,
    assetBand: '1,500~2,000만',
    budgetLeftPct: 34,
    budgetBand: '하루 2~3만원대',
    savingPct: 48,
    savingGoal: '첫 집 마련',
    investReturnPct: 15.8,
  },
}

export const MATE_PROFILES: MateProfile[] = Object.values(AUTHORS).map((author) => {
  const base = generate(author)
  const over = OVERRIDES[author.id]
  if (!over) return base
  const { similarity, topCategories, assetBand, portfolio, ...metrics } = over
  const merged: MateProfile = {
    ...base,
    similarity: similarity ?? base.similarity,
    metrics: { ...base.metrics, ...metrics },
    topCategories: { ...base.topCategories, ...topCategories },
  }
  // 수기 오버라이드를 9뷰 데이터에도 동기화 — 비교/캐러셀 수치가 항상 일치
  merged.views = {
    ...base.views,
    budget: {
      daily: { leftPct: merged.metrics.budgetLeftPct, band: merged.metrics.budgetBand },
      weekly: {
        leftPct: Math.max(10, merged.metrics.budgetLeftPct - 6),
        band: merged.metrics.budgetLeftPct > 40 ? '주 7~10만원대' : '주 10~15만원대',
      },
      monthly: {
        leftPct: Math.max(10, merged.metrics.budgetLeftPct - 9),
        band: merged.metrics.budgetLeftPct > 40 ? '월 40~60만원대' : '월 60~80만원대',
      },
    },
    saving: {
      ...base.views.saving,
      goalPct: merged.metrics.savingPct,
      goalLabel: merged.metrics.savingGoal,
      paceBand: paceBandOf(merged.metrics.savingPct),
      assetBand: assetBand ?? base.views.saving.assetBand,
    },
    invest: {
      ...base.views.invest,
      returnPct: merged.metrics.investReturnPct,
      portfolio: portfolio ?? base.views.invest.portfolio,
    },
  }
  return merged
})

export function getMateProfile(id: string): MateProfile | undefined {
  return MATE_PROFILES.find((m) => m.id === id)
}

/* ---------- 9뷰 연동 리스트 — 지혜 쪽 LinkedListPanel과 대칭 ---------- */

/** 소비 카테고리별 기간 밴드 — SPEND_POOL 라벨과 1:1 (수기 매핑, 월 기준을 일/주로 스케일) */
const SPEND_PERIOD_BANDS: Record<string, { daily: string; weekly: string; monthly: string }> = {
  카페: { daily: '3~5천원', weekly: '1~2만원', monthly: '3~5만원' },
  외식: { daily: '1~2만원', weekly: '3~5만원', monthly: '10~15만원' },
  패션: { daily: '0~1만원', weekly: '2~5만원', monthly: '10~15만원' },
  '생활·잡화': { daily: '5천~1만원', weekly: '1~3만원', monthly: '5~10만원' },
  '문화·여가': { daily: '0~1만원', weekly: '1~3만원', monthly: '5~10만원' },
  전자기기: { daily: '0~2만원', weekly: '3~5만원', monthly: '15~20만원' },
  교통: { daily: '3~5천원', weekly: '1~2만원', monthly: '3~5만원' },
  뷰티: { daily: '0~1만원', weekly: '1~3만원', monthly: '5~10만원' },
}

const INCOME_POOL: MateCategoryRow[] = [
  { emoji: '💼', label: '월급', band: '월 200만대' },
  { emoji: '🧑‍💻', label: '사이드잡', band: '월 10~30만' },
  { emoji: '🛍️', label: '중고 판매', band: '월 5~10만' },
  { emoji: '🏦', label: '이자·배당', band: '월 1~5만' },
  { emoji: '🎁', label: '앱테크', band: '월 1~3만' },
]

const INTEREST_POOL: MateCategoryRow[] = [
  { emoji: '🤖', label: 'AI 반도체', band: '비중 확대 중' },
  { emoji: '🔋', label: '2차전지', band: '관망' },
  { emoji: '🇺🇸', label: '미국 지수', band: '적립 중' },
  { emoji: '💸', label: '배당주', band: '신규 관심' },
  { emoji: '🥇', label: '금·원자재', band: '관망' },
]

/** 메이트별 오버라이드 — 시연 핵심 인물의 서사 정합 */
const LIST_OVERRIDES: Record<string, Partial<Record<'income' | 'asset', MateCategoryRow[]>>> = {
  'a-paris': {
    income: [
      { emoji: '💼', label: '월급', band: '월 250만대' },
      { emoji: '🧑‍💻', label: '사이드잡', band: '월 30~50만' },
      { emoji: '🏦', label: '이자·배당', band: '월 5~10만' },
    ],
  },
}

function seededRng(key: string): () => number {
  let seed = 0
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  return mulberry32(seed)
}

export interface MateListView {
  title: string
  items: MateCategoryRow[]
}

/** 지표+뷰 → 메이트 리스트 — 카테고리·구간만, 시드 고정(촬영 재현성) */
export function getMateListRows(
  mate: MateProfile,
  metric: Metric,
  period: 'daily' | 'weekly' | 'monthly',
  savingView: 'goal' | 'monthly' | 'asset',
  investView: 'status' | 'portfolio' | 'news',
): MateListView {
  if (metric === 'budget') {
    return {
      title: '소비 탑 3',
      items: mate.topCategories.budget.map((row) => ({
        ...row,
        band: SPEND_PERIOD_BANDS[row.label]?.[period] ?? row.band,
      })),
    }
  }
  if (metric === 'saving') {
    if (savingView === 'monthly') {
      const items =
        LIST_OVERRIDES[mate.id]?.income ?? pick3(seededRng(`${mate.id}-income`), INCOME_POOL)
      return { title: '소득 출처', items }
    }
    if (savingView === 'asset') {
      const rng = seededRng(`${mate.id}-asset`)
      const first = 45 + Math.round(rng() * 15)
      const second = 20 + Math.round(rng() * 15)
      return {
        title: '자산 구성',
        items: [
          { emoji: '💰', label: '예·적금', band: `${first}~${first + 10}%` },
          { emoji: '📈', label: '투자', band: `${second}~${second + 10}%` },
          { emoji: '🏦', label: '파킹 통장', band: '10~20%' },
        ],
      }
    }
    return { title: '저축 구성', items: mate.topCategories.saving }
  }
  if (investView === 'portfolio') {
    return {
      title: '포폴 비중',
      items: mate.views.invest.portfolio.map((p, i) => ({
        emoji: ['📊', '🌎', '🏦'][i] ?? '📊',
        label: p.label,
        band: `${Math.round(p.weight * 100)}%`,
      })),
    }
  }
  if (investView === 'news') {
    return { title: '관심 분야', items: pick3(seededRng(`${mate.id}-interest`), INTEREST_POOL) }
  }
  return { title: '투자 구성', items: mate.topCategories.invest }
}
