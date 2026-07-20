import { AnimatePresence, motion } from 'motion/react'
import { ListRow } from '../../../shared/ui/ListRow'
import { EmojiIcon } from '../../../shared/ui/EmojiIcon'
import { snappy } from '../../../shared/motion/springs'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, STOCK_NEWS } from '../../../data/domain'
import { getIncomeSources, getNetWorth, getPortfolio, getTopPurchases } from '../../../data/selectors'
import { formatKrwCompact } from '../../../shared/format/krw'
import type { InvestView, Metric, Period, SavingView } from '../myState'

/** 메이트 쪽 getMateListRows와 같은 매핑 — 비교 2열의 좌우 제목이 전 뷰에서 일치한다 */
const SAVING_PANEL_TITLE: Record<SavingView, string> = {
  goal: '저축 목표',
  monthly: '월간 저축',
  asset: '소득 출처',
}

const INVEST_PANEL_TITLE: Record<InvestView, string> = {
  status: '투자 종목',
  portfolio: '포트폴리오 비중',
  news: '핫한 뉴스',
}

function panelTitle(metric: Metric, savingView: SavingView, investView: InvestView): string {
  if (metric === 'budget') return '소비 탑 5'
  if (metric === 'invest') return INVEST_PANEL_TITLE[investView]
  return SAVING_PANEL_TITLE[savingView]
}

/** 캐러셀의 활성 지표(저축·투자는 뷰까지)를 따라 내용이 갈아입는 리스트 패널 */
export function LinkedListPanel({
  metric,
  period,
  savingView,
  investView,
  hideSub,
}: {
  metric: Metric
  period: Period
  savingView: SavingView
  investView: InvestView
  /** 좁은 2열(메이트 비교)에서 부제를 숨겨 '…' 잘림을 막는다 */
  hideSub?: boolean
}) {
  return (
    <div className="clay-card flex h-full flex-col rounded-card px-3.5 py-3">
      <p className="mb-1 text-section font-bold text-ink">{panelTitle(metric, savingView, investView)}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={
            metric === 'saving'
              ? `saving-${savingView}`
              : metric === 'invest'
                ? `invest-${investView}`
                : `${metric}-${period}`
          }
          className="flex flex-1 flex-col justify-evenly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.04 } }}
          exit={{ opacity: 0, y: -8 }}
        >
          {rows(metric, period, savingView, investView).map((row, i) => (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.045, ...snappy }}
            >
              <ListRow dense leading={row.leading} title={row.title} sub={hideSub ? undefined : row.sub} trailing={row.trailing} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

interface Row {
  key: string
  leading: React.ReactNode
  title: string
  sub?: string
  trailing?: React.ReactNode
}

function rank(i: number): React.ReactNode {
  return <span className="text-body font-extrabold text-ink-soft">{i + 1}</span>
}

function rows(metric: Metric, period: Period, savingView: SavingView, investView: InvestView): Row[] {
  if (metric === 'budget') {
    return getTopPurchases(period).map((t, i) => {
      const meta = CATEGORY_META[t.category]
      return {
        key: t.id,
        leading: rank(i),
        title: t.merchant,
        sub: t.memo ?? meta.label,
        trailing: <span className="text-budget">{formatKrwCompact(-t.amount)}</span>,
      }
    })
  }
  if (metric === 'saving') {
    // 월간 저축 — 이번 달 수입에서 저축한 항목들 (거래 실측과 정합)
    if (savingView === 'monthly') {
      const rowsData = [
        { id: 'ms-emergency', emoji: '🛡️', title: '비상금 통장', amount: 200_000 },
        { id: 'ms-housing', emoji: '🏠', title: '주택청약', amount: 100_000 },
        { id: 'ms-paris', emoji: '✈️', title: '파리 통장', amount: 93_900 },
      ]
      return rowsData.map((r, i) => ({
        key: r.id,
        leading: rank(i),
        title: r.title,
        sub: '이번 달',
        trailing: <span className="text-saving">월 {formatKrwCompact(r.amount)}</span>,
      }))
    }
    // 소득 출처 — 메이트 쪽과 같은 슬롯(asset 뷰)
    if (savingView === 'asset') {
      return getIncomeSources().map((s, i) => ({
        key: s.merchant,
        leading: rank(i),
        title: s.merchant,
        sub: `${s.count}건`,
        trailing: <span className="text-saving">{formatKrwCompact(s.total)}</span>,
      }))
    }
    // 저축 목표 — 목표별 달성액 (자산 실측 기반)
    return getNetWorth()
      .assets.slice(0, 3)
      .map((a, i) => ({
        key: a.id,
        leading: rank(i),
        title: a.title,
        trailing: <span className="text-saving">{formatKrwCompact(a.value)} 달성</span>,
      }))
  }
  if (investView === 'portfolio') {
    return getPortfolio().slices.map((s, i) => ({
      key: s.ticker,
      leading: rank(i),
      title: s.name,
      sub: formatKrwCompact(s.value),
      trailing: <span className="text-invest">{Math.round(s.weight * 100)}%</span>,
    }))
  }
  if (investView === 'news') {
    return STOCK_NEWS.map((n) => ({
      key: n.id,
      leading: <EmojiIcon emoji="📰" size={22} className="text-invest" />,
      title: n.name,
      sub: n.summary,
      trailing: (
        <span className={n.changePct >= 0 ? 'text-rise' : 'text-fall'}>
          {n.changePct >= 0 ? '+' : ''}
          {n.changePct.toFixed(1)}%
        </span>
      ),
    }))
  }
  // 현황: 수익률 내림차순 — 1위 종목이 아트카드의 주인공이 된다
  return [...HOLDINGS]
    .sort((a, b) => b.returnPct - a.returnPct)
    .map((h, i) => ({
      key: h.ticker,
      leading: rank(i),
      title: h.name,
      sub: formatKrwCompact(h.value),
      trailing: (
        <span className={h.returnPct >= 0 ? 'text-rise' : 'text-fall'}>
          {h.returnPct >= 0 ? '+' : ''}
          {h.returnPct.toFixed(1)}%
        </span>
      ),
    }))
}
