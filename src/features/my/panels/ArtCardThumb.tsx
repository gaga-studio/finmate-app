import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { ArtOrGradient } from '../../../shared/ui/ArtOrGradient'
import { ART } from '../../../data/art-manifest'
import { WRAPPED } from '../../../data/wrapped'
import type { Metric, Period } from '../myState'

interface Props {
  period: Period
  metric: Metric
  onOpen: () => void
}

/** Wrapped 공유 카드의 썸네일 — layoutId로 오버레이 확대의 출발점이 된다 */
export function ArtCardThumb({ period, metric, onOpen }: Props) {
  const content = WRAPPED[metric][period]
  return (
    <motion.button
      type="button"
      layoutId="wrapped-card"
      onClick={onOpen}
      whileTap={{ scale: 0.97 }}
      className="relative block h-full w-full overflow-hidden rounded-card text-left shadow-float"
    >
      <ArtOrGradient src={ART.wrapped[content.artKey]} palette={metric} className="h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            {content.title}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
            <ArrowUpRight size={14} strokeWidth={2.6} />
          </span>
        </div>
        <p className="absolute inset-x-0 bottom-0 whitespace-pre-line break-keep p-3.5 text-[14px] font-bold leading-snug text-white">
          {content.headline}
        </p>
      </ArtOrGradient>
    </motion.button>
  )
}
