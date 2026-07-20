export type Period = 'daily' | 'weekly' | 'monthly'
export type Metric = 'budget' | 'saving' | 'invest'
/** 저축 지표 전용 세로축 — 기간이 아니라 뷰를 순환한다 */
export type SavingView = 'goal' | 'monthly' | 'asset'
/** 투자 지표 전용 세로축 */
export type InvestView = 'status' | 'portfolio' | 'news'

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
  emoji: string
}

export interface Mission {
  id: string
  emoji: string
  title: string
  /** 완료 보상 포인트 */
  reward: number
  /** 진행률 파생 소스 — saving/daily-budget은 셀렉터 파생, quiz는 탭 완료형, simple은 추천에서 담은 미션 */
  kind: 'saving' | 'daily-budget' | 'quiz' | 'simple'
}

export interface RecommendedMission {
  id: string
  emoji: string
  title: string
  /** 해체분석 기반 추천 근거 — 행동화 설득의 핵심 */
  reason: string
  reward: number
}

export interface RewardItem {
  id: string
  emoji: string
  title: string
  cost: number
}

/** 월별 수입·지출 원장 (챌린지 월간 판정용, 7월은 실측) */
export interface MonthLedger {
  month: number
  income: number
  spend: number
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

export interface StoryRow {
  label: string
  value: string
  price?: string
  change?: string
  changePct?: string
  direction?: 'up' | 'down'
}

/** 오늘의 스토리 — 다른 유저가 공유한 카드 (익명 닉네임) */
export interface Story {
  id: string
  author: ProfileSummary
  metric: Metric
  period: Period
  headline: string
  subline: string
  /** 카드 하단 탑3 */
  top3: StoryRow[]
  /** 탑3 블록 제목 — 없으면 지표 기본값(소비 탑 3/위시 리스트/투자 종목) */
  top3Title?: string
  /** ART.stories 키 */
  artKey: string
  likes: number
  groupIds: string[]
  /** 정렬용 고정 데모 시각 (ISO) */
  postedAt: string
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
