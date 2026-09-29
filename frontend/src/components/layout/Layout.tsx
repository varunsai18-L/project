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
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

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
      <motion.aside
        initial={{ width: isCollapsed ? '64px' : '280px' }}
        animate={{ width: isCollapsed ? '64px' : '280px' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-r border-surface-200/50 dark:border-surface-800/50 transition-all duration-300 ease-spring',
          'flex flex-col overflow-hidden'
        )}
        style={{ width: isCollapsed ? '64px' : '280px' }}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200/50 dark:border-surface-800/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={cn('flex items-center gap-3 transition-all duration-300', isCollapsed && 'justify-center')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-display font-bold text-xl text-surface-900 dark:text-surface-100">
                Routine Agent
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
                    'hover:bg-surface-100 dark:hover:bg-surface-800',
                    isActive && 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
                    isActive && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-brand-500 before:rounded-r-full'
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
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/50 dark:border-surface-800/50">
          <div className="h-16 px-6 flex items-center justify-between">
            <h1 className="font-display font-semibold text-xl text-surface-900 dark:text-surface-100">
              {NAV_ITEMS.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm text-surface-600 dark:text-surface-400">
                <span className="font-mono">⌘K</span>
                <span>Search</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500" />
            </div>
          </div>
        </div>

        <div className="p-6">
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