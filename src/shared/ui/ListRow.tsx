import type { ReactNode } from 'react'

interface Props {
  leading: ReactNode
  title: string
  sub?: string
  trailing?: ReactNode
}

/** 소비탑5·위시리스트·보유종목·일별 내역·미션이 공유하는 행 */
export function ListRow({ leading, title, sub, trailing }: Props) {
  return (
    <div className="flex items-center gap-2 py-[5px]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-[13px]">
        {leading}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{title}</p>
        {sub && <p className="truncate text-[11px] text-ink-soft">{sub}</p>}
      </div>
      {trailing && <div className="shrink-0 text-right text-[12px] font-bold text-ink">{trailing}</div>}
    </div>
  )
}
