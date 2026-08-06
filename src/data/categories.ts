import type { Category } from './types'

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  food: { label: '식비', emoji: '🍚' },
  cafe: { label: '카페', emoji: '☕️' },
  transport: { label: '교통', emoji: '🚌' },
  shopping: { label: '쇼핑', emoji: '🛍️' },
  subscription: { label: '구독', emoji: '📺' },
  entertainment: { label: '여가', emoji: '🎳' },
  living: { label: '생활', emoji: '🧺' },
  housing: { label: '주거', emoji: '🏠' },
  education: { label: '교육', emoji: '📚' },
  beauty: { label: '뷰티', emoji: '💄' },
  health: { label: '의료', emoji: '💊' },
  insurance: { label: '보험', emoji: '🛡️' },
  travel: { label: '여행', emoji: '✈️' },
  saving: { label: '저축', emoji: '🏝️' },
  invest: { label: '투자', emoji: '📈' },
  income: { label: '수입', emoji: '💌' },
}
