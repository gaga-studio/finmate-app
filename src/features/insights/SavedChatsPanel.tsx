import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Bookmark, X } from 'lucide-react'
import { overlayTarget } from '../../shared/ui/overlayTarget'
import { dramatic } from '../../shared/motion/springs'
import type { SavedSession } from '../../data/insights'

interface Props {
  sessions: SavedSession[]
  onOpen: (s: SavedSession) => void
  onClose: () => void
}

/** 햄버거 메뉴 — 저장된 대화 목록, 탭하면 다시보기로 로드 */
export function SavedChatsPanel({ sessions, onOpen, onClose }: Props) {
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
        className="absolute inset-y-0 left-0 w-[300px] bg-surface px-5 pb-8 pt-14 shadow-float"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={dramatic}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-title font-extrabold text-ink">저장된 대화</h2>
          <button
            type="button"
            onClick={onClose}
            className="clay-card flex h-8 w-8 items-center justify-center rounded-full text-ink"
            aria-label="닫기"
          >
            <X size={15} />
          </button>
        </div>
        <p className="mt-1 text-caption font-medium text-ink-soft">저장한 인사이트를 다시 볼 수 있어요</p>

        <div className="mt-4 flex flex-col gap-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onOpen(s)
                onClose()
              }}
              className="clay-card rounded-2xl px-4 py-3 text-left transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Bookmark size={13} className="shrink-0 text-saving" />
                <p className="line-clamp-1 text-body font-bold text-ink">{s.title}</p>
              </div>
              <p className="mt-0.5 pl-[21px] text-caption font-medium text-ink-faint">{s.savedAt} 저장</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    overlayTarget(),
  )
}
