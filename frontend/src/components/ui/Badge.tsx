'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', dot = false, className, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300',
      success: 'bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400',
      warning: 'bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400',
      danger: 'bg-danger-100 dark:bg-danger-500/20 text-danger-600 dark:text-danger-400',
      neutral: 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400',
      brand: 'bg-gradient-to-r from-brand-500 to-accent-500 text-white',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-0.5 text-xs gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-brand-500': variant === 'primary' || variant === 'brand',
            'bg-success-500': variant === 'success',
            'bg-warning-500': variant === 'warning',
            'bg-danger-500': variant === 'danger',
            'bg-surface-400': variant === 'neutral',
          })} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export function StatusDot({ 
  status, 
  className, 
  size = 2 
}: { 
  status: 'active' | 'idle' | 'busy' | 'error' | 'success'; 
  className?: string;
  size?: number;
}) {
  const colors = {
    active: 'bg-brand-500',
    idle: 'bg-surface-400',
    busy: 'bg-warning-500',
    error: 'bg-danger-500',
    success: 'bg-success-500',
  };

  const sizes = {
    1: 'w-1.5 h-1.5',
    2: 'w-2 h-2',
    3: 'w-3 h-3',
  };

  return (
    <span
      className={cn(
        'rounded-full',
        colors[status],
        sizes[size as keyof typeof sizes],
        'relative',
        (status === 'active' || status === 'busy') && 'animate-pulse',
        className
      )}
    />
  );
}