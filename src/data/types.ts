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

/** 피드 상단 "그룹 보기" 카드 */
export interface FeedGroup {
  id: string
  emoji: string
  label: string
  /** 기준 수치 설명 (예: "월 소득 ±100만원") */
  desc: string
  members: number
}

export interface StoryStat {
  label: string
  value: string
}

/** 오늘의 스토리 — 다른 유저가 공유한 Wrapped 카드 (익명 닉네임) */
export interface Story {
  id: string
  author: ProfileSummary
  metric: Metric
  period: Period
  headline: string
  subline: string
  /** 작성자 카드의 지표 요약 3종 (수기) */
  stats: StoryStat[]
  artKey: `${Metric}-${Period}`
  likes: number
  groupIds: string[]
  /** 정렬용 고정 데모 시각 (ISO) */
  postedAt: string
}

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
