import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, XCircleIcon, InfoIcon, XIcon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2Icon className="h-4 w-4 text-emerald-400 shrink-0" />,
  error: <XCircleIcon className="h-4 w-4 text-red-400 shrink-0" />,
  info: <InfoIcon className="h-4 w-4 text-blue-400 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/10',
  error: 'border-red-500/20 bg-red-500/10',
  info: 'border-blue-500/20 bg-blue-500/10',
};

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-panel backdrop-blur-sm min-w-[280px] max-w-sm ${STYLES[toast.type]}`}
    >
      {ICONS[toast.type]}
      <p className="flex-1 text-sm text-content leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-content-faint hover:text-content transition-colors"
        aria-label="Dismiss"
      >
        <XIcon className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Global toast hook helper
let _addToast: ((msg: string, type: ToastType) => void) | null = null;

export function registerToastFn(fn: (msg: string, type: ToastType) => void) {
  _addToast = fn;
}

export function showToast(msg: string, type: ToastType = 'info') {
  if (_addToast) _addToast(msg, type);
}
