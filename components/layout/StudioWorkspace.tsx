'use client';

import React, { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { BookingModal } from '@/components/booking/BookingModal';
import { CatalogModal } from '@/components/configurator/CatalogModal';
import { TimelineDock } from '@/components/construction/TimelineDock';
import { FAQModal } from '@/components/faq/FAQModal';
import { FinanceModal } from '@/components/finance/FinanceModal';
import { PrintRABModal } from '@/components/finance/PrintRABModal';
import { GlobalFeedback } from '@/components/layout/GlobalFeedback';
import { OnboardingModal } from '@/components/layout/OnboardingModal';
import { StudioHeader } from '@/components/layout/StudioHeader';
import { StudioSidebars } from '@/components/layout/StudioSidebars';
import { CompareModal } from '@/components/projects/CompareModal';
import { StudioViewport } from '@/components/viewport/StudioViewport';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

export function StudioWorkspace() {
  const hydratePreferences = useUIStore((s) => s.hydratePreferences);
  const language = useUIStore((s) => s.language);
  const addToast = useUIStore((s) => s.addToast);

  const hydrateProject = useProjectStore((s) => s.hydrate);

  // Hydrate persisted UI preferences and project state on client mount
  useEffect(() => {
    hydratePreferences();
    const initialLang = useUIStore.getState().language;
    hydrateProject(initialLang);

    const warning = useProjectStore.getState().storageWarning;
    if (warning) {
      useUIStore.getState().addToast('warning', warning);
    }
  }, [hydratePreferences, hydrateProject]);

  // Keep <html lang="..."> synchronized with active bilingual state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Global Studio keyboard shortcuts (Save, Undo/Redo, Escape dismissal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const uiState = useUIStore.getState();
      const projState = useProjectStore.getState();
      const lang = uiState.language;

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName ?? '';
      const isEditableField =
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        Boolean(target?.isContentEditable);

      // Ctrl/Cmd + S -> Save active project
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const thumb = uiState.snapshotProvider ? uiState.snapshotProvider() : undefined;
        const res = projState.saveCurrentProject(lang, thumb);
        if (res.ok) {
          addToast(
            'success',
            lang === 'id'
              ? `Proyek "${projState.project.name}" tersimpan di perangkat ini.`
              : `Project "${projState.project.name}" saved to this device.`
          );
        } else {
          addToast(
            'error',
            res.error || (lang === 'id' ? 'Gagal menyimpan proyek.' : 'Failed to save project.')
          );
        }
        return;
      }

      // Ctrl/Cmd + Z / Y -> Undo / Redo when not typing inside an input
      if (!isEditableField && (e.ctrlKey || e.metaKey) && !uiState.activeModal) {
        if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
          e.preventDefault();
          projState.undo();
          return;
        }
        if (
          e.key.toLowerCase() === 'y' ||
          (e.key.toLowerCase() === 'z' && e.shiftKey)
        ) {
          e.preventDefault();
          projState.redo();
          return;
        }
      }

      // Escape -> Dismiss topmost surface in priority order
      if (e.key === 'Escape') {
        if (uiState.confirmDialog) {
          uiState.closeConfirm();
          return;
        }
        if (uiState.showOnboarding) {
          uiState.dismissOnboarding();
          return;
        }
        if (uiState.activeModal) {
          uiState.closeModal();
          return;
        }
        if (uiState.mobileSheet) {
          uiState.setMobileSheet(null);
          return;
        }
        if (uiState.selectedElement) {
          uiState.setSelectedElement(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToast]);

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-studio-bg text-studio-text print:h-auto print:w-full print:max-w-none print:overflow-visible">
        <h1 className="sr-only">
          {language === 'id'
            ? 'ArsiViz Pro Studio - Konfigurator Arsitektur 3D, Tahapan Konstruksi, dan Estimasi RAB'
            : 'ArsiViz Pro Studio - 3D Architecture Configurator, Construction Stages, and Budget Estimator'}
        </h1>
        {/* Full-screen 3D / 2D Schematic Canvas Layer */}
        <div className="no-print absolute inset-0">
          <StudioViewport />
        </div>

        {/* Floating Architectural Studio HUD */}
        <StudioHeader />
        <StudioSidebars />
        <TimelineDock />

        {/* Structured Modals & Print View */}
        <CatalogModal />
        <FinanceModal />
        <PrintRABModal />
        <CompareModal />
        <BookingModal />
        <FAQModal />
        <OnboardingModal />

        {/* Accessible Toasts & Confirmation Dialog */}
        <GlobalFeedback />
      </main>
    </MotionConfig>
  );
}
