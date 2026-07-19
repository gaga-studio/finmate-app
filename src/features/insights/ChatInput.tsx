import { AnimatePresence, motion } from 'motion/react'
import { Plus, Send } from 'lucide-react'
import { SUGGESTION_CHIPS } from '../../data/insights'
import { snappy } from '../../shared/motion/springs'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  chipsOpen: boolean
  onToggleChips: () => void
  /** 칩 탭 → 입력창 템플릿 삽입 */
  onChip: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ value, onChange, onSend, chipsOpen, onToggleChips, onChip, disabled }: Props) {
  return (
    <div className="border-t border-line/70 px-3 pb-3 pt-2">
      <AnimatePresence>
        {chipsOpen && (
          <motion.div
            className="flex flex-wrap gap-1.5 pb-2"
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={snappy}
          >
            {SUGGESTION_CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChip(c)}
                className="rounded-full border border-accent/30 bg-accent/8 px-3 py-1.5 text-caption font-bold text-accent"
              >
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <button
          type="button"
          onClick={onToggleChips}
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-elevated text-ink shadow-soft disabled:opacity-40"
          aria-label="추천 질문"
        >
          <Plus size={18} className={`transition-transform ${chipsOpen ? 'rotate-45' : ''}`} />
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="만약 …"
          disabled={disabled}
          className="h-10 min-w-0 flex-1 rounded-full bg-elevated px-4 text-body font-medium text-ink shadow-soft outline-none placeholder:text-ink-faint disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || value.trim() === ''}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-soft disabled:opacity-30"
          aria-label="전송"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
