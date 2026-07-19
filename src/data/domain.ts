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
 * 목표 시작(3월) 이후 월별 저축 실적 — 7월은 셀렉터가 거래에서 실측한다.
 * 시작 잔액 + 히스토리 합 + 7월 실측(66,600) = current(225만) 정합.
 */
export const SAVING_MONTHLY_HISTORY: { month: number; amount: number }[] = [
  { month: 3, amount: 520_000 },
  { month: 4, amount: 300_000 },
  { month: 5, amount: 460_000 },
  { month: 6, amount: 350_000 },
]

/** 3월 목표 시작 시점에 이미 모여 있던 금액 */
export const SAVING_START_BALANCE = 553_400

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

export const WISHLIST: WishItem[] = [
  { id: 'w1', title: 'MacBook Air', price: 1_590_000, savedPct: 0.38, emoji: '💻' },
  { id: 'w2', title: '파리 왕복 항공권', price: 890_000, savedPct: 0.72, emoji: '✈️' },
  { id: 'w3', title: '에어팟 프로', price: 359_000, savedPct: 0.21, emoji: '🎧' },
  { id: 'w4', title: '러닝화', price: 120_000, savedPct: 0.55, emoji: '👟' },
  { id: 'w5', title: '필름 카메라', price: 240_000, savedPct: 0.12, emoji: '📷' },
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
