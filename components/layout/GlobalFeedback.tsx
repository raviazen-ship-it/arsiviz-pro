'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function GlobalFeedback() {
  const toasts = useUIStore((s) => s.toasts);
  const dismissToast = useUIStore((s) => s.dismissToast);
  const confirmDialog = useUIStore((s) => s.confirmDialog);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  return (
    <>
      {/* Accessible Toast Stack */}
      <div
        aria-live="polite"
        className="no-print pointer-events-none fixed bottom-20 lg:bottom-5 right-3 z-[60] flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => {
          const icon =
            t.variant === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-studio-sage" />
            ) : t.variant === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            ) : t.variant === 'warning' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <Info className="h-4 w-4 shrink-0 text-studio-accent" />
            );

          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-studio-borderStrong bg-studio-elevated px-3.5 py-2.5 text-xs font-medium text-studio-text shadow-modal"
            >
              {icon}
              <span className="flex-1 leading-relaxed">{t.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Accessible Confirmation Dialog (No browser alert/confirm) */}
      {confirmDialog && (
        <div
          className="no-print fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4"
          onClick={closeConfirm}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-studio-border bg-studio-elevated p-5 shadow-modal"
          >
            <h3 id="confirm-dialog-title" className="text-sm font-semibold text-studio-text">
              {confirmDialog.title}
            </h3>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-xs leading-relaxed text-studio-subtext"
            >
              {confirmDialog.description}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeConfirm}
                className="min-h-[40px] rounded-md border border-studio-border px-3.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
              >
                {confirmDialog.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className={`min-h-[40px] rounded-md px-3.5 py-1.5 text-xs font-semibold ${
                  confirmDialog.destructive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-studio-accent text-studio-accentText hover:bg-studio-accentHover'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
