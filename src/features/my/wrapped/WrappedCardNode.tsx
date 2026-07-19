import { forwardRef } from 'react'
import { TOP3_TITLE, WrappedCardView } from './WrappedCardView'
import { ART } from '../../../data/art-manifest'
import { CATEGORY_META } from '../../../data/categories'
import { HOLDINGS, WISHLIST } from '../../../data/domain'
import { SAVING_CARDS } from '../../../data/wrapped'
import { formatKrwCompact } from '../../../shared/format/krw'
import { getIncomeSources, getNetWorth, getWrapped, type WrappedSummary } from '../../../data/selectors'
import type { Metric, Period, SavingView } from '../myState'

interface Props {
  metric: Metric
  period: Period
  /** 저축 지표는 기간이 아니라 뷰별 카드 (목표/소득/자산) */
  savingView?: SavingView
  /** 캡처 대상이 되는 원본 크기 여부 (피드에서는 축소 렌더) */
  className?: string
}

const SAVING_TOP3_TITLE: Record<SavingView, string> = {
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

/** 내 Wrapped 카드 — 셀렉터 데이터를 조립해 WrappedCardView에 위임한다. 캡처 대상. */
export const WrappedCardNode = forwardRef<HTMLDivElement, Props>(function WrappedCardNode(
  { metric, period, savingView, className },
  ref,
) {
  if (metric === 'saving' && savingView) {
    const card = SAVING_CARDS[savingView]
    return (
      <div ref={ref} className={className}>
        <WrappedCardView
          data={{
            title: card.title,
            rangeLabel: '7월',
            headline: card.headline,
            subline: card.subline,
            metric: 'saving',
            artSrc: ART.wrapped[card.artKey],
            top3: savingTop3(savingView),
            top3Title: SAVING_TOP3_TITLE[savingView],
          }}
        />
      </div>
    )
  }

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

function savingTop3(view: SavingView): { key: string; label: string; value: string }[] {
  if (view === 'goal') {
    return WISHLIST.slice(0, 3).map((item) => ({
      key: item.id,
      label: `${item.emoji} ${item.title}`,
      value: `${Math.round(item.savedPct * 100)}%`,
    }))
  }
  if (view === 'monthly') {
    return getIncomeSources()
      .slice(0, 3)
      .map((s) => ({
        key: s.merchant,
        label: `${INCOME_EMOJI[s.merchant] ?? '💵'} ${s.merchant}`,
        value: formatKrwCompact(s.total),
      }))
  }
  return getNetWorth()
    .assets.slice(0, 3)
    .map((a) => ({ key: a.id, label: `${a.emoji} ${a.title}`, value: formatKrwCompact(a.value) }))
}

function top3Rows(metric: Metric, w: WrappedSummary): { key: string; label: string; value: string }[] {
  if (metric === 'budget') {
    return w.topPurchases.slice(0, 3).map((t) => ({
      key: t.id,
      label: `${CATEGORY_META[t.category].emoji} ${t.merchant}`,
      value: formatKrwCompact(-t.amount),
    }))
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
