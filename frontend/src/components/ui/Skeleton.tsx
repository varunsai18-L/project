'use client';

import { cn } from '@/utils/helpers';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ variant = 'text', width, height, lines, className, ...props }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('space-y-4', className)} {...props}>
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" width="60%" height={16} />
            <Skeleton variant="text" width="40%" height={12} />
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-surface-200 dark:border-surface-800">
          {[...Array(lines || 3)].map((_, i) => (
            <Skeleton key={i} variant="text" width={i === (lines || 3) - 1 ? '70%' : '100%'} height={14} />
          ))}
        </div>
      </div>
    );
  }

  const baseStyles = 'animate-pulse bg-surface-200 dark:bg-surface-800 rounded';
  
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '70%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: { className?: string }) {
  return <Skeleton variant="card" className={cn('p-6', className)} {...props} />;
}

export function SkeletonTable({ rows = 5, columns = 4, className, ...props }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="flex gap-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={16} />
        ))}
      </div>
      {[...Array(rows)].map((_, row) => (
        <div key={row} className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}