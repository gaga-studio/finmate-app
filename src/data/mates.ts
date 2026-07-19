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
  { emoji: '📊', label: '국내 ETF', band: '비중 30~50%' },
  { emoji: '🌎', label: '해외 ETF', band: '비중 20~40%' },
  { emoji: '🏢', label: '개별 주식', band: '비중 10~30%' },
  { emoji: '🚀', label: '비상장', band: '비중 5~15%' },
  { emoji: '🏦', label: '파킹·예금', band: '비중 10~30%' },
]

const SAVING_GOALS = ['첫 집 마련', '유럽 여행', '비상금 완성', '노트북 교체', '대학원 등록금']

function pick3(rng: () => number, pool: MateCategoryRow[]): MateCategoryRow[] {
  const shuffled = [...pool].sort(() => rng() - 0.5)
  return shuffled.slice(0, 3)
}

/** id 시드 기반 제너릭 프로필 — 같은 메이트는 언제나 같은 수치(촬영 재현성) */
function generate(author: ProfileSummary): MateProfile {
  let seed = 0
  for (const ch of author.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rng = mulberry32(seed)
  const budgetLeftPct = 15 + Math.round(rng() * 55)
  return {
    ...author,
    similarity: author.similarity ?? 0.5 + Math.round(rng() * 40) / 100,
    metrics: {
      budgetLeftPct,
      budgetBand: budgetLeftPct > 40 ? '하루 1~2만원대' : '하루 2~3만원대',
      savingPct: 25 + Math.round(rng() * 55),
      savingGoal: SAVING_GOALS[Math.floor(rng() * SAVING_GOALS.length)],
      investReturnPct: Math.round((rng() * 25 - 5) * 10) / 10,
    },
    topCategories: {
      budget: pick3(rng, SPEND_POOL),
      saving: pick3(rng, SAVING_POOL),
      invest: pick3(rng, INVEST_POOL),
    },
  }
}

/** 시연 핵심 메이트는 수기 오버라이드 — 인사이트 비교(COMPARE_TARGETS) 서사와 정합 */
const OVERRIDES: Record<string, Partial<MateProfile['metrics']> & { similarity?: number; topCategories?: Partial<Record<Metric, MateCategoryRow[]>> }> = {
  'a-paris': {
    similarity: 0.86,
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
  const { similarity, topCategories, ...metrics } = over
  return {
    ...base,
    similarity: similarity ?? base.similarity,
    metrics: { ...base.metrics, ...metrics },
    topCategories: { ...base.topCategories, ...topCategories },
  }
})

export function getMateProfile(id: string): MateProfile | undefined {
  return MATE_PROFILES.find((m) => m.id === id)
}
