import { AnimatePresence, motion } from 'motion/react'
import { ListRow } from '../../../shared/ui/ListRow'
import { snappy } from '../../../shared/motion/springs'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, WISHLIST } from '../../../data/domain'
import { getTopSpending } from '../../../data/selectors'
import { formatKrwCompact } from '../../../shared/format/krw'
import type { Metric, Period } from '../myState'

const PANEL_TITLE: Record<Metric, string> = {
  budget: '소비 탑 5',
  saving: '위시 리스트',
  invest: '투자 종목',
}

/** 캐러셀의 활성 지표를 따라 내용이 갈아입는 리스트 패널 */
export function LinkedListPanel({ metric, period }: { metric: Metric; period: Period }) {
  return (
    <div className="flex h-full flex-col rounded-card bg-elevated px-3.5 py-3 shadow-float">
      <p className="mb-1 text-[14px] font-bold text-ink">{PANEL_TITLE[metric]}</p>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${metric}-${period}`}
          className="flex flex-1 flex-col justify-evenly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.04 } }}
          exit={{ opacity: 0, y: -8 }}
        >
          {rows(metric, period).map((row, i) => (
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

function rows(metric: Metric, period: Period): Row[] {
  if (metric === 'budget') {
    return getTopSpending(period).map((c, i) => {
      const meta = CATEGORY_META[c.category]
      return {
        key: c.category,
        leading: <span className="text-[13px] font-extrabold text-ink-soft">{i + 1}</span>,
        title: `${meta.emoji} ${meta.label}`,
        sub: `${c.count}건`,
        trailing: formatKrwCompact(c.total),
      }
    })
  }
  if (metric === 'saving') {
    return WISHLIST.map((w) => ({
      key: w.id,
      leading: w.emoji,
      title: w.title,
      sub: formatKrwCompact(w.price),
      trailing: <span className="text-saving">{Math.round(w.savedPct * 100)}%</span>,
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
