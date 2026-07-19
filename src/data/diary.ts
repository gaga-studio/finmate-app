import type { Metric } from './types'

/**
 * 다이어리 — 하루가 끝나면 자동 업로드되는 기록.
 * 대표 이미지는 그날 가장 컸던 활동(getDayDominant)에 따라 결정된다.
 * 다른 날짜 이미지는 추후 제공 예정 — 이 매핑만 채우면 반영된다.
 */
export const DOMINANT_ART: Record<Metric, string> = {
  budget: '/art/wrapped/budget-daily.png',
  saving: '/art/wrapped/saving-daily.png',
  invest: '/art/wrapped/invest-monthly.png',
}

export const DOMINANT_HEADLINE: Record<Metric, string> = {
  budget: '커피 한 잔, 도시락 하나.\n오늘도 예산 방어 성공!',
  saving: '오늘의 주인공은 저축,\n파리에 한 걸음 더!',
  invest: '오늘의 주인공은 투자,\n포트가 한 뼘 성장!',
}

export const DIARY_TODAY = {
  day: 23,
  dateKey: '2026-07-23',
} as const
