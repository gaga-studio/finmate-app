import type { Transition } from 'motion/react'

/**
 * 앱 전체 모션 톤은 이 3개 프리셋으로만 만든다.
 * 컴포넌트마다 개별 튜닝을 금지해 "애플 감성"의 일관성을 지킨다.
 */
export const snappy: Transition = { type: 'spring', stiffness: 400, damping: 35 }
export const gentle: Transition = { type: 'spring', stiffness: 120, damping: 20 }
export const dramatic: Transition = { type: 'spring', stiffness: 200, damping: 26 }
