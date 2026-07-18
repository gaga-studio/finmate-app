import type { Period, WrappedContent } from './types'

/** Wrapped 카드 카피 — "AI 품질"은 곧 카피 품질이라 전량 수기. */
export const WRAPPED: Record<Period, WrappedContent> = {
  daily: {
    period: 'daily',
    title: '오늘의 나',
    headline: '커피 한 잔을 남기고,\n제주에 5,000원 가까워진 날',
    subline: '지출 3건 · 저축 1건 · 예산 30% 남음',
    artKey: 'daily',
  },
  weekly: {
    period: 'weekly',
    title: '7월 3주차의 나',
    headline: '고민하던 운동화를 샀지만,\n저축 리듬은 지킨 한 주',
    subline: '지출 18건 · 저축 3회 · 미션 5/7 완료',
    artKey: 'weekly',
  },
  monthly: {
    period: 'monthly',
    title: '7월의 나',
    headline: '첫 미국 ETF에 발을 딛고,\n여행 통장이 절반을 넘보는 달',
    subline: '저축 +18만원 · 투자 첫 5만원 · 수익률 +11%',
    artKey: 'monthly',
  },
}
