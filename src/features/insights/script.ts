import type { InsightMsg } from '../../data/insights'
import { ETF_ACTIONS, SAVING_SLIDER, SUGGESTION_CHIPS } from '../../data/insights'
import { SIM_SCENARIO } from '../../data/domain'

/** id 없는 메시지 — 훅이 push할 때 id를 부여한다 */
export type Reply = Omit<InsightMsg, 'id'>

/** 첫 진입 시 AI가 자동으로 발화하는 시퀀스 — 총평 + 추천옵션 */
export const INITIAL_REPLIES: Reply[] = [
  { role: 'ai', text: '지혜님, 지금까지의 하루요약입니다 👋' },
  { role: 'ai', widget: { type: 'summary' } },
  {
    role: 'ai',
    widget: {
      type: 'options',
      options: ['메이트/그룹 비교'],
    },
  },
]

/** 비교 시트에서 대상을 고르면 발화하는 완성 멘트 — useInsightChat.completeCompare가 사용 */
export function compareDoneReplies(targetId: string): Reply[] {
  return [
    { role: 'ai', text: '시뮬레이션이 생성되었어요! ✨', chart: { kind: 'compare', targetId } },
    { role: 'ai', widget: { type: 'options', options: ['이어서하기'] } },
  ]
}

interface Scenario {
  id: string
  match: RegExp
  replies: Reply[]
}

/**
 * 키워드 매칭 스크립트 — 위에서부터 첫 매칭을 사용한다.
 * 응답 버블에 chart를 실으면 그 버블이 등장할 때 상단 그래프가 전환된다.
 */
