import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { AGENT_STATE_CONFIG, type AgentState } from '@/types/agent';

interface AgentCompanionProps {
  state: AgentState;
  size?: number;
  className?: string;
  showHalo?: boolean;
}

const HUE: Record<string, { a: string; b: string; glow: string }> = {
  brand: { a: '#6fe7ff', b: '#06bdff', glow: 'rgba(6,189,255,0.65)' },
  accent: { a: '#bdb0ff', b: '#7c56ff', glow: 'rgba(124,86,255,0.6)' },
  success: { a: '#6ee7a8', b: '#22c55e', glow: 'rgba(34,197,94,0.6)' },
  warning: { a: '#ffc27d', b: '#ff7d16', glow: 'rgba(255,125,22,0.6)' },
  danger: { a: '#ff9d9d', b: '#f45b5b', glow: 'rgba(244,91,91,0.6)' },
};

const HEAD =
  'M100 42 C72 42 55 62 55 90 C55 106 60 120 69 130 L64 148 C63 154 67 159 74 159 L126 159 C133 159 137 154 136 148 L131 130 C140 120 145 106 145 90 C145 62 128 42 100 42 Z';
const PLATE =
  'M100 53 C79 53 66 69 66 90 C66 104 70 116 77 124 L123 124 C130 116 134 104 134 90 C134 69 121 53 100 53 Z';
const SHOULDERS =
  'M46 200 C50 178 68 162 100 162 C132 162 150 178 154 200 Z';

const MOTION: Partial<Record<AgentState, { y: number; scale: number }>> = {
  idle: { y: 0, scale: 1 },
  understanding: { y: -3, scale: 1.01 },
  planning: { y: -4, scale: 1.02 },
  optimizing: { y: -5, scale: 1.03 },
  ready: { y: -3, scale: 1.02 },
  replanning: { y: -4, scale: 1.02 },
  adapting: { y: -4, scale: 1.02 },
  needs_approval: { y: -2, scale: 1.01 },
  error: { y: 0, scale: 1 },
};

/**
 * Original RoutineOS AI companion — a holographic training coach.
 * Stylised mask + visor built from plain SVG geometry. Reacts to agent state.
 */
export function AgentCompanion({
  state,
  size = 240,
  className,
  showHalo = true,
}: AgentCompanionProps) {
  const config = AGENT_STATE_CONFIG[state];
  const hue = HUE[config.color] || HUE.brand;
  const uid = `c-${state}`;
  const busy = !['idle', 'ready', 'error'].includes(state);
  const m = MOTION[state] || MOTION.idle!;

  return (
    <motion.div
      className={cn('relative select-none', className)}
      style={{ width: size, height: size }}
      animate={{ y: m.y, scale: m.scale }}
      transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
      aria-hidden="true"
    >
      {/* atmospheric bloom */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-40"
        style={{ background: `radial-gradient(circle at 50% 45%, ${hue.glow}, transparent 62%)` }}
      />

      <svg viewBox="0 0 200 200" className="relative w-full h-full">
        <defs>
          <linearGradient id={`h-${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor={hue.a} />
            <stop offset="100%" stopColor={hue.b} />
          </linearGradient>
          <linearGradient id={`p-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#131a24" />
            <stop offset="100%" stopColor="#0a0e14" />
          </linearGradient>
          <linearGradient id={`s-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hue.a} stopOpacity="0" />
            <stop offset="50%" stopColor={hue.a} stopOpacity="0.85" />
            <stop offset="100%" stopColor={hue.a} stopOpacity="0" />
          </linearGradient>
          <filter id={`f-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`clip-${uid}`}>
            <path d={HEAD} />
          </clipPath>
        </defs>

        {showHalo && (
          <g>
            <circle
              cx="100"
              cy="100"
              r="93"
              fill="none"
              stroke={`url(#h-${uid})`}
              strokeWidth="1"
              strokeDasharray="3 9"
              opacity="0.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur="46s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke={hue.b}
              strokeWidth="0.8"
              opacity="0.25"
            />
            <circle
              cx="100"
              cy="100"
              r="93"
              fill="none"
              stroke={hue.b}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="28 560"
              opacity="0.9"
              filter={`url(#f-${uid})`}
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 100 100"
                to="360 100 100"
                dur={busy ? '6s' : '24s'}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* shoulders / chassis */}
        <path
          d={SHOULDERS}
          fill={`url(#p-${uid})`}
          stroke={`url(#h-${uid})`}
          strokeWidth="1.6"
          opacity="0.95"
        />
        <path d="M76 200 L86 174 M124 200 L114 174" stroke={hue.b} strokeWidth="1" opacity="0.35" />

        {/* head shell */}
        <path
          d={HEAD}
          fill={`url(#p-${uid})`}
          stroke={`url(#h-${uid})`}
          strokeWidth="2"
          filter={`url(#f-${uid})`}
        />
        <path d={PLATE} fill="#05070b" opacity="0.75" stroke={hue.b} strokeWidth="0.7" />

        {/* scanning sweep */}
        <g clipPath={`url(#clip-${uid})`}>
          <rect x="55" y="0" width="90" height="12" fill={`url(#s-${uid})`} opacity="0.75">
            <animate
              attributeName="y"
              values="38;150;38"
              dur={busy ? '3.2s' : '6.4s'}
              repeatCount="indefinite"
            />
          </rect>
        </g>

        {/* visor */}
        <rect x="70" y="87" width="60" height="19" rx="9.5" fill="#05070b" stroke={`url(#h-${uid})`} strokeWidth="1.4" />
        <rect x="70" y="87" width="60" height="19" rx="9.5" fill={hue.b} opacity="0.16" />
        <g filter={`url(#f-${uid})`}>
          <rect x="78" y="93" width="15" height="7" rx="3.5" fill={hue.a}>
            <animate attributeName="opacity" values="1;1;0.15;1" keyTimes="0;0.9;0.95;1" dur="4.4s" repeatCount="indefinite" />
          </rect>
          <rect x="107" y="93" width="15" height="7" rx="3.5" fill={hue.a}>
            <animate attributeName="opacity" values="1;1;0.15;1" keyTimes="0;0.9;0.95;1" dur="4.4s" repeatCount="indefinite" />
          </rect>
        </g>

        {/* forehead progression mark */}
        <path
          d="M92 72 L100 64 L108 72"
          fill="none"
          stroke={hue.a}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* discipline ticks */}
        <path
          d="M77 116 H92 M108 116 H123"
          stroke={hue.b}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* jaw vents */}
        <g stroke={hue.b} strokeWidth="1.4" strokeLinecap="round" opacity="0.55">
          <path d="M92 138 H108" />
          <path d="M95 145 H105" />
        </g>

        {/* side sensor */}
        <circle cx="145" cy="96" r="3" fill={hue.a} filter={`url(#f-${uid})`}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur={busy ? '1.1s' : '3s'} repeatCount="indefinite" />
        </circle>
      </svg>
    </motion.div>
  );
}
