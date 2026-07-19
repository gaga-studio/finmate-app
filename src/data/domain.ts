import type { Holding, Mission, QuizQuestion, SavingGoal, SimScenario, WeekStreak, WishItem } from './types'
import { mulberry32 } from './seed'

/** 자유예산 — 기간별로 사용자가 따로 설정한 값이라는 설정 */
export const BUDGET_LIMIT = { daily: 20000, weekly: 250000, monthly: 650000 } as const

export const SAVING_GOAL: SavingGoal = {
  title: '파리 한 달 살기',
  target: 5_000_000,
  current: 2_250_000,
  dueDate: '2026-12-31',
}

/**
 * 월별 전체 저축 실적(파리 통장 + 비상금 + 청약 등 수입에서 한 저축 전부).
 * 7월은 셀렉터가 saving 카테고리 거래에서 실측한다.
 */
export const SAVING_MONTHLY_HISTORY: { month: number; amount: number }[] = [
  { month: 3, amount: 720_000 },
  { month: 4, amount: 550_000 },
  { month: 5, amount: 680_000 },
  { month: 6, amount: 610_000 },
]

/** 총자산 구성 — 청년 현실형 (합계가 자산 뷰의 총자산) */
export interface AssetItem {
  id: string
  title: string
  value: number
  emoji: string
}

export const MY_ASSETS: AssetItem[] = [
  { id: 'as-home', title: '전세 보증금', value: 120_000_000, emoji: '🏠' },
  { id: 'as-deposit', title: '예·적금', value: 11_000_000, emoji: '💰' },
  { id: 'as-car', title: '중고차', value: 8_000_000, emoji: '🚗' },
  { id: 'as-paris', title: '파리 여행 통장', value: 2_250_000, emoji: '✈️' },
  { id: 'as-invest', title: '투자 계좌', value: 1_311_565, emoji: '📈' },
]

/** 총자산 월별 추이(2~7월) — 끝값은 MY_ASSETS 합계(142,561,565)와 일치해야 한다 */
export const NET_WORTH_HISTORY: number[] = [
  139_800_000, 140_400_000, 141_050_000, 141_500_000, 142_180_000, 142_561_565,
]

export const HOLDINGS: Holding[] = [
  { ticker: 'TIGER S&P500', name: 'TIGER 미국S&P500', value: 412_000, returnPct: 14.2 },
  { ticker: 'KODEX 200', name: 'KODEX 200', value: 355_000, returnPct: 8.9 },
  { ticker: '005930', name: '삼성전자', value: 248_000, returnPct: 6.1 },
  { ticker: 'KODEX 미국나스닥', name: 'KODEX 미국나스닥100', value: 190_000, returnPct: 17.8 },
  { ticker: 'ACE 금현물', name: 'ACE KRX금현물', value: 121_000, returnPct: 4.3 },
]

/** 총자산 일별 곡선(90일) — 완만한 우상향 + 시드 노이즈 */
export const ASSET_SERIES: number[] = (() => {
  const rng = mulberry32(777)
  const out: number[] = []
  let v = 870_000
  for (let i = 0; i < 90; i++) {
    v += 3500 + (rng() - 0.42) * 14000
    out.push(Math.round(v))
  }
  return out
})()

/**
 * 위시 리스트 — 진행률 내림차순 유지.
 * 파리 관련은 저축 목표(45%)가 담당하므로 넣지 않고,
 * 운동화·맥북 에어는 이미 구매해서 제외(맥북 프로가 다음 꿈).
 */
export const WISHLIST: WishItem[] = [
  { id: 'w1', title: '여행 캐리어', price: 320_000, savedPct: 0.65, emoji: '🧳' },
  { id: 'w2', title: '에어팟 프로', price: 359_000, savedPct: 0.4, emoji: '🎧' },
  { id: 'w3', title: '필름 카메라', price: 240_000, savedPct: 0.25, emoji: '📷' },
  { id: 'w4', title: '애플워치', price: 590_000, savedPct: 0.1, emoji: '⌚️' },
  { id: 'w5', title: '맥북 프로', price: 2_390_000, savedPct: 0.08, emoji: '💻' },
]

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: '투자 O/X 퀴즈 3문제',
    detail: 'ETF 기초, 1분이면 충분해요',
    reward: '+20 XP',
    done: true,
    linkTo: '#quiz',
  },
  {
    id: 'm2',
    title: '어제보다 100원 덜 쓰기',
    detail: '어제 지출 14,100원 · 오늘 13,900원',
    reward: '+10 XP',
    done: true,
  },
  {
    id: 'm3',
    title: '여행 통장에 5,000원 옮기기',
    detail: '파리 한 달 살기까지 45%',
    reward: '+15 XP',
    done: false,
  },
]

/** 일~토, 2026-07-18은 토요일이라 이번 주가 꽉 찼다 */
export const WEEK_STREAK: WeekStreak = {
  days: [true, false, true, false, true, true, true],
  flame: 3,
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'ETF는 한 종목만 사도 여러 회사에 분산투자가 된다.',
    answer: true,
    explanation: 'ETF는 여러 종목을 묶은 바구니라, 한 주만 사도 분산 효과가 있어요.',
  },
  {
    id: 'q2',
    question: '적금 금리 5%면, 1년 뒤 원금 전체에 5% 이자가 붙는다.',
    answer: false,
    explanation: '적금은 매달 넣은 돈마다 남은 기간만큼만 이자가 붙어 실수령은 그보다 적어요.',
  },
  {
    id: 'q3',
    question: '비상금은 투자보다 먼저 만드는 것이 좋다.',
    answer: true,
    explanation: '갑작스러운 지출에 투자금을 깨지 않으려면 비상금이 먼저예요.',
  },
]

/** 금융렌즈 시나리오: 12만원 운동화 */
export const SIM_SCENARIO: SimScenario = (() => {
  const weeks = 12
  const base: number[] = []
  const alt: number[] = []
  const branchIndex = 2
  let v = 1_280_000
  for (let i = 0; i < weeks; i++) {
    v += 52_000
    base.push(v)
    alt.push(i < branchIndex ? v : v - 120_000 - (i - branchIndex) * 9_000)
  }
  return {
    id: 'sim-shoes',
    label: '산다 vs 참는다',
    subject: '12만원 운동화',
    price: 120_000,
    baseCurve: base,
    altCurve: alt,
    branchIndex,
    lens: { goalDelayDays: 11, freeBudgetPct: 46, safety: 'warn' },
  }
})()
