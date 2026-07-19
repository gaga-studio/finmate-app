import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'motion/react'
import { Download, Share2, X } from 'lucide-react'
import { WrappedCardNode } from './WrappedCardNode'
import { captureCard, saveOrShare } from './exportCard'
import { dramatic } from '../../../shared/motion/springs'
import type { InvestView, Metric, Period, SavingView } from '../myState'

interface Props {
  metric: Metric
  period: Period
  savingView?: SavingView
  investView?: InvestView
  onClose: () => void
}

/**
 * Wrapped 9:16 풀스크린 오버레이 — 썸네일과 layoutId="wrapped-card"를
 * 공유해 위치/크기/radius가 자동 보간된다. 아래로 드래그해 닫는다.
 */
export function WrappedOverlay({ metric, period, savingView, investView, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const handleExport = async () => {
    if (!cardRef.current || busy) return
    setBusy(true)
    try {
      const dataUrl = await captureCard(cardRef.current)
      const result = await saveOrShare(dataUrl)
      setToast(result === 'shared' ? '공유했어요' : '이미지를 저장했어요')
    } catch {
      setToast('저장에 실패했어요')
    } finally {
      setBusy(false)
      setTimeout(() => setToast(null), 2000)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* dim 배경 */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 w-[min(84vw,340px)] -translate-x-1/2 -translate-y-1/2"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.08, bottom: 0.55 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 800) onClose()
        }}
      >
        <motion.div
          layoutId="wrapped-card"
          transition={dramatic}
          className="overflow-hidden rounded-sheet shadow-float"
        >
          <WrappedCardNode
            ref={cardRef}
            metric={metric}
            period={period}
            savingView={savingView}
            investView={investView}
          />
        </motion.div>

        {/* 콘텐츠 등장 후 액션 바 */}
        <motion.div
          className="mt-4 flex justify-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.28, ...dramatic }}
        >
          <ActionButton onClick={handleExport} disabled={busy} icon={<Download size={16} />} label="이미지 저장" />
          <ActionButton onClick={handleExport} disabled={busy} icon={<Share2 size={16} />} label="공유하기" primary />
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md"
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </motion.div>
      </motion.div>

      {toast && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 bottom-10 mx-auto w-fit rounded-full bg-black/75 px-4 py-2 text-body font-semibold text-white"
        >
          {toast}
        </motion.p>
      )}
    </div>,
    document.body,
  )
}

function ActionButton({
  onClick,
  disabled,
  icon,
  label,
  primary,
}: {
  onClick: () => void
  disabled?: boolean
  icon: React.ReactNode
  label: string
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 items-center gap-2 rounded-full px-4 text-body font-bold backdrop-blur-md ${
        primary ? 'bg-white text-ink' : 'bg-white/20 text-white'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      {icon}
      {label}
    </button>
  )
}
