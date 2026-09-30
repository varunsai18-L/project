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
  brand:   { main: '#06bdff', light: '#6fe7ff', dark: '#0878b0', glow: 'rgba(6,189,255,0.55)' },
  accent:  { main: '#7c56ff', light: '#bdb0ff', dark: '#4b22b8', glow: 'rgba(124,86,255,0.5)' },
  success: { main: '#22c55e', light: '#6ee7a8', dark: '#16a34a', glow: 'rgba(34,197,94,0.5)' },
  warning: { main: '#ff7d16', light: '#ffc27d', dark: '#c74908', glow: 'rgba(255,125,22,0.5)' },
  danger:  { main: '#f45b5b', light: '#ff9d9d', dark: '#dc2626', glow: 'rgba(244,91,91,0.5)' },
};

const ORB_ANIMATIONS: Record<string, Record<string, unknown>> = {
  idle: {
    scale: [1, 1.02, 1],
    rotate: [0, 0, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  understanding: {
    scale: [1, 1.05, 1],
    rotate: [0, 8, 0],
    transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
  },
  planning: {
    scale: [1, 1.07, 1],
    rotate: [0, -10, 0],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
  optimizing: {
    scale: [1, 1.1, 0.96, 1],
    rotate: [0, 12, -6, 0],
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
  ready: {
    scale: [1, 1.04, 1],
    rotate: 0,
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  replanning: {
    scale: [1, 1.06, 1],
    rotate: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  adapting: {
    scale: [1, 1.06, 1],
    rotate: [0, -8, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  needs_approval: {
    scale: [1, 1.04, 1],
    rotate: [0, 4, -4, 0],
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  error: {
    scale: [1, 1.02, 1],
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

const ORBIT_SPEED: Record<string, string> = {
  idle: '26s',
  understanding: '7s',
  planning: '5s',
  optimizing: '3.6s',
  ready: '16s',
  replanning: '4.5s',
  adapting: '4.5s',
  needs_approval: '6s',
  error: '6s',
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
  const busy = !['idle', 'ready', 'error'].includes(state);
  const dur = ORBIT_SPEED[state] || '12s';
  const gid = `core-${state}`;
  const rid = `ring-${state}`;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: SIZE_CLASSES[size], height: SIZE_CLASSES[size] }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            className="absolute inset-0"
            animate={ORB_ANIMATIONS[state] || ORB_ANIMATIONS.idle}
            initial={false}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <radialGradient id={`b-${gid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={colors.main} stopOpacity="0.55" />
                  <stop offset="55%" stopColor={colors.main} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={colors.main} stopOpacity="0" />
                </radialGradient>
                <radialGradient id={gid} cx="34%" cy="28%" r="78%">
                  <stop offset="0%" stopColor={colors.light} />
                  <stop offset="45%" stopColor={colors.main} />
                  <stop offset="100%" stopColor={colors.dark} />
                </radialGradient>
                <linearGradient id={rid} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.light} />
                  <stop offset="55%" stopColor={colors.main} />
                  <stop offset="100%" stopColor="#7c56ff" />
                </linearGradient>
                <filter id={`f-${gid}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="2.6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* bloom */}
              <circle cx="50" cy="50" r="48" fill={`url(#b-${gid})`} />

              {/* orbit 1 — time cycle */}
              <g style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur={dur}
                  repeatCount="indefinite"
                />
                <ellipse
                  cx="50" cy="50" rx="43" ry="17"
                  transform="rotate(-28 50 50)"
                  fill="none" stroke={`url(#${rid})`}
                  strokeWidth="2" opacity="0.95"
                  strokeDasharray="6 4"
                />
                <circle cx="87.8" cy="30" r="3" fill={colors.light} filter={`url(#f-${gid})`} />
              </g>

              {/* orbit 2 — counter rotation */}
              <g style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="360 50 50"
                  to="0 50 50"
                  dur={busy ? `${parseFloat(dur) * 1.6}s` : '38s'}
                  repeatCount="indefinite"
                />
                <ellipse
                  cx="50" cy="50" rx="38" ry="38"
                  fill="none" stroke={colors.main}
                  strokeWidth="0.9" opacity="0.45"
                />
                <ellipse
                  cx="50" cy="50" rx="43" ry="17"
                  transform="rotate(52 50 50)"
                  fill="none" stroke={`url(#${rid})`}
                  strokeWidth="1.3" opacity="0.7"
                />
                <circle cx="14" cy="66" r="2.2" fill={colors.main} opacity="0.9" />
              </g>

              {/* progress ring */}
              {showProgress && progress > 0 && (
                <circle
                  cx="50" cy="50" r="45"
                  stroke={colors.main}
                  strokeWidth="3" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45 * (progress / 100)} ${2 * Math.PI * 45}`}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-700 ease-out"
                  opacity="0.95"
                  filter={`url(#f-${gid})`}
                />
              )}

              {/* ready confirm ring */}
              {state === 'ready' && (
                <circle
                  cx="50" cy="50" r="41"
                  stroke="#22c55e" strokeWidth="2.4" fill="none"
                  strokeLinecap="round"
                  strokeDasharray="258" strokeDashoffset="0"
                  opacity="0.9"
                >
                  <animate attributeName="strokeDashoffset" from="258" to="0" dur="0.8s" fill="freeze" />
                </circle>
              )}

              {/* AI core */}
              <circle
                cx="50" cy="50" r={state === 'idle' ? 20 : state === 'ready' ? 23 : 18}
                fill={`url(#${gid})`}
                filter={`url(#f-${gid})`}
              />
              <circle
                cx="50" cy="50" r={state === 'idle' ? 20 : state === 'ready' ? 23 : 18}
                fill="none"
                stroke={colors.light}
                strokeWidth="0.8"
                opacity="0.7"
              />
              {/* core inner spark */}
              <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.9" />

              {/* spark particles */}
              <g>
                {[...Array(7)].map((_, i) => (
                  <motion.circle
                    key={i}
                    cx="50" cy="50"
                    r={2}
                    fill={colors.light}
                    animate={{
                      r: [busy ? 3.2 : 2, 0.6],
                      opacity: [0.85, 0],
                      rotate: [i * 51.4, i * 51.4 + 360],
                    }}
                    transition={{
                      duration: busy ? 1.6 : 3.2,
                      repeat: Infinity,
                      delay: i * 0.24,
                      ease: 'easeOut',
                    }}
                    style={{ transformOrigin: '50px 50px', transformBox: 'view-box' }}
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
              className="flex items-center justify-center rounded-full backdrop-blur-sm border"
              style={{
                width: size === 'sm' ? 26 : size === 'md' ? 38 : size === 'lg' ? 58 : 74,
                height: size === 'sm' ? 26 : size === 'md' ? 38 : size === 'lg' ? 58 : 74,
                backgroundColor: 'rgba(6,9,14,0.42)',
                borderColor: `${colors.light}55`,
                boxShadow: `0 0 22px -4px ${colors.glow}`,
              }}
            >
              <svg
                style={{
                  width: size === 'sm' ? 14 : size === 'md' ? 20 : size === 'lg' ? 30 : 38,
                  height: size === 'sm' ? 14 : size === 'md' ? 20 : size === 'lg' ? 30 : 38,
                  color: colors.light,
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d={getStateIcon(config.icon)}
                />
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
            <p className="font-display font-semibold text-surface-900 dark:text-surface-100">
              {config.coach}
            </p>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5 max-w-xs">
              {config.label} · {config.description}
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
