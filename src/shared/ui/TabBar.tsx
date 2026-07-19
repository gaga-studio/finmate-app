import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Home, NotebookPen, Sprout, Target, Users } from 'lucide-react'
import { snappy } from '../motion/springs'

const TABS = [
  { to: '/feed', label: '피드', Icon: Users },
  { to: '/my', label: '마이', Icon: Home },
  { to: '/growth', label: '성장', Icon: Sprout },
  { to: '/missions', label: '미션', Icon: Target },
  { to: '/diary', label: '다이어리', Icon: NotebookPen },
] as const

export function TabBar() {
  const { pathname } = useLocation()

  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-elevated/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="flex items-stretch">
        {TABS.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-x-3 inset-y-1 rounded-2xl bg-accent/12"
                  transition={snappy}
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'relative text-accent' : 'relative text-ink-faint'}
              />
              <span
                className={`relative text-[11px] font-semibold ${active ? 'text-accent' : 'text-ink-faint'}`}
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
