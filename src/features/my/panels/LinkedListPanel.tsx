import { AnimatePresence, motion } from 'motion/react'
import { ListRow } from '../../../shared/ui/ListRow'
import { snappy } from '../../../shared/motion/springs'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, STOCK_NEWS, WISHLIST } from '../../../data/domain'
import { getIncomeSources, getNetWorth, getPortfolio, getTopPurchases } from '../../../data/selectors'
import { formatKrwCompact } from '../../../shared/format/krw'
import type { InvestView, Metric, Period, SavingView } from '../myState'

const SAVING_PANEL_TITLE: Record<SavingView, string> = {
  goal: '위시 리스트',
  monthly: '소득 출처',
  asset: '자산 구성',
}

const INCOME_EMOJI: Record<string, string> = {
  월급: '💼',
  알바비: '🧾',
  '당근마켓 판매': '🥕',
  '예금 이자': '🏦',
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
}: {
  metric: Metric
  period: Period
  savingView: SavingView
  investView: InvestView
}) {
  return (
    <div className="flex h-full flex-col rounded-card bg-elevated px-3.5 py-3 shadow-float">
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
              <ListRow dense leading={row.leading} title={row.title} sub={row.sub} trailing={row.trailing} />
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
        title: `${meta.emoji} ${t.merchant}`,
        sub: t.memo ?? meta.label,
        trailing: <span className="text-budget">{formatKrwCompact(-t.amount)}</span>,
      }
    })
  }
  if (metric === 'saving') {
    if (savingView === 'monthly') {
      return getIncomeSources().map((s, i) => ({
        key: s.merchant,
        leading: rank(i),
        title: `${INCOME_EMOJI[s.merchant] ?? '💵'} ${s.merchant}`,
        sub: `${s.count}건`,
        trailing: <span className="text-saving">{formatKrwCompact(s.total)}</span>,
      }))
    }
    if (savingView === 'asset') {
      return getNetWorth().assets.map((a, i) => ({
        key: a.id,
        leading: rank(i),
        title: `${a.emoji} ${a.title}`,
        trailing: <span className="text-saving">{formatKrwCompact(a.value)}</span>,
      }))
    }
    return WISHLIST.map((w) => ({
      key: w.id,
      leading: w.emoji,
      title: w.title,
      trailing: <span className="text-saving">{formatKrwCompact(w.price)}</span>,
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
      leading: '📰',
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
