import type { Metric, Period, WrappedContent } from './types'

/**
 * Wrapped 카드 카피 — 지표 × 기간 9종. "AI 품질"은 곧 카피 품질이라 전량 수기.
 * 수치는 셀렉터 실측값과 일치해야 한다 (검증 스크립트로 확인 후 수정).
 */
export const WRAPPED: Record<Metric, Record<Period, WrappedContent>> = {
  budget: {
    daily: {
      metric: 'budget',
      period: 'daily',
      title: '오늘의 소비',
      headline: '커피 한 잔, 도시락 하나.\n예산 31%를 남긴 하루',
      subline: '지출 3건 13,900원 · 6,100원 남음',
      artKey: 'budget-daily',
    },
    weekly: {
      metric: 'budget',
      period: 'weekly',
      title: '7월 3주차의 소비',
      headline: '고민하던 12만원 운동화,\n결국 데려온 한 주',
      subline: '지출 12건 · 운동화 12만원 · 예산 24% 남음',
      artKey: 'budget-weekly',
    },
    monthly: {
      metric: 'budget',
      period: 'monthly',
      title: '7월의 소비',
      headline: '맥북을 들이고도\n예산 30%를 지킨 달',
      subline: '지출 28건 45.4만원 · 예산 30% 남음',
      artKey: 'budget-monthly',
    },
  },
  saving: {
    daily: {
      metric: 'saving',
      period: 'daily',
      title: '오늘의 저축',
      headline: '파리 한 달 살기에\n5,000원 더 가까워진 밤',
      subline: '오늘 +5,000원 · 목표 45%',
      artKey: 'saving-daily',
    },
    weekly: {
      metric: 'saving',
      period: 'weekly',
      title: '7월 3주차의 저축',
      headline: '세 번 참고, 세 번 옮겼다.\n리듬을 지킨 한 주',
      subline: '이번 주 3회 +36,200원 · 목표 45%',
      artKey: 'saving-weekly',
    },
    monthly: {
      metric: 'saving',
      period: 'monthly',
      title: '7월의 저축',
      headline: '여행 통장이 절반을\n넘보기 시작한 달',
      subline: '이번 달 +6.7만원 · 225만 / 500만',
      artKey: 'saving-monthly',
    },
  },
  invest: {
    daily: {
      metric: 'invest',
      period: 'daily',
      title: '오늘의 투자',
      headline: '잔고는 조용히,\n+2.3%씩 자라는 중',
      subline: '총 평가 131만원 · 최근 +2.3%',
      artKey: 'invest-daily',
    },
    weekly: {
      metric: 'invest',
      period: 'weekly',
      title: '7월 3주차의 투자',
      headline: '첫 미국 ETF에\n발을 딛은 한 주',
      subline: 'TIGER 미국S&P500 · 주간 +1.9%',
      artKey: 'invest-weekly',
    },
    monthly: {
      metric: 'invest',
      period: 'monthly',
      title: '7월의 투자',
      headline: '수익률 +12.7%,\n나스닥이 끌고 간 달',
      subline: '나스닥100 +17.8% · 총 평가 131만원',
      artKey: 'invest-monthly',
    },
  },
}
