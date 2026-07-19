import type { Metric, WrappedArtKey } from './types'
import type { InvestArtKey, SavingArtKey } from './wrapped'

/**
 * AI 아트 에셋의 단일 매핑.
 * 팀이 생성한 이미지가 도착하면 이 파일의 경로만 채우면 전체 반영된다.
 * 파일이 없으면 ArtOrGradient가 폴백 그라디언트로 렌더한다.
 */
export const ART = {
  wrapped: {
    'budget-daily': '/art/wrapped/budget-daily.png',
    'budget-weekly': '/art/wrapped/budget-weekly.png',
    'budget-monthly': '/art/wrapped/budget-monthly.png',
    'saving-daily': '/art/wrapped/saving-daily.png',
    'saving-weekly': '/art/wrapped/saving-weekly.png',
    'saving-monthly': '/art/wrapped/saving-monthly.png',
    'invest-daily': '/art/wrapped/invest-daily.png',
    'invest-weekly': '/art/wrapped/invest-weekly.png',
    'invest-monthly': '/art/wrapped/invest-monthly.png',
    // 저축·투자 뷰별 카드 전용 슬롯
    'saving-income': '/art/wrapped/saving-income.png',
    'saving-asset': '/art/wrapped/saving-asset.png',
    'invest-portfolio': '/art/wrapped/invest-portfolio.png',
    'invest-news': '/art/wrapped/invest-news.png',
  } satisfies Record<WrappedArtKey | SavingArtKey | InvestArtKey, string>,
  diary: {
    '2026-07-14': '/art/diary/2026-07-14.png',
    '2026-07-16': '/art/diary/2026-07-16.png',
    '2026-07-18': '/art/diary/2026-07-18.png',
  } as Record<string, string>,
}

/** 에셋 미도착 시 지표 팔레트 그라디언트 폴백 */
export const FALLBACK_GRADIENT: Record<Metric | 'diary', [string, string]> = {
  budget: ['oklch(0.82 0.09 230)', 'oklch(0.55 0.16 262)'],
  saving: ['oklch(0.85 0.1 168)', 'oklch(0.58 0.14 190)'],
  invest: ['oklch(0.78 0.12 295)', 'oklch(0.5 0.19 310)'],
  diary: ['oklch(0.88 0.06 80)', 'oklch(0.68 0.12 40)'],
}
