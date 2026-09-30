'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  Brain,
  Target,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { RoutineOSMark } from '@/components/brand/RoutineOSLogo';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & insights' },
  { path: '/builder', label: 'Routine Builder', icon: Brain, description: 'Generate & refine' },
  { path: '/goals', label: 'Goals', icon: Target, description: 'Track progress' },
  { path: '/calendar', label: 'Calendar', icon: Calendar, description: 'Sync & manage' },
  { path: '/settings', label: 'Settings', icon: Settings, description: 'Preferences' },
];

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <div className="noise-fixed" aria-hidden="true" />
      <motion.aside
        initial={{ width: isCollapsed ? '64px' : '280px' }}
        animate={{ width: isCollapsed ? '64px' : '280px' }}
        className={cn(
          'grain fixed left-0 top-0 z-40 h-screen backdrop-blur-xl border-r border-surface-200/60 dark:border-surface-800/70 transition-all duration-300 ease-spring',
          'flex flex-col overflow-hidden',
          'bg-white/85 dark:bg-[#080b11]/90'
        )}
        style={{ width: isCollapsed ? '64px' : '280px' }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-500/12 via-accent-500/6 to-transparent" />
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200/50 dark:border-surface-800/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={cn('relative flex items-center transition-all duration-300', isCollapsed ? 'justify-center gap-0' : 'gap-2.5')}
          >
            <RoutineOSMark
              uid="sidebar"
              size={34}
              className="shrink-0 drop-shadow-[0_0_10px_rgba(6,189,255,0.45)]"
            />
            {!isCollapsed && (
              <span className="font-display font-bold text-lg tracking-tight text-surface-900 dark:text-white">
                Routine<span className="text-brand-500">OS</span>
              </span>
            )}
          </motion.div>

          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </motion.button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {NAV_ITEMS.map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                    'text-surface-600 dark:text-surface-400',
                    'hover:text-surface-900 dark:hover:text-surface-100',
                    'hover:bg-surface-100 dark:hover:bg-surface-800/70',
                    'hover:translate-x-0.5',
                    isActive && 'bg-gradient-to-r from-brand-500/15 to-accent-500/10 text-brand-600 dark:text-brand-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
                    isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-gradient-to-b before:from-brand-400 before:to-accent-500 before:rounded-r-full before:shadow-[0_0_12px_rgba(6,189,255,0.8)]'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    <item.icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-sm truncate">{item.label}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-surface-200/50 dark:border-surface-800/50">
          <motion.button
            onClick={toggleTheme}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              'text-surface-600 dark:text-surface-400',
              'hover:text-surface-900 dark:hover:text-surface-100',
              'hover:bg-surface-100 dark:hover:bg-surface-800',
              isCollapsed && 'justify-center'
            )}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm">
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </span>
            )}
          </motion.button>
        </div>
      </motion.aside>

      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'min-h-screen transition-all duration-300 ease-spring',
          isCollapsed ? 'ml-16' : 'ml-70'
        )}
        style={{ marginLeft: isCollapsed ? '64px' : '280px' }}
      >
        <div className="sticky top-0 z-30 bg-white/75 dark:bg-[#06090e]/80 backdrop-blur-xl border-b border-surface-200/60 dark:border-surface-800/70">
          <div className="h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RoutineOSMark uid="top" size={20} className="sm:hidden" />
              <h1 className="font-display font-semibold text-xl tracking-tight text-surface-900 dark:text-surface-100">
                {NAV_ITEMS.filter(i => i.path !== '/' || location.pathname === '/')
                  .slice()
                  .sort((a, b) => b.path.length - a.path.length)
                  .find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'))
                  ?.label || 'Dashboard'}
              </h1>
              <span className="hidden sm:inline-block h-4 w-px bg-surface-300 dark:bg-surface-700" />
              <span className="hidden sm:inline eyebrow text-surface-400 dark:text-surface-500">RoutineOS</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-100/70 dark:bg-surface-800/70 text-sm text-surface-500 dark:text-surface-400">
                <span className="font-mono text-brand-500">⌘K</span>
                <span>Search</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center ring-1 ring-white/20 shadow-glow">
                <RoutineOSMark uid="avatar" size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative p-6">
          <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}