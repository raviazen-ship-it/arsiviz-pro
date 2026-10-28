'use client';

import React, { useState } from 'react';
import {
  Calculator,
  CalendarCheck,
  Check,
  HelpCircle,
  Home,
  Layers,
  Menu,
  Moon,
  Redo2,
  Save,
  ShieldAlert,
  Sun,
  Undo2,
  X,
} from 'lucide-react';
import { formatCompactIDR } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { calculateRAB } from '@/lib/rab';
import { getBackendStatus } from '@/lib/storage';
import { useProjectStore } from '@/store/useProjectStore';
import { NavSection, useUIStore } from '@/store/useUIStore';

export function StudioHeader() {
  const project = useProjectStore((s) => s.project);
  const pastCount = useProjectStore((s) => s.past.length);
  const futureCount = useProjectStore((s) => s.future.length);
  const hasUnsavedChanges = useProjectStore((s) => s.hasUnsavedChanges);
  const undo = useProjectStore((s) => s.undo);
  const redo = useProjectStore((s) => s.redo);
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject);

  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const activeNav = useUIStore((s) => s.activeNav);
  const setActiveNav = useUIStore((s) => s.setActiveNav);
  const openModal = useUIStore((s) => s.openModal);
  const mobileSheet = useUIStore((s) => s.mobileSheet);
  const setMobileSheet = useUIStore((s) => s.setMobileSheet);
  const snapshotProvider = useUIStore((s) => s.snapshotProvider);
  const addToast = useUIStore((s) => s.addToast);
  const openOnboarding = useUIStore((s) => s.openOnboarding);

  const [accountOpen, setAccountOpen] = useState(false);

  const copy = getCopy(language);
  const backendStatus = getBackendStatus();
  const rabSummary = calculateRAB(project);

  const handleSave = () => {
    const thumb = snapshotProvider ? snapshotProvider() : undefined;
    const res = saveCurrentProject(language, thumb);
    if (res.ok) {
      addToast(
        'success',
        language === 'id'
          ? `Proyek "${project.name}" tersimpan di perangkat ini.`
          : `Project "${project.name}" saved to this device.`
      );
    } else {
      addToast(
        'error',
        res.error ||
          (language === 'id' ? 'Gagal menyimpan proyek.' : 'Failed to save project.')
      );
    }
  };

  const navItems: Array<{ id: NavSection; label: string; icon: React.ReactNode }> = [
    { id: 'studio', label: copy.nav.studio, icon: <Home className="h-3.5 w-3.5" strokeWidth={1.6} /> },
    {
      id: 'construction',
      label: copy.nav.construction,
      icon: <Layers className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'catalog',
      label: copy.nav.catalog,
      icon: <Home className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'calculator',
      label: copy.nav.calculator,
      icon: <Calculator className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'faq',
      label: copy.nav.faq,
      icon: <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
  ];

  return (
    <header className="no-print fixed inset-x-0 top-0 z-30 h-14 border-b border-studio-border bg-studio-surface backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-2 px-3 lg:px-4">
        {/* Left: Brand Mark + Badge */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveNav('studio')}
            className="inline-flex min-h-[44px] sm:min-h-[36px] items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-studio-muted"
            title={
              language === 'id'
                ? 'Kembali ke ruang kerja Studio 3D'
                : 'Return to 3D Studio workspace'
            }
          >
            {/* Architectural Isometric Monogram SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0 text-studio-accent"
            >
              <path
                d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M12 3V21M4 7.5L12 12L20 7.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-semibold tracking-tight text-studio-text">
              {copy.appName}
            </span>
            <span className="rounded border border-studio-borderStrong px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-studio-subtext">
              {copy.badge}
            </span>
          </button>

          {/* Undo / Redo Controls */}
          <div className="hidden sm:flex items-center gap-0.5 border-l border-studio-border pl-2">
            <button
              type="button"
              disabled={pastCount === 0}
              onClick={() => {
                if (undo()) {
                  addToast('info', language === 'id' ? 'Perubahan diurungkan.' : 'Change undone.');
                }
              }}
              title={copy.header.undo}
              aria-label={copy.header.undo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-studio-text transition-colors hover:bg-studio-muted disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Undo2 className="h-4 w-4" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              disabled={futureCount === 0}
              onClick={() => {
                if (redo()) {
                  addToast('info', language === 'id' ? 'Perubahan diulangi.' : 'Change redone.');
                }
              }}
              title={copy.header.redo}
              aria-label={copy.header.redo}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-studio-text transition-colors hover:bg-studio-muted disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Redo2 className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        {/* Center: Primary Studio Navigation (Desktop) */}
        <nav
          aria-label={language === 'id' ? 'Navigasi Utama' : 'Primary Navigation'}
          className="hidden xl:flex items-center gap-1"
        >
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNav(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-studio-muted text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                    : 'text-studio-subtext hover:bg-studio-muted/70 hover:text-studio-text'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Live RAB Pill, Lang Switch, Theme, Save, Booking, Demo Profile, Mobile Menu */}
        <div className="flex items-center gap-1.5">
          {/* Quick Live Simulated RAB Button */}
          <button
            type="button"
            onClick={() => openModal('finance', 'rab')}
            title={
              language === 'id'
                ? 'Klik untuk membuka rincian estimasi RAB & simulasi KPR'
                : 'Open RAB cost breakdown & mortgage simulator'
            }
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <span className="text-studio-subtext">RAB:</span>
            <span className="font-semibold tabular-nums">
              {formatCompactIDR(rabSummary.totalEstimatedCost, language)}
            </span>
          </button>

          {/* Language Switch ID / EN */}
          <div
            role="group"
            aria-label={language === 'id' ? 'Pilih Bahasa' : 'Select Language'}
            className="hidden sm:inline-flex rounded-md border border-studio-border bg-studio-elevated p-0.5 text-xs"
          >
            <button
              type="button"
              onClick={() => setLanguage('id')}
              aria-pressed={language === 'id'}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                language === 'id'
                  ? 'bg-studio-accent text-studio-accentText'
                  : 'text-studio-subtext hover:text-studio-text'
              }`}
            >
              ID
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              className={`rounded px-2 py-1 font-medium transition-colors ${
                language === 'en'
                  ? 'bg-studio-accent text-studio-accentText'
                  : 'text-studio-subtext hover:text-studio-text'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'light' ? copy.header.themeDark : copy.header.themeLight}
            aria-label={theme === 'light' ? copy.header.themeDark : copy.header.themeLight}
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-md border border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" strokeWidth={1.6} />
            ) : (
              <Sun className="h-4 w-4" strokeWidth={1.6} />
            )}
          </button>

          {/* Save Project Button with Live Status */}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1.5 rounded-md bg-studio-accent px-3 py-1.5 text-xs font-semibold text-studio-accentText transition-colors hover:bg-studio-accentHover"
          >
            {hasUnsavedChanges ? (
              <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
            ) : (
              <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
            )}
            <span className="hidden sm:inline">{copy.header.save}</span>
            <span className="sr-only sm:not-sr-only sm:text-[10px] sm:opacity-90">
              ({hasUnsavedChanges ? copy.header.unsaved : copy.header.saved})
            </span>
          </button>

          {/* Book Architect Button (Desktop) */}
          <button
            type="button"
            onClick={() => openModal('booking')}
            className="hidden lg:inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-studio-borderStrong bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.header.bookConsult}</span>
          </button>

          {/* Account / Demo Mode Status Popover */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setAccountOpen((prev) => !prev)}
              aria-expanded={accountOpen}
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1 text-xs font-medium text-studio-subtext hover:text-studio-text"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-studio-sage" strokeWidth={1.6} />
              <span>
                {language === 'id' ? backendStatus.modeLabelId : backendStatus.modeLabelEn}
              </span>
            </button>

            {accountOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-lg border border-studio-border bg-studio-elevated p-3.5 shadow-modal">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-studio-text">
                    {language === 'id' ? backendStatus.modeLabelId : backendStatus.modeLabelEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAccountOpen(false)}
                    aria-label={language === 'id' ? 'Tutup info akun' : 'Close account status'}
                    className="rounded p-1 text-studio-subtext hover:bg-studio-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-studio-subtext">
                  {language === 'id' ? backendStatus.detailId : backendStatus.detailEn}
                </p>
                <div className="mt-3 flex gap-2 border-t border-studio-border pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false);
                      openOnboarding();
                    }}
                    className="w-full rounded-md bg-studio-muted px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-border"
                  >
                    {language === 'id' ? 'Panduan Cepat Studio' : 'Quick Studio Tour'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Menu Button (Labeled per mobile navigation guidelines) */}
          <button
            type="button"
            onClick={() => setMobileSheet(mobileSheet === 'menu' ? null : 'menu')}
            aria-expanded={mobileSheet === 'menu'}
            aria-label={language === 'id' ? 'Buka menu navigasi' : 'Open navigation menu'}
            className="inline-flex xl:hidden min-h-[44px] items-center gap-1.5 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            {mobileSheet === 'menu' ? (
              <X className="h-4 w-4" strokeWidth={1.7} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={1.7} />
            )}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile/Tablet Navigation Sheet */}
      {mobileSheet === 'menu' && (
        <div className="xl:hidden border-b border-studio-border bg-studio-elevated px-4 py-3 shadow-modal">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {navItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium ${
                    active
                      ? 'bg-studio-accent text-studio-accentText'
                      : 'text-studio-text hover:bg-studio-muted'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => openModal('booking')}
              className="flex min-h-[44px] items-center gap-2 rounded-md border border-studio-borderStrong px-3 py-2 text-left text-xs font-medium text-studio-text hover:bg-studio-muted"
            >
              <CalendarCheck className="h-4 w-4" strokeWidth={1.6} />
              <span>{copy.header.bookConsult}</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-studio-border pt-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pastCount === 0}
                onClick={() => undo()}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-studio-border px-3 py-1.5 text-studio-text disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                disabled={futureCount === 0}
                onClick={() => redo()}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-md border border-studio-border px-3 py-1.5 text-studio-text disabled:opacity-40"
              >
                <Redo2 className="h-4 w-4" />
                <span>Redo</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`min-h-[44px] min-w-[44px] rounded-md border px-3 py-1.5 font-semibold ${
                  language === 'id'
                    ? 'border-studio-accent bg-studio-accent text-studio-accentText'
                    : 'border-studio-border text-studio-text'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`min-h-[44px] min-w-[44px] rounded-md border px-3 py-1.5 font-semibold ${
                  language === 'en'
                    ? 'border-studio-accent bg-studio-accent text-studio-accentText'
                    : 'border-studio-border text-studio-text'
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-[11px] text-studio-subtext">
            {language === 'id' ? backendStatus.detailId : backendStatus.detailEn}
          </p>
        </div>
      )}
    </header>
  );
}
