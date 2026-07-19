import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { TOP3_TITLE, WrappedCardView, type WrappedCardData } from '../my/wrapped/WrappedCardView'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic, snappy } from '../../shared/motion/springs'
import { DIARY_TODAY } from '../../data/diary'
import { ART } from '../../data/art-manifest'
import { CATEGORY_META } from '../../data/categories'
import { INVEST_CARDS, SAVING_CARDS } from '../../data/wrapped'
import { getBudget, getNetWorth, getPortfolio, getTopPurchases } from '../../data/selectors'
import { formatKrw, formatKrwCompact } from '../../shared/format/krw'

interface Props {
  onClose: () => void
}

/** 오늘 하루의 자동 기록 카드 3장 — [소비 / 자산 / 투자], 가로 스와이프로 넘긴다 */
export function DayCardsOverlay({ onClose }: Props) {
  const [slide, setSlide] = useState(0)
  const cards = buildCards()

  const go = (dir: number) => setSlide((s) => Math.max(0, Math.min(cards.length - 1, s + dir)))

  return createPortal(
    <div className="absolute inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="pointer-events-auto w-[min(84vw,340px)]"
        drag
        dragDirectionLock
        dragSnapToOrigin
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.55, left: 0.3, right: 0.3 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 800) onClose()
          else if (info.offset.x < -60) go(1)
          else if (info.offset.x > 60) go(-1)
        }}
      >
        <motion.div
          layoutId={`diary-${DIARY_TODAY.day}`}
          transition={dramatic}
          className="overflow-hidden rounded-sheet shadow-float"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={snappy}
            >
              <WrappedCardView data={cards[slide]} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 도트 인디케이터 + 닫기 */}
        <motion.div
          className="mt-4 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.28, ...dramatic }}
        >
          <div className="flex h-11 items-center gap-2 rounded-full bg-white/20 px-4 backdrop-blur-md">
            {cards.map((c, i) => (
              <button
                key={c.title}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={c.title}
                className="p-0.5"
              >
                <motion.span
                  className="block h-2 rounded-full bg-white"
                  animate={{ width: i === slide ? 20 : 8, opacity: i === slide ? 1 : 0.45 }}
                  transition={snappy}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </motion.div>

        <motion.p
          className="mt-3 text-center text-caption font-medium text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          하루가 끝나면 자동으로 만들어지는 기록이에요
        </motion.p>
      </motion.div>
      </div>
    </div>,
    overlayTarget(),
  )
}

function buildCards(): WrappedCardData[] {
  const b = getBudget('daily')
  const spendCard: WrappedCardData = {
    title: '7월 18일의 소비',
    rangeLabel: '오늘',
    headline: DIARY_TODAY.headline,
    subline: `지출 ${formatKrw(b.spent)} · 예산 ${Math.round(b.pct * 100)}% 남음`,
    metric: 'budget',
    artSrc: DIARY_TODAY.art,
    top3: getTopPurchases('daily').map((t) => ({
      key: t.id,
      label: `${CATEGORY_META[t.category].emoji} ${t.merchant}`,
      value: formatKrwCompact(-t.amount),
    })),
    top3Title: TOP3_TITLE.budget,
  }

  const assetCard: WrappedCardData = {
    title: SAVING_CARDS.asset.title,
    rangeLabel: '오늘',
    headline: SAVING_CARDS.asset.headline,
    subline: SAVING_CARDS.asset.subline,
    metric: 'saving',
    artSrc: ART.wrapped[SAVING_CARDS.asset.artKey],
    top3: getNetWorth()
      .assets.slice(0, 3)
      .map((a) => ({ key: a.id, label: `${a.emoji} ${a.title}`, value: formatKrwCompact(a.value) })),
    top3Title: '자산 구성',
  }

  const investCard: WrappedCardData = {
    title: INVEST_CARDS.status.title,
    rangeLabel: '오늘',
    headline: INVEST_CARDS.status.headline,
    subline: INVEST_CARDS.status.subline,
    metric: 'invest',
    artSrc: ART.wrapped[INVEST_CARDS.status.artKey],
    top3: getPortfolio()
      .slices.slice(0, 3)
      .map((s) => ({
        key: s.ticker,
        label: `📈 ${s.name}`,
        value: `${s.returnPct >= 0 ? '+' : ''}${s.returnPct.toFixed(1)}%`,
      })),
    top3Title: '투자 종목',
  }

  return [spendCard, assetCard, investCard]
}
