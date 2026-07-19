import { DEMO_TODAY } from './demo'
import { SAVING_GOAL } from './domain'

/** 인사이트 탭 — 스크립트 챗의 데이터·타입. 응답 진행 로직은 features/insights/script.ts. */

/** 상단 차트 패널의 상태 — 채팅에 따라 전환된다 */
export type InsightChartState =
  | { kind: 'default' }
  | { kind: 'sim-shoes' }
  | { kind: 'sim-saving'; monthly: number }
  | { kind: 'mate' }

export type InsightWidget =
  | { type: 'summary' }
  | { type: 'slider' }
  | { type: 'quiz'; quizId: string }
  | { type: 'mission'; missionId: string }
  | { type: 'chips'; chips: string[] }

export interface InsightMsg {
  id: string
  role: 'user' | 'ai'
  text?: string
  widget?: InsightWidget
  /** 이 버블이 등장하는 순간 차트를 이 상태로 전환 */
  chart?: InsightChartState
}

export interface SavedSession {
  id: string
  title: string
  savedAt: string
  messages: InsightMsg[]
}

/**
 * 소비 유사 메이트 평균 총자산(2~7월) — 나(NET_WORTH_HISTORY, 끝 1,400만)보다
 * 완만하게 올라 끝값 1,314만. 격차 +86만이 메이트 비교의 핵심 카피.
 */
export const MATE_NET_WORTH_HISTORY: number[] = [
  12_480_000, 12_690_000, 12_850_000, 12_970_000, 13_060_000, 13_140_000,
]

/** 저축 슬라이더 범위 — 월 10만~50만, 기본 30만 */
export const SAVING_SLIDER = { min: 100_000, max: 500_000, step: 50_000, initial: 300_000 } as const

export interface SavingProjection {
  /** 지금(225만)부터 월 저축액씩 쌓여 500만에 닿는 곡선 — 길이 = months + 1 */
  curve: number[]
  /** 목표 도달까지 걸리는 개월 수 */
  months: number
  /** "내년 5월" 같은 도달 시점 라벨 */
  arrivalLabel: string
}

/** 월 저축액 → 파리 목표(500만) 도달 투영. 차트·카피가 같은 수치를 쓴다. */
export function makeSavingProjection(monthly: number): SavingProjection {
  const remaining = SAVING_GOAL.target - SAVING_GOAL.current
  const months = Math.ceil(remaining / monthly)
  const curve: number[] = []
  for (let i = 0; i <= months; i++) {
    curve.push(Math.min(SAVING_GOAL.target, SAVING_GOAL.current + monthly * i))
  }
  const total = DEMO_TODAY.getMonth() + 1 + months
  const year = DEMO_TODAY.getFullYear() + Math.floor((total - 1) / 12)
  const month = ((total - 1) % 12) + 1
  const yearWord =
    year === DEMO_TODAY.getFullYear() ? '올해' : year === DEMO_TODAY.getFullYear() + 1 ? '내년' : `${year}년`
  return { curve, months, arrivalLabel: `${yearWord} ${month}월` }
}

/** 입력바 `+`와 폴백이 제안하는 추천 질문 */
export const SUGGESTION_CHIPS = [
  '만약 12만원 운동화를 산다면?',
  '저축을 늘리면 파리가 얼마나 빨라져?',
  '메이트랑 비교해줘',
  '금융 퀴즈 내줘',
] as const

/** 상단 차트 우측 칩이 입력창에 삽입하는 템플릿 (와이어프레임 ③) */
export const MATE_COMPARE_TEMPLATE = '메이트랑 비교해줘'

/** 햄버거 메뉴의 프리시드 저장 대화 — 운동화 고민(7/21) */
export const PRESET_SESSIONS: SavedSession[] = [
  {
    id: 'ps-shoes',
    title: '만약 12만원 운동화를 산다면?',
    savedAt: '7월 21일',
    messages: [
      { id: 'ps1', role: 'user', text: '만약 12만원 운동화를 산다면?' },
      {
        id: 'ps2',
        role: 'ai',
        text: '산다 vs 참는다, 그래프로 비교해봤어요',
        chart: { kind: 'sim-shoes' },
      },
      { id: 'ps3', role: 'ai', text: '사면 파리 출발 11일 지연 · 이번 주 자유예산 46% 사용 🎯' },
      { id: 'ps4', role: 'user', text: '그래도 살래!' },
      {
        id: 'ps5',
        role: 'ai',
        text: '오케이, 대신 이번 주 카페 2회 이하 미션 어때요? ☕️',
        widget: { type: 'mission', missionId: 'r-cafe' },
      },
    ],
  },
]
