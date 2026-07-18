import type { Category } from './types'

export const CATEGORY_META: Record<Category, { label: string; emoji: string }> = {
  food: { label: '식비', emoji: '🍚' },
  cafe: { label: '카페', emoji: '☕️' },
  transport: { label: '교통', emoji: '🚌' },
  shopping: { label: '쇼핑', emoji: '🛍️' },
  subscription: { label: '구독', emoji: '📺' },
  entertainment: { label: '여가', emoji: '🎳' },
  saving: { label: '저축', emoji: '🏝️' },
  invest: { label: '투자', emoji: '📈' },
  income: { label: '수입', emoji: '💌' },
}
