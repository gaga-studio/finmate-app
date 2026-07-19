import type { InsightMsg } from '../../data/insights'
import { SAVING_SLIDER, SUGGESTION_CHIPS } from '../../data/insights'
import { SIM_SCENARIO } from '../../data/domain'

/** id 없는 메시지 — 훅이 push할 때 id를 부여한다 */
export type Reply = Omit<InsightMsg, 'id'>

/** 첫 진입 시 AI가 자동으로 발화하는 시퀀스 — 총평 + 추천옵션 */
export const INITIAL_REPLIES: Reply[] = [
  { role: 'ai', text: '지혜님, 오늘 하루 이렇게 정리했어요 👋' },
  { role: 'ai', widget: { type: 'summary' } },
  {
    role: 'ai',
    text: '뭐부터 볼까요?',
    widget: {
      type: 'options',
      options: ['만약 12만원 운동화를 산다면?', '저축을 늘리면 파리가 얼마나 빨라져?', '이번 달 리포트 만들어줘'],
    },
  },
]

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
  {
    id: 'sim-shoes',
    match: /운동화|만약|살까/,
    replies: [
      { role: 'ai', text: '산다 vs 참는다, 그래프로 비교해봤어요 👟', chart: { kind: 'sim-shoes' } },
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
    id: 'mate',
    match: /메이트|비교|또래|친구/,
    replies: [
      {
        role: 'ai',
        text: '소득 유사 그룹 평균을 겹쳐봤어요',
        chart: { kind: 'compare', targetId: 'g-income' },
      },
      { role: 'ai', text: '그래프 우상단 비교에서 다른 메이트·그룹도 골라볼 수 있어요 👆' },
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
