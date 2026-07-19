import { AnimatePresence, motion } from 'motion/react'
import { ListRow } from '../../../shared/ui/ListRow'
import { snappy } from '../../../shared/motion/springs'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, WISHLIST } from '../../../data/domain'
import { getIncomeSources, getNetWorth, getTopPurchases } from '../../../data/selectors'
import { formatKrwCompact } from '../../../shared/format/krw'
import type { Metric, Period, SavingView } from '../myState'

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

function panelTitle(metric: Metric, savingView: SavingView): string {
  if (metric === 'budget') return '소비 탑 5'
  if (metric === 'invest') return '투자 종목'
  return SAVING_PANEL_TITLE[savingView]
}

/** 캐러셀의 활성 지표(저축은 뷰까지)를 따라 내용이 갈아입는 리스트 패널 */
export function LinkedListPanel({
  metric,
  period,
  savingView,
}: {
  metric: Metric
  period: Period
  savingView: SavingView
}) {
  return (
    <div className="flex h-full flex-col rounded-card bg-elevated px-3.5 py-3 shadow-float">
      <p className="mb-1 text-section font-bold text-ink">{panelTitle(metric, savingView)}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={metric === 'saving' ? `saving-${savingView}` : `${metric}-${period}`}
          className="flex flex-1 flex-col justify-evenly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.04 } }}
          exit={{ opacity: 0, y: -8 }}
        >
          {rows(metric, period, savingView).map((row, i) => (
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

function rows(metric: Metric, period: Period, savingView: SavingView): Row[] {
  if (metric === 'budget') {
    return getTopPurchases(period).map((t, i) => {
      const meta = CATEGORY_META[t.category]
      return {
        key: t.id,
        leading: rank(i),
        title: `${meta.emoji} ${t.merchant}`,
        sub: t.memo ?? meta.label,
        trailing: formatKrwCompact(-t.amount),
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
        trailing: formatKrwCompact(a.value),
      }))
    }
    return WISHLIST.map((w) => ({
      key: w.id,
      leading: w.emoji,
      title: w.title,
      trailing: formatKrwCompact(w.price),
    }))
  }
  return HOLDINGS.map((h) => ({
    key: h.ticker,
    leading: '📈',
    title: h.name,
    sub: formatKrwCompact(h.value),
    trailing: (
      <span className={h.returnPct >= 0 ? 'text-invest' : 'text-danger'}>
        {h.returnPct >= 0 ? '+' : ''}
        {h.returnPct.toFixed(1)}%
      </span>
    ),
  }))
}
