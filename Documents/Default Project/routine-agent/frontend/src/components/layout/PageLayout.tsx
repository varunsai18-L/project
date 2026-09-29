'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function PageSection({ children, className, delay = 0 }: PageSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={cn('w-full', className)}
    >
      {children}
    </motion.section>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-display font-bold text-3xl sm:text-4xl text-surface-900 dark:text-surface-100 tracking-tight"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-2 text-lg text-surface-600 dark:text-surface-400 max-w-2xl"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-4"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}

export function CardGrid({ children, columns = 3, gap = 6, className }: CardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      'grid gap-6',
      columnClasses[columns],
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn('font-display font-semibold text-lg text-surface-900 dark:text-surface-100', className)}>
      {children}
    </h2>
  );
}

export function SectionDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-surface-500 dark:text-surface-400', className)}>
      {children}
    </p>
  );
}