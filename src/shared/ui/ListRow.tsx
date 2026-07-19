import type { ReactNode } from 'react'

interface Props {
  leading: ReactNode
  title: string
  sub?: string
  trailing?: ReactNode
  /** 고정 높이 패널에 5행을 수납할 때 (마이 탭 연동 리스트) */
  dense?: boolean
}

/** 소비탑5·위시리스트·보유종목·일별 내역·미션이 공유하는 행 */
export function ListRow({ leading, title, sub, trailing, dense }: Props) {
  return (
    <div className={`flex items-center gap-2 ${dense ? 'py-[3px]' : 'py-[5px]'}`}>
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg bg-ink/5 ${
          dense ? 'h-6 w-6 text-[12px]' : 'h-7 w-7 text-[13px]'
        }`}
      >
        {leading}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold text-ink ${dense ? 'text-[12.5px] leading-tight' : 'text-[13px]'}`}>
          {title}
        </p>
        {sub && (
          <p className={`truncate text-ink-soft ${dense ? 'text-[10.5px] leading-tight' : 'text-[11px]'}`}>
            {sub}
          </p>
        )}
      </div>
      {trailing && <div className="shrink-0 text-right text-[12px] font-bold text-ink">{trailing}</div>}
    </div>
  )
}