const SCENARIOS: Scenario[] = [
  // 산다/참는다 즉답은 sim-shoes보다 먼저 매칭되어야 한다
  {
    id: 'buy',
    match: /^산다!?$/,
    replies: [
      { role: 'ai', text: '오케이, 사는 대신 여기서 아껴봐요 ☕️' },
      { role: 'ai', widget: { type: 'mission', missionId: 'r-cafe' } },
    ],
  },
  {
    id: 'pass',
    match: /^참는다!?$/,
    replies: [
      { role: 'ai', text: '그 참을성이 파리를 앞당겨요 ✈️' },
      {
        role: 'ai',
        text: '아낀 12만원, 저축으로 돌리면?',
        widget: { type: 'chips', chips: ['저축을 늘리면 파리가 얼마나 빨라져?'] },
      },
    ],
  },
  // 비교 완성 뒤 이어서하기 → 소비/저축 계획 질문
  {
    id: 'continue',
    match: /^이어서하기$/,
    replies: [
      { role: 'ai', text: '추가 소비/저축 계획이 있으신가요?\n예: 30만원 모아서 ETF 시도 해보고 싶어' },
    ],
  },
  // 시연 6-2 추천 행동 — 카드/혜택은 상세 카드, 절약 미션이 시뮬로 잇는다
  {
    id: 'etf-action-card',
    match: /^카드 추천$/,
    replies: [
      { role: 'ai', text: '하나카드의 사회초년생 지출 관리 카드예요!' },
      { role: 'ai', widget: { type: 'detail-card', variant: 'card' } },
    ],
  },
  {
    id: 'etf-action-benefit',
    match: /^혜택 추천$/,
    replies: [
      { role: 'ai', text: 'ETF 시작 전 챙기면 좋은 하나증권 혜택이에요!' },
      { role: 'ai', widget: { type: 'detail-card', variant: 'benefit' } },
    ],
  },
  {
    id: 'etf-action-saving',
    match: /^절약 미션$/,
    replies: [
      {
        role: 'ai',
        text: '좋아요! 30만원 모으기,\n바로 실행 미션으로 만들어봤어요.',
        widget: { type: 'mission', missionId: 'r-etf' },
      },
    ],
  },
  // 시연 6-1: ETF 의사 표현 → 위험 안내 → 30만원 플랜 시뮬 → 실행 방법 3가지
  {
    id: 'etf-goal',
    match: /ETF|etf|30만원|삼십만원|첫\s*시도|첫\s*투자/i,
    replies: [
      { role: 'ai', text: '지금 자금 없이 바로 시작하는 건\n위험해 보여요 ⚠️' },
      {
        role: 'ai',
        text: '먼저 30만원부터 모아볼까요?\n월 10만원씩 3개월이면\nETF 첫 시도 자금이 생겨요 🎉',
        chart: { kind: 'sim-etf', monthly: 100_000 },
      },
      {
        role: 'ai',
        text: '이 플랜, 실행할 가장 쉬운 방법\n3가지를 준비했어요!',
        widget: { type: 'action-list', items: [...ETF_ACTIONS] },
      },
    ],
  },
  // 시연 핵심: 맥북 200만 — 그래프가 실시간으로 꺾이고 습관 시뮬 → 예상 리포트로 이어진다
  {
    id: 'macbook',
    match: /맥북|m5|노트북/i,
    replies: [
      {
        role: 'ai',
        text: '맥북 M5 프로 200만원, 지금 그래프에 바로 반영해봤어요 💻',
        chart: { kind: 'sim-macbook' },
      },
      { role: 'ai', text: '12월 예상 1,637만원 → 1,437만원 · 그래도 우상향은 지켜져요' },
      {
        role: 'ai',
        text: '만약 메이트의 저축 습관을 따라해본다면\n어떻게 될지 보여줄 수 있어요',
        widget: { type: 'options', options: ['시뮬레이션 적용해보기'] },
      },
    ],
  },
  // 습관 따라하기 — 내 선이 메이트 기울기를 따라가고, 습관 미션 제안으로 잇는다
  {
    id: 'apply-habit',
    match: /^시뮬레이션 적용해보기$/,
    replies: [
      {
        role: 'ai',
        text: '메이트의 저축 습관을 그래프에 얹어봤어요 ✨',
        chart: { kind: 'sim-macbook', habit: true },
      },
      {
        role: 'ai',
        text: '세 가지 시뮬레이션, 버튼으로 언제든 다시 볼 수 있어요',
        widget: { type: 'scenario-switch' },
      },
      {
        role: 'ai',
        text: '이 습관, 그대로 미션으로 만들어봤어요',
        widget: { type: 'mission-accept' },
      },
    ],
  },
  // 미션 수락 → 예상 리포트 제공
  {
    id: 'accept-mission',
    match: /^미션 수락!?$/,
    replies: [
      { role: 'ai', text: '미션 등록 완료! 매달 자동으로 체크해드릴게요 ✅' },
      { role: 'ai', text: '미션까지 반영한 7월 예상 리포트가 도착했어요!' },
      { role: 'ai', widget: { type: 'report', variant: 'macbook' } },
    ],
  },
  {
    id: 'sim-shoes',
    match: /운동화|살까/,
    replies: [
      { role: 'ai', text: '산다 vs 참는다, 금융렌즈로 훑어봤어요 👟' },
      {
        role: 'ai',
        text: `사면 파리 출발 ${SIM_SCENARIO.lens.goalDelayDays}일 지연 · 이번 주 자유예산 ${SIM_SCENARIO.lens.freeBudgetPct}% 사용`,
      },
      {
        role: 'ai',
        text: '그래서, 어떻게 할래요?',
        widget: { type: 'options', options: ['산다!', '참는다!'] },
      },
    ],
  },
  {
    id: 'report',
    match: /리포트|정리|결산/,
    replies: [
      { role: 'ai', text: '7월 한 달을 카드 한 장으로 정리했어요 📋' },
      { role: 'ai', widget: { type: 'report' } },
    ],
  },
  {
    id: 'sim-saving',
    match: /저축|늘리|빨라|모으/,
    replies: [
      {
        role: 'ai',
        text: '월 저축액을 움직여보세요, 파리가 성큼 다가와요 ✈️',
        chart: { kind: 'sim-saving', monthly: SAVING_SLIDER.initial },
        widget: { type: 'slider' },
      },
    ],
  },
  {
    id: 'compare',
    match: /메이트|그룹|비교|또래|친구/,
    replies: [
      { role: 'ai', text: '어떤 메이트/그룹과 비교하시겠어요? 👇' },
      { role: 'ai', widget: { type: 'compare-picker' } },
    ],
  },
  {
    id: 'quiz',
    match: /퀴즈|문제/,
    replies: [
      { role: 'ai', text: '오늘의 OX 퀴즈! 맞히면 +60P 🧠' },
      { role: 'ai', widget: { type: 'quiz', quizId: 'q1' } },
    ],
  },
  {
    id: 'mission',
    match: /미션|추천|뭐하/,
    replies: [
      { role: 'ai', text: '이번 달 카페 8회 · 34,400원 — 여기가 기회예요' },
      { role: 'ai', widget: { type: 'mission', missionId: 'r-cafe' } },
    ],
  },
]

const FALLBACK: Reply[] = [
  {
    role: 'ai',
    text: '아직 배우는 중이라 그건 잘 몰라요 🙏\n이런 걸 물어볼 수 있어요',
    widget: { type: 'chips', chips: [...SUGGESTION_CHIPS.slice(0, 3)] },
  },
]

export function findReplies(text: string): Reply[] {
  return SCENARIOS.find((s) => s.match.test(text))?.replies ?? FALLBACK
}
