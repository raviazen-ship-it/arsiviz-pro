'use client';

import React from 'react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import { getCopy } from '@/lib/i18n';
import { useUIStore } from '@/store/useUIStore';

export function OnboardingModal() {
  const showOnboarding = useUIStore((s) => s.showOnboarding);
  const dismissOnboarding = useUIStore((s) => s.dismissOnboarding);
  const language = useUIStore((s) => s.language);

  const copy = getCopy(language);

  return (
    <ModalDialog
      open={showOnboarding}
      onClose={dismissOnboarding}
      title={copy.onboarding.title}
      subtitle={copy.onboarding.subtitle}
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {copy.onboarding.steps.map((step) => (
            <div
              key={step.title}
              className="rounded-lg border border-studio-border bg-studio-muted/45 p-3"
            >
              <h3 className="text-xs font-semibold text-studio-text">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-studio-subtext">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={dismissOnboarding}
            className="min-h-[42px] rounded-md bg-studio-accent px-5 py-2 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover"
          >
            {copy.onboarding.startBtn}
          </button>
        </div>
      </div>
    </ModalDialog>
  );
}
