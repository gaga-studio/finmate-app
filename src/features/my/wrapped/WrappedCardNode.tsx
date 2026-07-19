import { forwardRef } from 'react'
import { WrappedCardView } from './WrappedCardView'
import { ART } from '../../../data/art-manifest'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, WISHLIST } from '../../../data/domain'
import { formatKrwCompact } from '../../../shared/format/krw'
import { getWrapped, type WrappedSummary } from '../../../data/selectors'
import type { Metric, Period } from '../myState'

interface Props {
  metric: Metric
  period: Period
  /** 캡처 대상이 되는 원본 크기 여부 (피드에서는 축소 렌더) */
  className?: string
}

/** 내 Wrapped 카드 — 셀렉터 데이터를 조립해 WrappedCardView에 위임한다. 캡처 대상. */
export const WrappedCardNode = forwardRef<HTMLDivElement, Props>(function WrappedCardNode(
  { metric, period, className },
  ref,
) {
  const w = getWrapped(metric, period)

  return (
    <div ref={ref} className={className}>
      <WrappedCardView
        data={{
          title: w.title,
          rangeLabel: w.rangeLabel,
          headline: w.headline,
          subline: w.subline,
          metric,
          artSrc: ART.wrapped[w.artKey],
          top3: top3Rows(metric, w),
          top3Title: TOP3_TITLE[metric],
        }}
      />
    </div>
  )
})

const TOP3_TITLE: Record<Metric, string> = {
  budget: '소비 탑 3',
  saving: '위시 리스트',
  invest: '투자 종목',
}

function top3Rows(metric: Metric, w: WrappedSummary): { key: string; label: string; value: string }[] {
  if (metric === 'budget') {
    return w.topSpending.slice(0, 3).map((c) => {
      const meta = CATEGORY_META[c.category]
      return { key: c.category, label: `${meta.emoji} ${meta.label}`, value: formatKrwCompact(c.total) }
    })
  }
  if (metric === 'saving') {
    return WISHLIST.slice(0, 3).map((item) => ({
      key: item.id,
      label: `${item.emoji} ${item.title}`,
      value: `${Math.round(item.savedPct * 100)}%`,
    }))
  }
  return HOLDINGS.slice(0, 3).map((h) => ({
    key: h.ticker,
    label: `📈 ${h.name}`,
    value: `${h.returnPct >= 0 ? '+' : ''}${h.returnPct.toFixed(1)}%`,
  }))
}
