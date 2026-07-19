import { DEMO_TODAY } from './demo'
import { addDays, toKey } from './dates'
import { amountBetween, mulberry32, pick } from './seed'
import type { Category, Transaction } from './types'

const MERCHANTS: Record<Exclude<Category, 'saving' | 'invest' | 'income'>, string[]> = {
  food: ['김밥천국', '맘스터치', '한솥도시락', '배민 주문', '학식', 'GS25', '역전우동'],
  cafe: ['스타벅스', '메가커피', '컴포즈커피', '투썸플레이스', '블루보틀'],
  transport: ['지하철', '버스', '따릉이', '카카오T'],
  shopping: ['쿠팡', '올리브영', '무신사', '다이소', '지그재그'],
  subscription: ['넷플릭스', '유튜브 프리미엄', '스포티파이', '밀리의 서재'],
  entertainment: ['CGV', '노래방', '볼링장', '전시회'],
}

const SPEND_RANGE: Record<keyof typeof MERCHANTS, [number, number]> = {
  food: [4500, 14000],
  cafe: [1800, 6500],
  transport: [1250, 4800],
  shopping: [8000, 30000],
  subscription: [5500, 17000],
  entertainment: [9000, 24000],
}

/** 저렴한 카테고리에 가중치 — 하루 평균 생성 지출 ~1.3만원을 목표로 한다 */
const WEIGHTED_CATEGORIES: (keyof typeof MERCHANTS)[] = [
  'food', 'food', 'food',
  'cafe', 'cafe', 'cafe',
  'transport', 'transport', 'transport',
  'shopping', 'subscription', 'entertainment',
]

/** 시연 대사에 등장하는 거래 — 날짜·금액을 수기로 고정한다. */
const NARRATIVE: Transaction[] = [
  { id: 'n-shoes', date: '2026-07-21', merchant: '나이키 강남', amount: -120000, category: 'shopping', memo: '고민 중이던 운동화' },
  { id: 'n-macbook', date: '2026-07-06', merchant: '맥북 에어 할부', amount: -132500, category: 'shopping', memo: '드디어 질렀다 · 1/12회차' },
  // 오늘 합계 13,900원 고정 — 커피가 오늘의 1위가 되도록 배분
  { id: 'n-coffee-today', date: '2026-07-23', merchant: '스타벅스', amount: -7200, category: 'cafe', memo: '아메리카노 + 치즈케이크' },
  { id: 'n-lunch-today', date: '2026-07-23', merchant: '한솥도시락', amount: -5200, category: 'food' },
  { id: 'n-bus-today', date: '2026-07-23', merchant: '버스', amount: -1500, category: 'transport' },
  { id: 'n-save-today', date: '2026-07-23', merchant: '파리 여행 통장', amount: -5000, category: 'saving', memo: '오늘의 미션 저축' },
  // 7월 저축 다양화 — 월간 뷰의 "수입에서 한 전체 저축"의 근거
  { id: 'n-emergency', date: '2026-07-05', merchant: '비상금 통장', amount: -200000, category: 'saving', memo: '월급날 자동이체' },
  { id: 'n-housing', date: '2026-07-02', merchant: '청약 납입', amount: -100000, category: 'saving', memo: '13회차' },
  // 소득 출처 다양화 — 월간 뷰 오른쪽 카드의 순위 근거
  { id: 'n-salary', date: '2026-07-10', merchant: '월급', amount: 2150000, category: 'income' },
  { id: 'n-allow', date: '2026-07-03', merchant: '알바비', amount: 380000, category: 'income' },
  { id: 'n-carrot', date: '2026-07-12', merchant: '당근마켓 판매', amount: 45000, category: 'income', memo: '안 입는 패딩' },
  { id: 'n-interest', date: '2026-07-15', merchant: '예금 이자', amount: 12400, category: 'income' },
  { id: 'n-etf', date: '2026-07-20', merchant: 'TIGER 미국S&P500 매수', amount: -50000, category: 'invest', memo: '첫 소액 투자' },
]

function generate(): Transaction[] {
  const rng = mulberry32(20260718)
  const out: Transaction[] = []
  const start = addDays(DEMO_TODAY, -89)
  const narrativeDates = new Set(NARRATIVE.map((t) => t.date))

  const todayKey = toKey(DEMO_TODAY)

  for (let i = 0; i < 90; i++) {
    const d = addDays(start, i)
    const key = toKey(d)
    // 오늘은 내러티브 거래만 — "오늘의 예산 30%" 수치가 흔들리면 안 된다.
    // 내러티브가 박힌 다른 날도 생성 물량을 줄여 그날의 이야기가 잘 보이게 한다.
    const count = key === todayKey ? 0 : narrativeDates.has(key) ? 1 : 1 + Math.floor(rng() * 2)
    for (let j = 0; j < count; j++) {
      const cat = pick(rng, WEIGHTED_CATEGORIES)
      const [min, max] = SPEND_RANGE[cat]
      out.push({
        id: `g-${key}-${j}`,
        date: key,
        merchant: pick(rng, MERCHANTS[cat]),
        amount: -amountBetween(rng, min, max),
        category: cat,
      })
    }
    // 주 2회 정도 소액 저축, 격주 투자 — 오늘은 내러티브 거래만 (수치 고정 원칙)
    if ((d.getDay() === 1 || d.getDay() === 4) && key !== todayKey) {
      out.push({ id: `s-${key}`, date: key, merchant: '파리 여행 통장', amount: -amountBetween(rng, 5000, 20000), category: 'saving' })
    }
    if (d.getDay() === 5 && i % 14 < 7 && key !== todayKey) {
      out.push({ id: `i-${key}`, date: key, merchant: 'KODEX 200 매수', amount: -30000, category: 'invest' })
    }
    // 월급(매월 10일), 알바비(매월 3일)
    if (d.getDate() === 10 && !narrativeDates.has(key)) {
      out.push({ id: `pay-${key}`, date: key, merchant: '월급', amount: 2150000, category: 'income' })
    }
    if (d.getDate() === 3 && !narrativeDates.has(key)) {
      out.push({ id: `alba-${key}`, date: key, merchant: '알바비', amount: 380000, category: 'income' })
    }
  }
  return [...out, ...NARRATIVE].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export const TRANSACTIONS: Transaction[] = generate()
