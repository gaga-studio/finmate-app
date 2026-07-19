export type Period = 'daily' | 'weekly' | 'monthly'
export type Metric = 'budget' | 'saving' | 'invest'

export type Category =
  | 'food'
  | 'cafe'
  | 'transport'
  | 'shopping'
  | 'subscription'
  | 'entertainment'
  | 'saving'
  | 'invest'
  | 'income'

export interface Transaction {
  id: string
  /** "2026-07-18" */
  date: string
  merchant: string
  /** 지출 음수, 수입 양수 (원) */
  amount: number
  category: Category
  memo?: string
}

export interface SavingGoal {
  title: string
  target: number
  current: number
  dueDate: string
}

export interface Holding {
  ticker: string
  name: string
  value: number
  returnPct: number
}

export interface WishItem {
  id: string
  title: string
  price: number
  /** 0~1, 목표 저축 진행률 */
  savedPct: number
  emoji: string
}

export interface Mission {
  id: string
  title: string
  detail: string
  reward: string
  done: boolean
  /** 탭 이동 대상 (예: "/insights#quiz") */
  linkTo?: string
}

export interface WeekStreak {
  /** 일~토, null = 미래 */
  days: (boolean | null)[]
  /** 현재 연속 일수 */
  flame: number
}

export interface QuizQuestion {
  id: string
  question: string
  answer: boolean
  explanation: string
}

export interface SimLens {
  goalDelayDays: number
  freeBudgetPct: number
  safety: 'safe' | 'warn' | 'danger'
}

export interface SimScenario {
  id: string
  label: string
  /** 선택 대상 (예: "12만원 운동화") */
  subject: string
  price: number
  /** 주 단위 자산 곡선 (기준선) */
  baseCurve: number[]
  /** 구매 시 곡선 — baseCurve와 같은 길이, 분기 지점부터 낮아짐 */
  altCurve: number[]
  branchIndex: number
  lens: SimLens
}

export interface ProfileSummary {
  id: string
  nickname: string
  emoji: string
  bio: string
  badges: string[]
  /** 메이트 전용: 소비·소득 유사도 (0~1) */
  similarity?: number
}

export type FeedItem =
  | { id: string; kind: 'wrapped'; author: ProfileSummary; period: Period; headline: string; artKey: string }
  | { id: string; kind: 'highlight'; author: ProfileSummary; text: string; stat: string }
  | { id: string; kind: 'diary'; author: ProfileSummary; date: string; caption: string; artKey: string }
  | { id: string; kind: 'fomo'; text: string; stat: string; cta: string }

export interface DiaryEntry {
  date: string
  caption: string
  mood: 'good' | 'soso' | 'bad'
  artKey: string
}

/** 아트 파일명과 1:1 대응하는 키 — art-manifest의 단일 키 체계 */
export type WrappedArtKey = `${Metric}-${Period}`

export interface WrappedContent {
  metric: Metric
  period: Period
  title: string
  headline: string
  subline: string
  artKey: WrappedArtKey
}
