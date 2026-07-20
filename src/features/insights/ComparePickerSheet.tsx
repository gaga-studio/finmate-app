import { EmojiIcon } from '../../shared/ui/EmojiIcon'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic } from '../../shared/motion/springs'
import { COMPARE_TARGETS } from '../../data/insights'

interface Props {
  /** 현재 그래프에 겹쳐진 대상 (없으면 null) */
  selectedId: string | null
  /** 채팅 선택지에서 진입 시 해당 종류만 노출 — 없으면 전체 */
  filter?: 'mate' | 'group'
  onSelect: (targetId: string | null) => void
  onClose: () => void
}

/** 비교 시트 — 메이트/그룹을 골라 내 투영 위에 선으로 겹친다 */
export function ComparePickerSheet({ selectedId, filter, onSelect, onClose }: Props) {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedId)
  const closeTimer = useRef<number | null>(null)
  const mates = COMPARE_TARGETS.filter((t) => t.kind === 'mate')
  const groups = COMPARE_TARGETS.filter((t) => t.kind === 'group')

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  const pick = (id: string) => {
    const nextId = id === localSelectedId ? null : id
    setLocalSelectedId(nextId)
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      onSelect(nextId)
      onClose()
    }, 180)
  }

  return createPortal(
    <div className="absolute inset-0 z-[60]">
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 max-h-[72%] overflow-y-auto rounded-t-sheet bg-elevated px-6 pb-10 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={dramatic}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 700) onClose()
        }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
        <h2 className="text-title font-extrabold text-ink">
          {filter === 'mate' ? '메이트 고르기' : filter === 'group' ? '그룹 고르기' : '그래프 비교'}
        </h2>
        <p className="mt-0.5 text-caption font-medium text-ink-soft">
          고르면 내 그래프 위에 선으로 겹쳐져요 · 다시 누르면 해제
        </p>

        {filter !== 'group' && <Section title="메이트" items={mates} selectedId={localSelectedId} onPick={pick} />}
        {filter !== 'mate' && <Section title="그룹 평균" items={groups} selectedId={localSelectedId} onPick={pick} />}
      </motion.div>
    </div>,
    overlayTarget(),
  )
}

function Section({
  title,
  items,
  selectedId,
  onPick,
}: {
  title: string
  items: typeof COMPARE_TARGETS
  selectedId: string | null
  onPick: (id: string) => void
}) {
  return (
    <div className="mt-4">
      <p className="text-caption font-bold text-ink-faint">{title}</p>
      <div className="mt-1.5 flex flex-col">
        {items.map((t) => {
          const active = t.id === selectedId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className="flex items-center gap-3 py-2.5 text-left"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/5 text-title">
                <EmojiIcon emoji={t.emoji} avatarId={t.id} size={42} className="text-accent" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-extrabold leading-snug text-ink">{t.label}</p>
                <p className="mt-0.5 text-body font-medium text-ink-soft">{t.sub}</p>
              </div>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  active ? 'border-accent bg-accent text-white' : 'border-ink/10 bg-ink/5 text-ink-faint'
                }`}
                aria-hidden
              >
                <Check size={14} strokeWidth={3} className={active ? '' : 'opacity-35'} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
