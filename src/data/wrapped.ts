import type { InvestView, Metric, Period, SavingView, WrappedContent } from './types'

/** 마이 탭 뷰별 카드의 아트 슬롯 — 신규 슬롯은 팀 이미지 도착 전 그라디언트 폴백 */
export type SavingArtKey = 'saving-monthly' | 'saving-income' | 'saving-asset'
export type InvestArtKey = 'invest-monthly' | 'invest-portfolio' | 'invest-news'

export interface ViewCardContent {
  title: string
  headline: string
  subline: string
  artKey: SavingArtKey | InvestArtKey
}

/** 마이 탭 저축 지표의 뷰별 카드 — 하단 아트카드·오버레이가 뷰를 따라 갈아입는다 */
export const SAVING_CARDS: Record<SavingView, ViewCardContent> = {
  goal: {
    title: '나의 저축 목표',
    headline: '파리 한 달 살기,\n목표까지 절반!',
    subline: '225만 / 500만 · 45% 달성',
    artKey: 'saving-monthly',
  },
  monthly: {
    title: '7월의 소득',
    headline: '월급에 부수입까지,\n이번 달 수입 풍년!',
    subline: '수입 258.7만원 · 저축 35.8만원',
    artKey: 'saving-income',
  },
  asset: {
    title: '나의 자산',
    headline: '청약부터 증권까지,\n차곡차곡 1,400만!',
    subline: '총자산 1,400만원 · 이번 달 +34만원',
    artKey: 'saving-asset',
  },
}

/** 마이 탭 투자 지표의 뷰별 카드 */
export const INVEST_CARDS: Record<InvestView, ViewCardContent> = {
  status: {
    title: '7월의 투자',
    headline: '스타십은 멈칫,\n그래도 내 포트는 +12.7%!',
    subline: '원금 118만원 → 평가 133만원 (+12.7%)',
    artKey: 'invest-monthly',
  },
  portfolio: {
    title: '나의 포트폴리오',
    headline: 'S&P500이 30%,\nETF 중심 분산 투자!',
    subline: '5종목 · 평가 133만원',
    artKey: 'invest-portfolio',
  },
  news: {
    title: '오늘의 시장',
    headline: '중동발 급락장,\n오늘은 파란불 주의보!',
    subline: '코스피 -9.95% · 환율 1,487원',
    artKey: 'invest-news',
  },
}

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
      headline: '커피 한 잔, 도시락 하나.\n오늘도 예산 방어 성공!',
      subline: '지출 3건 13,900원 · 6,100원 남음',
      artKey: 'budget-daily',
    },
    weekly: {
      metric: 'budget',
      period: 'weekly',
      title: '7월 3주차의 소비',
      headline: '고민하던 12만원 운동화,\n이번 주 드디어 겟!',
      subline: '지출 11건 · 운동화 12만원 · 예산 23% 남음',
      artKey: 'budget-weekly',
    },
    monthly: {
      metric: 'budget',
      period: 'monthly',
      title: '7월의 소비',
      headline: '맥북 들이고도\n예산 30% 사수!',
      subline: '지출 26건 45.3만원 · 예산 30% 남음',
      artKey: 'budget-monthly',
    },
  },
  saving: {
    daily: {
      metric: 'saving',
      period: 'daily',
      title: '오늘의 저축',
      headline: '파리 한 달 살기,\n오늘도 +5,000원!',
      subline: '오늘 +5,000원 · 목표 45%',
      artKey: 'saving-daily',
    },
    weekly: {
      metric: 'saving',
      period: 'weekly',
      title: '7월 3주차의 저축',
      headline: '참을 때마다 저축,\n이번 주도 리듬 유지!',
      subline: '이번 주 +26,300원 · 목표 45%',
      artKey: 'saving-weekly',
    },
    monthly: {
      metric: 'saving',
      period: 'monthly',
      title: '7월의 저축',
      headline: '여행 통장 절반 돌파,\n파리가 코앞!',
      subline: '이번 달 +35.8만원 · 225만 / 500만',
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
      headline: '첫 미국 ETF,\n투자 데뷔 완료!',
      subline: 'TIGER 미국S&P500 · 주간 +1.9%',
      artKey: 'invest-weekly',
    },
    monthly: {
      metric: 'invest',
      period: 'monthly',
      title: '7월의 투자',
      headline: '수익률 +12.7%,\n나스닥 덕 톡톡!',
      subline: '나스닥100 +17.8% · 총 평가 131만원',
      artKey: 'invest-monthly',
    },
  },
}
