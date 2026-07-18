/**
 * 촬영 재현성의 핵심: 앱의 "오늘"은 항상 이 값이다.
 * new Date() 직접 호출은 전면 금지 — 어느 날 촬영해도 화면이 동일해야 한다.
 */
export const DEMO_TODAY = new Date(2026, 6, 18, 21, 0, 0) // 2026-07-18 (토) 21:00 KST

export const USER = {
  nickname: '지혜',
  emoji: '🌊',
  bio: '여행 가고 싶은 사회초년생',
} as const

export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo')
}

export function demoScene(): string | null {
  return new URLSearchParams(window.location.search).get('scene')
}
