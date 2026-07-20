import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, Lightbulb, NotebookPen, Target, Users } from 'lucide-react'
import { snappy } from '../motion/springs'

const TABS = [
  { to: '/feed', label: '피드', Icon: Users },
  { to: '/insights', label: '분석', Icon: Lightbulb },
  { to: '/my', label: '마이', Icon: Home },
  { to: '/missions', label: '미션', Icon: Target },
  { to: '/diary', label: '기록', Icon: NotebookPen },
] as const

export function TabBar() {
  const { pathname } = useLocation()

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))]">
      <div className="flex items-stretch rounded-[22px] border border-line bg-white/95 px-1 py-1 shadow-soft backdrop-blur-xl">
        {TABS.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center gap-1 rounded-[1.35rem] py-2.5 transition-transform active:scale-[0.98]"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-x-1.5 inset-y-1 rounded-[18px] bg-point ring-1 ring-accent/15"
                  transition={snappy}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'relative text-accent' : 'relative text-ink-faint'}
              />
              <span
                className={`relative text-caption font-semibold ${active ? 'text-accent' : 'text-ink-faint'}`}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
