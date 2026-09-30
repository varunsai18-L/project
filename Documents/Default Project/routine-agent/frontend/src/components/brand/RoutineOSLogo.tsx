import { cn } from '@/utils/helpers';

interface MarkProps {
  className?: string;
  /** unique suffix so multiple instances never collide on gradient ids */
  uid?: string;
  title?: string;
  size?: number;
}

/**
 * RoutineOS mark — AI core + orbit/time cycle + spark + progression node.
 * Original artwork. Works from 16px favicon up to 64px sidebar.
 */
export function RoutineOSMark({ className, uid = 'a', title, size }: MarkProps) {
  const g = `ro-g-${uid}`;
  const e = `ro-e-${uid}`;
  const core = `ro-c-${uid}`;

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('block', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id={g} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#6fe7ff" />
          <stop offset="45%" stopColor="#06bdff" />
          <stop offset="100%" stopColor="#7c56ff" />
        </linearGradient>
        <linearGradient id={e} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc27d" />
          <stop offset="100%" stopColor="#ff7d16" />
        </linearGradient>
        <radialGradient id={core} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#6fe7ff" />
          <stop offset="55%" stopColor="#06bdff" />
          <stop offset="100%" stopColor="#7c56ff" />
        </radialGradient>
      </defs>

      {/* time-cycle orbit */}
      <ellipse
        cx="16"
        cy="16"
        rx="12.5"
        ry="6.25"
        transform="rotate(-28 16 16)"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="2.1"
        opacity="0.9"
      />

      {/* progression node on the cycle */}
      <circle cx="27.04" cy="10.13" r="2.7" fill={`url(#${e})`} />
      <circle cx="4.96" cy="21.87" r="1.7" fill={`url(#${g})`} opacity="0.55" />

      {/* AI core */}
      <circle cx="16" cy="16" r="6.3" fill="none" stroke={`url(#${g})`} strokeWidth="3" />
      <circle cx="16" cy="16" r="2.4" fill={`url(#${core})`} />

      {/* spark */}
      <path
        d="M9 4 C9.63 6.23 10.23 6.87 12.5 7.5 C10.23 8.13 9.63 8.77 9 11 C8.37 8.77 7.77 8.13 5.5 7.5 C7.77 6.87 8.37 6.23 9 4 Z"
        fill="#ffffff"
        opacity="0.95"
      />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  size?: number;
  /** hide the wordmark (sidebar collapsed / tight spaces) */
  markOnly?: boolean;
  uid?: string;
  title?: string;
}

/**
 * Full RoutineOS lockup: mark + wordmark.
 */
export function RoutineOSLogo({
  className,
  size = 28,
  markOnly = false,
  uid = 'a',
  title = 'RoutineOS',
}: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <RoutineOSMark uid={uid} title={title} size={size} className="shrink-0" />
      {!markOnly && (
        <span
          className="font-display font-bold tracking-tight leading-none text-surface-900 dark:text-white"
          style={{ fontSize: size * 0.62 }}
        >
          Routine
          <span className="text-brand-500">OS</span>
        </span>
      )}
    </span>
  );
}

/**
 * Inline SVG favicon source (used by index.html as a data URI).
 * Kept here as the single source of truth for the mark's geometry.
 */
export const ROUTINEOS_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="10%" y1="0%" x2="90%" y2="100%"><stop offset="0%" stop-color="#6fe7ff"/><stop offset="45%" stop-color="#06bdff"/><stop offset="100%" stop-color="#7c56ff"/></linearGradient><linearGradient id="e" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffc27d"/><stop offset="100%" stop-color="#ff7d16"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="#06090e"/><ellipse cx="16" cy="16" rx="12.5" ry="6.25" transform="rotate(-28 16 16)" fill="none" stroke="url(#g)" stroke-width="2.1"/><circle cx="27.04" cy="10.13" r="2.7" fill="url(#e)"/><circle cx="16" cy="16" r="6.3" fill="none" stroke="url(#g)" stroke-width="3"/><circle cx="16" cy="16" r="2.4" fill="url(#g)"/><path d="M9 4 C9.63 6.23 10.23 6.87 12.5 7.5 C10.23 8.13 9.63 8.77 9 11 C8.37 8.77 7.77 8.13 5.5 7.5 C7.77 6.87 8.37 6.23 9 4 Z" fill="#fff"/></svg>`;
