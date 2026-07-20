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
  /** 맥북 반영 투영 — 비교 중이었다면 targetId를 이어받아 메이트 선을 유지한다.
   *  habit이 켜지면 내 선이 메이트의 저축 습관(기울기)을 따라간다 */
  | { kind: 'sim-macbook'; targetId?: string; habit?: boolean }
  | { kind: 'sim-saving'; monthly: number }
  | { kind: 'sim-etf'; monthly: number }

export type InsightWidget =
  | { type: 'summary' }
  | { type: 'slider' }
  | { type: 'quiz'; quizId: string }
  | { type: 'mission'; missionId: string }
  | { type: 'chips'; chips: string[] }
  /** 추천옵션 — 탭하면 그 문장이 즉시 답변으로 전송되는 1회용 버튼 */
  | { type: 'options'; options: string[] }
  /** 메이트/그룹 선택지 — 탭하면 비교 바텀시트가 열린다 */
  | { type: 'compare-picker' }
  /** 습관 미션 제안 — '미션 수락' 버튼이 다음 단계(예상 리포트)로 잇는다 */
  | { type: 'mission-accept' }
  /** 시나리오 3버튼 — 그대로/맥북 반영/습관 적용 그래프를 자유 전환 (전송 아님) */
  | { type: 'scenario-switch' }
  /** 리포트 생성 버튼 → 리포트 오버레이 (macbook = 맥북 반영 예상 리포트) */
  | { type: 'report'; variant?: 'macbook' }
  /** 상세 정보 카드 — 카드/혜택 추천 응답 */
  | { type: 'detail-card'; variant: 'card' | 'benefit' }

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
 * 현재 플레이스홀더 근거: 이번 달 실측 현금 흐름(저축 39.39만 + 투자 적립 8만)에
 * 생활비·시장 변동을 섞은 월별 투영. 시작점은 현재 총자산 1,400만.
 */
/** 월별 흐름의 출렁임 패턴 — 소폭 하락 뒤 회복하는 굴곡. 합이 정확히 5.00이라 6개월 총증가는 monthlyFlow×5로 보존된다 */
const WOBBLE = [1.0, -0.25, 1.35, 1.25, 1.65]

export function getHabitProjection(): HabitProjection {
  const start = MY_ASSETS.reduce((s, a) => s + a.value, 0)
  const monthKey = `${DEMO_TODAY.getFullYear()}-${String(DEMO_TODAY.getMonth() + 1).padStart(2, '0')}`
  const monthlyFlow = TRANSACTIONS.filter(
    (t) => t.date.startsWith(monthKey) && (t.category === 'saving' || t.category === 'invest'),
  ).reduce((s, t) => s + -t.amount, 0)
  const curve = [start]
  for (const w of WOBBLE) curve.push(curve[curve.length - 1] + Math.round(monthlyFlow * w))
  // 반올림 오차 보정 — 끝값은 정확히 start + monthlyFlow×5 (12월 1,637만 고정)
  curve[curve.length - 1] = start + monthlyFlow * 5
  return { curve, monthlyFlow, totalGain: monthlyFlow * 5 }
}

/** 투영 차트 x축 — 7월(지금)부터 6개월 */
export const PROJECTION_MONTHS = ['7월', '8월', '9월', '10월', '11월', '12월']

/** 시연 시나리오의 구매 대상 — 이번 달 일시불 가정 */
export const MACBOOK = { name: '맥북 M5 프로', price: 2_000_000 } as const

/**
 * 습관 적용 시 내 기울기 부스트 — 메이트 습관에 내 기존 흐름이 얹히는 시너지.
 * 파리지앤느 기준 10~11월 사이에 역전이 일어나도록 맞춘 값.
 */
export const HABIT_BOOST = 1.35

/** 습관 시뮬에서 파생되는 미션 제안 — 파리지앤느 월평균 90만 저축 */
export const HABIT_MISSION = {
  emoji: '🥐',
  title: '파리지앤느처럼 월 90만원 저축',
  reason: '습관 시뮬 적용 · 11월 역전 전망',
  reward: 150,
} as const

export interface MacbookSim {
  /** 그대로 갔을 때 투영 */
  base: number[]
  /** 이번 달 맥북 구매 시 투영 — 전 구간 -200만 */
  bought: number[]
  /** 12월 예상 격차 표시용 */
  endBase: number
  endBought: number
}

/** "이번 달에 맥북 M5 프로 살거야" → 투영이 어떻게 꺾이는지 */
export function getMacbookSim(): MacbookSim {
  const { curve } = getHabitProjection()
  const bought = curve.map((v) => v - MACBOOK.price)
  return {
    base: curve,
    bought,
    endBase: curve[curve.length - 1],
    endBought: bought[bought.length - 1],
  }
}

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

