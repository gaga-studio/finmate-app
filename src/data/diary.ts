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

/**
 * 과거 날짜(1~22일)의 그림일기 — 각 날의 실제 거래·대표 활동에 맞춘 7가지 그림체.
 * 팝아트(6·7·21) · 민트 포스터(2·5·9·16) · 리소그래프(4·8·14) · 종이 콜라주(1·13·17)
 * · 자수(3·12·19) · 클레이 3D(11·15·18·22) · 로우폴리 3D(10·20)
 */
export const DIARY_ART: Record<number, string> = Object.fromEntries(
  Array.from({ length: 22 }, (_, i) => [i + 1, `/art/diary/diary-${String(i + 1).padStart(2, '0')}.jpg`]),
)
