'use client';

import React from 'react';
import {
  Calculator,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  Layers,
  Paintbrush,
  PanelLeftOpen,
  PanelRightOpen,
  PlusSquare,
  Ruler,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ConfiguratorTabs } from '@/components/configurator/ConfiguratorTabs';
import { TechnicalSummaryPanel } from '@/components/configurator/TechnicalSummaryPanel';
import { StageEducationPanel } from '@/components/construction/StageEducationPanel';
import { ProjectManagerPanel } from '@/components/projects/ProjectManagerPanel';
import { getCopy } from '@/lib/i18n';
import { LeftSidebarTab, RightSidebarTab, useUIStore } from '@/store/useUIStore';

export function StudioSidebars() {
  const language = useUIStore((s) => s.language);
  const leftOpen = useUIStore((s) => s.leftSidebarOpen);
  const leftTab = useUIStore((s) => s.leftTab);
  const setLeftSidebar = useUIStore((s) => s.setLeftSidebar);

  const rightOpen = useUIStore((s) => s.rightSidebarOpen);
  const rightTab = useUIStore((s) => s.rightTab);
  const setRightSidebar = useUIStore((s) => s.setRightSidebar);

  const mobileSheet = useUIStore((s) => s.mobileSheet);
  const setMobileSheet = useUIStore((s) => s.setMobileSheet);
  const openModal = useUIStore((s) => s.openModal);

  const copy = getCopy(language);

  const leftTabs: Array<{ id: LeftSidebarTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'project',
      label: copy.leftSidebar.tabProject,
      icon: <FolderKanban className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'stage',
      label: copy.leftSidebar.tabStage,
      icon: <Layers className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'technical',
      label: copy.leftSidebar.tabTechnical,
      icon: <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
  ];

  const rightTabs: Array<{ id: RightSidebarTab; label: string; icon: React.ReactNode }> = [
    {
      id: 'type',
      label: copy.rightSidebar.tabType,
      icon: <Home className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'material',
      label: copy.rightSidebar.tabMaterial,
      icon: <Paintbrush className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'addons',
      label: copy.rightSidebar.tabAddons,
      icon: <PlusSquare className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'dimensions',
      label: copy.rightSidebar.tabDimensions,
      icon: <Ruler className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
  ];

  const renderLeftContent = () => {
    if (leftTab === 'project') return <ProjectManagerPanel />;
    if (leftTab === 'stage') return <StageEducationPanel />;
    return <TechnicalSummaryPanel />;
  };

  return (
    <>
      {/* =========================================================
          DESKTOP LEFT SIDEBAR (lg+)
         ========================================================= */}
      <div className="no-print hidden lg:block">
        {!leftOpen ? (
          <button
            type="button"
            onClick={() => setLeftSidebar(true)}
            title={copy.leftSidebar.toggleOpen}
            aria-label={copy.leftSidebar.toggleOpen}
            className="fixed left-3 top-16 z-20 inline-flex items-center gap-1.5 rounded-lg border border-studio-border bg-studio-surface px-3 py-2 text-xs font-medium text-studio-text shadow-panel backdrop-blur-md hover:bg-studio-elevated"
          >
            <PanelLeftOpen className="h-4 w-4 text-studio-accent" strokeWidth={1.7} />
            <span>{copy.leftSidebar.tabStage}</span>
          </button>
        ) : (
          <aside
            aria-label={language === 'id' ? 'Panel Proyek dan Tahap' : 'Project and Stage Panel'}
            className="fixed bottom-4 left-3 top-16 z-20 flex w-[17.25rem] xl:w-80 flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-surface shadow-panel backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-1 border-b border-studio-border p-1.5">
              <div className="grid flex-1 grid-cols-3 gap-1" role="tablist">
                {leftTabs.map((t) => {
                  const active = leftTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setLeftSidebar(true, t.id)}
                      className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'bg-studio-elevated text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                          : 'text-studio-subtext hover:text-studio-text'
                      }`}
                    >
                      {t.icon}
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setLeftSidebar(false)}
                title={copy.leftSidebar.toggleClose}
                aria-label={copy.leftSidebar.toggleClose}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="studio-scroll flex-1 overflow-y-auto p-3">
              {renderLeftContent()}
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================
          DESKTOP RIGHT SIDEBAR (lg+)
         ========================================================= */}
      <div className="no-print hidden lg:block">
        {!rightOpen ? (
          <button
            type="button"
            onClick={() => setRightSidebar(true)}
            title={copy.rightSidebar.toggleOpen}
            aria-label={copy.rightSidebar.toggleOpen}
            className="fixed right-3 top-16 z-20 inline-flex items-center gap-1.5 rounded-lg border border-studio-border bg-studio-surface px-3 py-2 text-xs font-medium text-studio-text shadow-panel backdrop-blur-md hover:bg-studio-elevated"
          >
            <span>{copy.rightSidebar.tabMaterial}</span>
            <PanelRightOpen className="h-4 w-4 text-studio-accent" strokeWidth={1.7} />
          </button>
        ) : (
          <aside
            aria-label={language === 'id' ? 'Panel Konfigurator Rumah' : 'House Configurator Panel'}
            className="fixed bottom-4 right-3 top-16 z-20 flex w-[17.25rem] xl:w-80 flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-surface shadow-panel backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-1 border-b border-studio-border p-1.5">
              <button
                type="button"
                onClick={() => setRightSidebar(false)}
                title={copy.rightSidebar.toggleClose}
                aria-label={copy.rightSidebar.toggleClose}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="grid flex-1 grid-cols-4 gap-0.5" role="tablist">
                {rightTabs.map((t) => {
                  const active = rightTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setRightSidebar(true, t.id)}
                      title={t.label}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[10px] font-medium transition-colors ${
                        active
                          ? 'bg-studio-elevated text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                          : 'text-studio-subtext hover:text-studio-text'
                      }`}
                    >
                      {t.icon}
                      <span className="w-full truncate text-center">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="studio-scroll flex-1 overflow-y-auto p-3">
              <ConfiguratorTabs activeTab={rightTab} />
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================
          MOBILE & TABLET BOTTOM ACTION BAR (< 1024px)
          Ensures minimum 44x44px tap targets and prevents dual sidebars
         ========================================================= */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-studio-border bg-studio-elevated px-2 py-1 lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setMobileSheet(mobileSheet === 'left' ? null : 'left')}
            aria-expanded={mobileSheet === 'left'}
            className={`flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium ${
              mobileSheet === 'left'
                ? 'bg-studio-accent text-studio-accentText'
                : 'text-studio-text hover:bg-studio-muted'
            }`}
          >
            <Layers className="h-4 w-4" strokeWidth={1.7} />
            <span>{language === 'id' ? 'Proyek/Tahap' : 'Stages'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSheet(mobileSheet === 'right' ? null : 'right')}
            aria-expanded={mobileSheet === 'right'}
            className={`flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium ${
              mobileSheet === 'right'
                ? 'bg-studio-accent text-studio-accentText'
                : 'text-studio-text hover:bg-studio-muted'
            }`}
          >
            <Paintbrush className="h-4 w-4" strokeWidth={1.7} />
            <span>{language === 'id' ? 'Konfigurasi' : 'Configure'}</span>
          </button>

          <button
            type="button"
            onClick={() => openModal('finance', 'rab')}
            className="flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium text-studio-text hover:bg-studio-muted"
          >
            <Calculator className="h-4 w-4" strokeWidth={1.7} />
            <span>RAB & KPR</span>
          </button>

          <button
            type="button"
            onClick={() => openModal('booking')}
            className="flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium text-studio-text hover:bg-studio-muted"
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={1.7} />
            <span>{language === 'id' ? 'Konsultasi' : 'Consult'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE / TABLET DRAWER SHEET (< 1024px)
         ========================================================= */}
      {(mobileSheet === 'left' || mobileSheet === 'right') && (
        <div
          className="no-print fixed inset-0 z-40 flex flex-col justify-end bg-black/40 lg:hidden"
          onClick={() => setMobileSheet(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              mobileSheet === 'left'
                ? copy.leftSidebar.toggleOpen
                : copy.rightSidebar.toggleOpen
            }
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[78dvh] flex-col rounded-t-2xl border-t border-studio-border bg-studio-elevated shadow-modal"
          >
            <div className="flex items-center justify-between border-b border-studio-border px-3 py-2">
              {mobileSheet === 'left' ? (
                <div className="flex flex-1 gap-1 pr-2">
                  {leftTabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLeftSidebar(true, t.id)}
                      className={`min-h-[44px] flex-1 rounded-md px-2 text-xs font-semibold ${
                        leftTab === t.id
                          ? 'bg-studio-accent text-studio-accentText'
                          : 'bg-studio-muted text-studio-text'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid flex-1 grid-cols-4 gap-1 pr-2">
                  {rightTabs.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRightSidebar(true, t.id)}
                      className={`min-h-[44px] rounded-md px-1.5 text-xs font-semibold ${
                        rightTab === t.id
                          ? 'bg-studio-accent text-studio-accentText'
                          : 'bg-studio-muted text-studio-text'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                aria-label={language === 'id' ? 'Tutup panel' : 'Close sheet'}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-studio-text hover:bg-studio-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="studio-scroll flex-1 overflow-y-auto p-4 pb-8">
              {mobileSheet === 'left' ? (
                renderLeftContent()
              ) : (
                <ConfiguratorTabs activeTab={rightTab} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
