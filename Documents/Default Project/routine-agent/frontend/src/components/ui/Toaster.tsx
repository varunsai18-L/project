'use client';

import { useToast } from '@/hooks/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helpers';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-96">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </AnimatePresence>
  );
}

interface ToastProps {
  toast: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  };
}

function Toast({ toast }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'border-success-500 bg-success-50 dark:bg-success-500/10',
    error: 'border-danger-500 bg-danger-50 dark:bg-danger-500/10',
    warning: 'border-warning-500 bg-warning-50 dark:bg-warning-500/10',
    info: 'border-brand-500 bg-brand-50 dark:bg-brand-500/10',
  };

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border shadow-strong backdrop-blur-sm',
        colors[toast.type]
      )}
    >
      <div className={cn('flex-shrink-0 w-5 h-5 mt-0.5', {
        'text-success-500': toast.type === 'success',
        'text-danger-500': toast.type === 'error',
        'text-warning-500': toast.type === 'warning',
        'text-brand-500': toast.type === 'info',
      })}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-surface-900 dark:text-surface-100">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        className="flex-shrink-0 p-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
        onClick={() => {}}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}