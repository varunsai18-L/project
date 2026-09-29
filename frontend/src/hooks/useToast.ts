import { create } from 'zustand';
import { generateId } from '@/utils/helpers';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string | { title: string; description?: string; type?: Toast['type'] }) {
  if (typeof message === 'string') {
    useToast.getState().addToast({ type: 'info', title: message });
  } else {
    useToast.getState().addToast({ type: message.type || 'info', title: message.title, description: message.description });
  }
}

toast.success = (title: string, description?: string) => 
  useToast.getState().addToast({ type: 'success', title, description });

toast.error = (title: string, description?: string) => 
  useToast.getState().addToast({ type: 'error', title, description });

toast.warning = (title: string, description?: string) => 
  useToast.getState().addToast({ type: 'warning', title, description });

toast.info = (title: string, description?: string) => 
  useToast.getState().addToast({ type: 'info', title, description });