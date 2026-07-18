import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { TabBar } from '../../shared/ui/TabBar'
import { snappy } from '../../shared/motion/springs'

export function TabLayout() {
  const { pathname } = useLocation()

  return (
    <div className="flex h-full min-h-dvh flex-col sm:min-h-0">
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={pathname}
            className="h-full overflow-y-auto pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={snappy}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
      <TabBar />
    </div>
  )
}
