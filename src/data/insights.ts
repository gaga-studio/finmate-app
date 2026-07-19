import { DEMO_TODAY } from './demo'
import { SAVING_GOAL } from './domain'
import { FEED_GROUPS } from './social'
import { TRANSACTIONS } from './transactions'
import { MY_ASSETS } from './domain'

/** 인사이트 탭 — 스크립트 챗의 데이터·타입. 응답 진행 로직은 features/insights/script.ts. */

/** 상단 차트 패널의 상태 — 채팅·비교 버튼에 따라 전환된다 */
export type InsightChartState =
  | { kind: 'projection' }
  | { kind: 'compare'; targetId: string }
  | { kind: 'sim-shoes' }
  | { kind: 'sim-saving'; monthly: number }

export type InsightWidget =
  | { type: 'summary' }
  | { type: 'slider' }
  | { type: 'quiz'; quizId: string }
  | { type: 'mission'; missionId: string }
  | { type: 'chips'; chips: string[] }
  /** 추천옵션 — 탭하면 그 문장이 즉시 답변으로 전송되는 1회용 버튼 */
  | { type: 'options'; options: string[] }
  /** 리포트 생성 버튼 → 리포트 오버레이 */
  | { type: 'report' }

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

/* ---------- 습관 기반 미래 투영 ---------- */

export interface HabitProjection {
  /** 7월(현재)~12월 총자산 투영 — 길이 6 */
  curve: number[]
  /** 월 순증(투영 기울기) */
  monthlyFlow: number
  /** 6개월 뒤 증가분 */
  totalGain: number
}

/**
 * 평소 금융 습관 → 미래 6개월 총자산 투영.
 *
 * ⚠️ 공식 교체 지점: 상세 공식·근거는 추후 제공 예정 — 그때 이 함수 내부만 바꾸면
 * 차트·리포트·카피가 전부 따라온다.
 *
 * 현재 플레이스홀더 근거: 이번 달 실측 현금 흐름(저축 39.39만 + 투자 적립 8만
 * = 월 +47.39만)이 유지된다고 가정한 선형 투영. 시작점은 현재 총자산 1,400만.
 */
export function getHabitProjection(): HabitProjection {
  const start = MY_ASSETS.reduce((s, a) => s + a.value, 0)
  const monthKey = `${DEMO_TODAY.getFullYear()}-${String(DEMO_TODAY.getMonth() + 1).padStart(2, '0')}`
  const monthlyFlow = TRANSACTIONS.filter(
    (t) => t.date.startsWith(monthKey) && (t.category === 'saving' || t.category === 'invest'),
  ).reduce((s, t) => s + -t.amount, 0)
  const curve = Array.from({ length: 6 }, (_, i) => start + monthlyFlow * i)
  return { curve, monthlyFlow, totalGain: monthlyFlow * 5 }
}

/** 투영 차트 x축 — 7월(지금)부터 6개월 */
export const PROJECTION_MONTHS = ['7월', '8월', '9월', '10월', '11월', '12월']

/* ---------- 메이트/그룹 선(線) 비교 ---------- */

export interface CompareTarget {
  id: string
  kind: 'mate' | 'group'
  emoji: string
  label: string
  /** 목록 보조 설명 (유사도·멤버 수 등) */
  sub: string
  /** 비교 상태 캡션 한 줄 */
  summary: string
  /** 같은 7~12월 투영 — 길이 6 */
  curve: number[]
}

const flat = (start: number, step: number): number[] =>
  Array.from({ length: 6 }, (_, i) => start + step * i)

/** 그래프 우상단 '비교' 버튼의 선택지 — 메이트 3 + 그룹 4 (피드 데이터와 동일 인물·그룹) */
export const COMPARE_TARGETS: CompareTarget[] = [
  {
    id: 'mate-paris',
    kind: 'mate',
    emoji: '🥐',
    label: '파리지앤느',
    sub: '저축 상위 9% · 유사도 86%',
    summary: '기울기가 무섭다 — 저축 상위 9%의 속도',
    curve: flat(13_200_000, 600_000),
  },
  {
    id: 'mate-tuna',
    kind: 'mate',
    emoji: '🐟',
    label: '절약왕참치',
    sub: '소비방어 상위 12% · 유사도 91%',
    summary: '월급 200으로 이 기울기 — 소비방어의 힘',
    curve: flat(9_800_000, 380_000),
  },
  {
    id: 'mate-bear',
    kind: 'mate',
    emoji: '🐻',
    label: '곰손재테크',
    sub: 'ETF 적립 6개월차 · 유사도 78%',
    summary: '자동이체 마스터, 꾸준함의 곡선',
    curve: flat(12_400_000, 420_000),
  },
  ...FEED_GROUPS.map((g) => ({
    id: g.id,
    kind: 'group' as const,
    emoji: g.emoji,
    label: `${g.label} 평균`,
    sub: `${g.desc} · ${g.members.toLocaleString('ko-KR')}명`,
    summary:
      g.id === 'g-follow'
        ? '팔로잉 평균과 접전 — 좋은 자극!'
        : `${g.label} 평균보다 내 기울기가 가팔라요`,
    curve:
      g.id === 'g-income'
        ? flat(13_140_000, 350_000)
        : g.id === 'g-spend'
          ? flat(12_900_000, 300_000)
          : g.id === 'g-region'
            ? flat(11_800_000, 330_000)
            : flat(13_500_000, 460_000),
  })),
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
  '이번 달 리포트 만들어줘',
  '금융 퀴즈 내줘',
] as const

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
