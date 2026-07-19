import type { Metric, Period, SavingView, WrappedContent } from './types'

/** 마이 탭 저축 뷰별 카드의 아트 슬롯 — income/asset은 팀 이미지 도착 전 그라디언트 폴백 */
export type SavingArtKey = 'saving-monthly' | 'saving-income' | 'saving-asset'

export interface SavingCardContent {
  title: string
  headline: string
  subline: string
  artKey: SavingArtKey
}

/** 마이 탭 저축 지표의 뷰별 카드 — 하단 아트카드·오버레이가 뷰를 따라 갈아입는다 */
export const SAVING_CARDS: Record<SavingView, SavingCardContent> = {
  goal: {
    title: '나의 저축 목표',
    headline: '파리 한 달 살기,\n절반을 넘었다',
    subline: '225만 / 500만 · 45% 달성',
    artKey: 'saving-monthly',
  },
  monthly: {
    title: '7월의 소득',
    headline: '월급이 이끌고,\n부수입이 밀어준 달',
    subline: '수입 258.7만원 · 저축 35.8만원',
    artKey: 'saving-income',
  },
  asset: {
    title: '나의 자산',
    headline: '전세 보증금부터\n파리 통장까지, 1.4억',
    subline: '총자산 1억 4,256만원 · 이번 달 +38만원',
    artKey: 'saving-asset',
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
      headline: '커피 한 잔, 도시락 하나.\n예산 31%를 남긴 하루',
      subline: '지출 3건 13,900원 · 6,100원 남음',
      artKey: 'budget-daily',
    },
    weekly: {
      metric: 'budget',
      period: 'weekly',
      title: '7월 3주차의 소비',
      headline: '고민하던 12만원 운동화,\n결국 데려온 한 주',
      subline: '지출 11건 · 운동화 12만원 · 예산 23% 남음',
      artKey: 'budget-weekly',
    },
    monthly: {
      metric: 'budget',
      period: 'monthly',
      title: '7월의 소비',
      headline: '맥북을 들이고도\n예산 30%를 지킨 달',
      subline: '지출 26건 45.3만원 · 예산 30% 남음',
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
