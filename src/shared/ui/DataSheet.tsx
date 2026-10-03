import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** 기존 카드 색과 간격을 쓰며 브라우저의 모달 초점 이동·복원을 따른다. */
export function DataSheet({ title, children, onClose }: { title: string; children: ReactNode; onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => { if (!dialog.current?.open) dialog.current?.showModal() }, [])
  return (
    <dialog ref={dialog} aria-labelledby={titleId} onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }}
      className="fixed m-auto max-h-[80dvh] w-[min(92vw,396px)] overflow-y-auto overscroll-contain rounded-sheet border-0 bg-elevated p-6 text-ink shadow-float backdrop:bg-black/45">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-title font-extrabold">{title}</h2>
        <button type="button" aria-label="닫기" onClick={() => dialog.current?.close()} className="clay-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full"><X size={18} /></button>
      </div>
      {children}
    </dialog>
  )
}
