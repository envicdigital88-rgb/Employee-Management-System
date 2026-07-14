import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md'






}: {open: boolean;onClose: () => void;title: string;children: React.ReactNode;size?: 'md' | 'lg';}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{
            opacity: 0,
            scale: 0.96,
            y: 12
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.96,
            y: 12
          }}
          transition={{
            duration: 0.2
          }}
          className={`relative z-10 w-full ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'} rounded-2xl border border-line bg-surface shadow-panel`}>
          
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-content">{title}</h2>
              <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-content-muted transition-colors hover:bg-white/5 hover:text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close dialog">
              
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}