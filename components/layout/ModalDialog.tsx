'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function ModalDialog({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-4xl',
  children,
}: ModalDialogProps) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-modal-title"
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[88dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-elevated shadow-modal`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-studio-border px-4 py-3.5 sm:px-6">
              <div>
                <h2
                  id="studio-modal-title"
                  className="text-sm sm:text-base font-semibold text-studio-text"
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-studio-subtext">{subtitle}</p>
                )}
              </div>

              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-md text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="studio-scroll flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
