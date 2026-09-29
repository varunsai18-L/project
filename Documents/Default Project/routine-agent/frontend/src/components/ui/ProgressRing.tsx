'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
  animate?: boolean;
}

const RING_COLORS: Record<string, string> = {
  brand: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  accent: '#d946ef',
};

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
  showPercentage = true,
  className,
  color = 'brand',
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const strokeColor = RING_COLORS[color] || RING_COLORS.brand;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`pr-${color}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <circle
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-surface-200 dark:text-surface-800"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#pr-${color}-${size})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? offset : circumference }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-surface-900 dark:text-surface-100" style={{ fontSize: size * 0.22 }}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'accent';
  animate?: boolean;
}

export function ProgressBar({
  progress,
  height = 8,
  showLabel = false,
  label,
  className,
  color = 'brand',
  animate = true,
}: ProgressBarProps) {
  const barColor = RING_COLORS[color] || RING_COLORS.brand;

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{label || `${Math.round(progress)}%`}</span>
          {showLabel && <span className="text-sm text-surface-500 dark:text-surface-400 font-mono">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="relative rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden" style={{ height }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: animate ? 0.8 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
