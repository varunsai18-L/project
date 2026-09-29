'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { AGENT_STATE_CONFIG, type AgentState } from '@/types/agent';

interface AgentOrbProps {
  state: AgentState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showLabel?: boolean;
  showProgress?: boolean;
  progress?: number;
}

const SIZE_CLASSES = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

const COLOR_MAP: Record<string, { main: string; light: string; dark: string; glow: string }> = {
  brand:    { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', glow: 'rgba(14,165,233,0.5)' },
  accent:   { main: '#d946ef', light: '#e879f9', dark: '#c026d3', glow: 'rgba(217,70,239,0.5)' },
  success:  { main: '#22c55e', light: '#4ade80', dark: '#16a34a', glow: 'rgba(34,197,94,0.5)' },
  warning:  { main: '#f59e0b', light: '#fbbf24', dark: '#d97706', glow: 'rgba(245,158,11,0.5)' },
  danger:   { main: '#ef4444', light: '#f87171', dark: '#dc2626', glow: 'rgba(239,68,68,0.5)' },
};

const ORB_ANIMATIONS = {
  idle: {
    scale: [1, 1.02, 1],
    rotate: [0, 0, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  understanding: {
    scale: [1, 1.05, 1],
    rotate: [0, 180, 360],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
  planning: {
    scale: [1, 1.08, 1],
    rotate: [0, -90, -180, -270, -360],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  optimizing: {
    scale: [1, 1.1, 0.95, 1],
    rotate: [0, 90, 180, 270, 360],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  ready: {
    scale: [1, 1.03, 1],
    rotate: 0,
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  replanning: {
    scale: [1, 1.06, 1],
    rotate: [0, -180, -360],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
  needs_approval: {
    scale: [1, 1.04, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  adapting: {
    scale: [1, 1.06, 1],
    rotate: [0, -180, -360],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
  error: {
    scale: [1, 1.02, 1],
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

export function AgentOrb({
  state,
  size = 'lg',
  className,
  showLabel = true,
  showProgress = false,
  progress = 0,
}: AgentOrbProps) {
  const config = AGENT_STATE_CONFIG[state];
  const colors = COLOR_MAP[config.color] || COLOR_MAP.brand;
  const isActive = state !== 'idle' && state !== 'ready' && state !== 'error';

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: SIZE_CLASSES[size], height: SIZE_CLASSES[size] }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="absolute inset-0"
            animate={ORB_ANIMATIONS[state]}
            initial={false}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <defs>
                <radialGradient id={`orb-g-${state}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={colors.main} stopOpacity="0.25" />
                  <stop offset="60%" stopColor={colors.main} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={`orb-r-${state}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={colors.light} />
                  <stop offset="50%" stopColor={colors.dark} />
                  <stop offset="100%" stopColor={colors.light} />
                </linearGradient>
                <filter id={`orb-glow-${state}`}>
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <circle cx="50" cy="50" r="46" fill={`url(#orb-g-${state})`} />

              {isActive && (
                <>
                  <circle
                    cx="50" cy="50" r="38"
                    stroke={`url(#orb-r-${state})`}
                    strokeWidth="2" fill="none"
                    strokeDasharray="120"
                    className="opacity-70"
                  >
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx="50" cy="50" r="30"
                    stroke={`url(#orb-r-${state})`}
                    strokeWidth="1.5" fill="none"
                    strokeDasharray="80"
                    className="opacity-40"
                  >
                    <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="4s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {state === 'ready' && (
                <circle
                  cx="50" cy="50" r="42"
                  stroke="#22c55e" strokeWidth="2.5" fill="none"
                  strokeDasharray="264" strokeDashoffset="0"
                  opacity="0.9"
                >
                  <animate attributeName="strokeDashoffset" from="264" to="0" dur="0.8s" fill="freeze" />
                </circle>
              )}

              <circle
                cx="50" cy="50"
                r={state === 'idle' ? 24 : state === 'ready' ? 28 : 20}
                fill={colors.main}
                filter={`url(#orb-glow-${state})`}
              />

              <circle
                cx="50" cy="50"
                r={state === 'idle' ? 24 : state === 'ready' ? 28 : 20}
                fill="none"
                stroke={colors.light}
                strokeWidth="1"
                opacity="0.6"
              />

              {showProgress && progress > 0 && (
                <circle
                  cx="50" cy="50" r="44"
                  stroke={colors.main}
                  strokeWidth="3" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44 * (progress / 100)} ${2 * Math.PI * 44}`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-700 ease-out"
                  opacity="0.9"
                />
              )}

              <g>
                {[...Array(8)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx="50" cy="50"
                    r={state === 'optimizing' ? 3 : 2}
                    fill={colors.light}
                    animate={{
                      r: [state === 'optimizing' ? 4 : 2, state === 'optimizing' ? 1 : 0.5],
                      opacity: [0.7, 0],
                      rotate: [i * 45, i * 45 + 360],
                    }}
                    transition={{
                      duration: state === 'optimizing' ? 1.5 : 2.5,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: 'easeOut',
                    }}
                    style={{ transformOrigin: '50px 50px' }}
                  />
                ))}
              </g>
            </svg>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="flex items-center justify-center rounded-full backdrop-blur-sm"
              style={{
                width: size === 'sm' ? 40 : size === 'md' ? 56 : size === 'lg' ? 88 : 112,
                height: size === 'sm' ? 40 : size === 'md' ? 56 : size === 'lg' ? 88 : 112,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: `1px solid ${colors.light}30`,
              }}
            >
              <svg
                style={{
                  width: size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 36 : 48,
                  height: size === 'sm' ? 20 : size === 'md' ? 28 : size === 'lg' ? 36 : 48,
                  color: colors.main,
                }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStateIcon(config.icon)} />
              </svg>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showLabel && (
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-medium text-surface-900 dark:text-surface-100">
              {config.label}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 max-w-xs">
              {config.description}
            </p>
            {showProgress && progress > 0 && (
              <motion.div
                className="mt-3 w-48 h-1.5 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.main }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function getStateIcon(name: string): string {
  const icons: Record<string, string> = {
    sparkles: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    brain: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.734-.988-2.386l-.548-.547z',
    'sliders-horizontal': 'M4 6h16M4 12h16M4 18h16M8 6v0m0 6v0m0 6v0',
    'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'refresh-cw': 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    'alert-circle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  };
  return icons[name] || icons.sparkles;
}

export function AgentOrbMini({ state, className }: { state: AgentState; className?: string }) {
  return <AgentOrb state={state} size="sm" showLabel={false} className={className} />;
}
