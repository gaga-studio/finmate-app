import { Signal, Wifi } from 'lucide-react'
import { DEMO_TODAY } from '../../data/demo'

/** 데모 고정 시각 — 촬영 재현성을 위해 실제 시계를 쓰지 않는다 */
const TIME = `${DEMO_TODAY.getHours()}:${String(DEMO_TODAY.getMinutes()).padStart(2, '0')}`

/** 폰 프레임 상단의 iOS풍 상태바 — 시간 · 셀룰러 · 와이파이 · 배터리 */
export function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-12 items-center justify-between bg-surface/75 px-7 pt-2 backdrop-blur-md">
      <span className="text-[15px] font-semibold tracking-tight text-ink">{TIME}</span>
      <div className="flex items-center gap-1.5 text-ink">
        <Signal size={15} strokeWidth={2.6} />
        <Wifi size={16} strokeWidth={2.6} />
        <Battery />
      </div>
    </div>
  )
}

/** iOS풍 배터리 — 본체 + 꼭지 + 잔량 */
function Battery() {
  return (
    <div className="flex items-center">
      <div className="flex h-[11px] w-[22px] items-center rounded-[3.5px] border border-ink/50 p-[1.5px]">
        <div className="h-full w-[78%] rounded-[1.5px] bg-ink" />
      </div>
      <div className="ml-[1px] h-[4px] w-[1.5px] rounded-r-full bg-ink/50" />
    </div>
  )
}