/** 시작값 + 월별 증가분으로 곡선 생성 — 증가폭이 달라 자연스러운 꺾임이 생긴다 */
const steps = (start: number, incs: number[]): number[] => {
  const curve = [start]
  for (const inc of incs) curve.push(curve[curve.length - 1] + inc)
  return curve
}

/** 그래프 우상단 '비교' 버튼의 선택지 — 메이트 3 + 그룹 4 (피드 데이터와 동일 인물·그룹) */
export const COMPARE_TARGETS: CompareTarget[] = [
  {
    id: 'mate-paris',
    kind: 'mate',
    emoji: '🥐',
    label: '파리지앤느',
    sub: '저축 상위 9% · 유사도 86%',
    summary: '기울기가 무섭다 — 저축 상위 9%의 속도',
    // 나(월 ~47만)보다 확연히 가파른 월 70만~110만 — 낮게 출발해 크게 추월
    curve: steps(13_000_000, [700_000, 1_050_000, 800_000, 1_100_000, 850_000]),
  },
  {
    id: 'mate-tuna',
    kind: 'mate',
    emoji: '🐟',
    label: '절약왕참치',
    sub: '소비방어 상위 12% · 유사도 91%',
    summary: '월급 200으로 이 기울기 — 소비방어의 힘',
    curve: steps(9_800_000, [300_000, 430_000, 340_000, 460_000, 370_000]),
  },
  {
    id: 'mate-bear',
    kind: 'mate',
    emoji: '🐻',
    label: '곰손재테크',
    sub: 'ETF 적립 6개월차 · 유사도 78%',
    summary: '자동이체 마스터, 꾸준함의 곡선',
    curve: steps(12_400_000, [380_000, 470_000, 390_000, 480_000, 380_000]),
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
        ? steps(13_140_000, [330_000, 400_000, 310_000, 410_000, 300_000])
        : g.id === 'g-spend'
          ? steps(12_900_000, [270_000, 350_000, 280_000, 360_000, 240_000])
          : g.id === 'g-region'
            ? steps(11_800_000, [300_000, 380_000, 310_000, 390_000, 270_000])
            : steps(13_500_000, [420_000, 520_000, 430_000, 530_000, 400_000]),
  })),
]

/** 저축 슬라이더 범위 — 월 10만~50만, 기본 30만 */
export const SAVING_SLIDER = { min: 100_000, max: 500_000, step: 50_000, initial: 300_000 } as const

export const ETF_GOAL = {
  title: 'ETF 첫 시도 자금',
  target: 300_000,
  months: 3,
  monthly: 100_000,
  product: '미국 S&P500 ETF',
} as const

export interface EtfProjection {
  curve: number[]
  target: number
  monthly: number
  months: number
}

export function makeEtfProjection(monthly: number = ETF_GOAL.monthly): EtfProjection {
  const months = Math.ceil(ETF_GOAL.target / monthly)
  const curve: number[] = []
  for (let i = 0; i <= months; i++) {
    curve.push(Math.min(ETF_GOAL.target, monthly * i))
  }
  return { curve, target: ETF_GOAL.target, monthly, months }
}

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
  '메이트/그룹 비교',
  '30만원 모아서 ETF 시도 해보고 싶어',
  '나 이번달에 맥북 M5 프로 살거야',
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
      { id: 'ps2', role: 'ai', text: '산다 vs 참는다, 금융렌즈로 훑어봤어요 👟' },
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

/* ---------- ETF 추천 상세 카드 (시연 6-2) ---------- */

export interface DetailCardContent {
  tag: string
  title: string
  sub: string
  rows: { emoji: string; text: string }[]
  cta: string
}

/** 카드/혜택 상세 카드 콘텐츠 — 하나금융 계열, 30만원 목표 스케일에 맞춤 */
export const DETAIL_CARDS: Record<'card' | 'benefit', DetailCardContent> = {
  card: {
    tag: '추천 카드',
    title: '하나카드 영하나 플러스 (체크)',
    sub: '연회비 0원 · 소비를 한 장으로',
    rows: [
      { emoji: '👀', text: '지출이 한눈에 — 소비 관리 시작' },
      { emoji: '🚌', text: '전월실적 20만원 이상 시 대중교통·통신 캐시백' },
      { emoji: '☕️', text: '편의점·커피 5% 할인' },
      { emoji: '📱', text: '하나원큐 앱에서 바로 발급' },
    ],
    cta: '카드 자세히 보기',
  },
  benefit: {
    tag: '추천 혜택',
    title: '하나증권 첫 거래 이벤트',
    sub: '첫 거래 우대로 ETF 수수료 아끼기',
    rows: [
      { emoji: '📊', text: '국내·해외 ETF 수수료 평생 우대' },
      { emoji: '🎁', text: '신규 고객 투자지원금 2만원' },
      { emoji: '📱', text: '하나원큐로 3분 만에 계좌 개설' },
    ],
    cta: '이벤트 자세히 보기',
  },
}
