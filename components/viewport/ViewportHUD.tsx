'use client';

import React from 'react';
import {
  Box,
  Compass,
  Eye,
  Grid3X3,
  Layers,
  Moon,
  RotateCcw,
  RefreshCw,
  Ruler,
  Scissors,
  Sliders,
  Sun,
  X,
} from 'lucide-react';
import { formatSunTime } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { CameraPreset } from '@/types/project';

export function ViewportHUD() {
  const scene = useProjectStore((s) => s.project.scene);
  const updateScene = useProjectStore((s) => s.updateScene);

  const language = useUIStore((s) => s.language);
  const rightSidebarOpen = useUIStore((s) => s.rightSidebarOpen);
  const selectedElement = useUIStore((s) => s.selectedElement);
  const setSelectedElement = useUIStore((s) => s.setSelectedElement);
  const setRightSidebar = useUIStore((s) => s.setRightSidebar);
  const setMobileSheet = useUIStore((s) => s.setMobileSheet);
  const triggerCamera = useUIStore((s) => s.triggerCameraResetOrCustom);
  const performanceMode = useUIStore((s) => s.performanceMode);
  const setPerformanceMode = useUIStore((s) => s.setPerformanceMode);

  const copy = getCopy(language);
  const isEvening = scene.sunTime >= 17.5 || scene.sunTime <= 6.5;

  const cameraButtons: Array<{ id: CameraPreset; label: string; icon: React.ReactNode }> = [
    {
      id: 'perspective',
      label: copy.viewport.cameraPerspective,
      icon: <Box className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'front',
      label: copy.viewport.cameraFront,
      icon: <Compass className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'top',
      label: copy.viewport.cameraTop,
      icon: <Layers className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
    {
      id: 'interior',
      label: copy.viewport.cameraInterior,
      icon: <Eye className="h-3.5 w-3.5" strokeWidth={1.6} />,
    },
  ];

  const handleCameraPreset = (preset: CameraPreset) => {
    updateScene({ cameraPreset: preset }, false);
    triggerCamera();
  };

  const handleResetView = () => {
    updateScene({ cameraPreset: 'perspective', autoRotate: false }, false);
    triggerCamera();
  };

  return (
    <>
      {/* Top-Right Floating Camera, Cutaway, Grid/Dimensions & Sun Study Controls */}
      <div
        className={`pointer-events-none fixed top-16 z-20 flex flex-col items-end gap-2 transition-all duration-200 ${
          rightSidebarOpen ? 'right-3 lg:right-[21.5rem]' : 'right-3'
        } max-w-[calc(100vw-1.5rem)]`}
      >
        {/* Camera Preset Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 rounded-lg border border-studio-border bg-studio-elevated/95 p-1 shadow-panel">
          {cameraButtons.map((btn) => {
            const active = scene.cameraPreset === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleCameraPreset(btn.id)}
                title={btn.label}
                aria-pressed={active}
                className={`inline-flex min-h-[44px] sm:min-h-[34px] items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-studio-accent text-studio-accentText'
                    : 'text-studio-text hover:bg-studio-muted'
                }`}
              >
                {btn.icon}
                <span className="hidden xl:inline">{btn.label}</span>
              </button>
            );
          })}

          <div className="mx-0.5 h-5 w-px bg-studio-border" aria-hidden="true" />

          <button
            type="button"
            onClick={handleResetView}
            title={copy.viewport.cameraReset}
            aria-label={copy.viewport.cameraReset}
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-md px-2 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Viewport Toggles Row: Cutaway, Grid, Dimensions, Auto-Rotate, Render Quality */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1 rounded-lg border border-studio-border bg-studio-elevated/95 p-1 shadow-panel">
          <button
            type="button"
            onClick={() => updateScene({ cutaway: !scene.cutaway }, true)}
            aria-pressed={scene.cutaway}
            title={copy.viewport.cutaway}
            className={`inline-flex min-h-[44px] sm:min-h-[32px] items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              scene.cutaway
                ? 'bg-studio-accent text-studio-accentText'
                : 'text-studio-text hover:bg-studio-muted'
            }`}
          >
            <Scissors className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{language === 'id' ? 'Cutaway' : 'Cutaway'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateScene({ showGrid: !scene.showGrid }, false)}
            aria-pressed={scene.showGrid}
            title={copy.viewport.grid}
            aria-label={copy.viewport.grid}
            className={`inline-flex min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-0 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              scene.showGrid
                ? 'bg-studio-muted text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                : 'text-studio-subtext hover:bg-studio-muted hover:text-studio-text'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span className="hidden md:inline">Grid</span>
          </button>

          <button
            type="button"
            onClick={() => updateScene({ showDimensions: !scene.showDimensions }, false)}
            aria-pressed={scene.showDimensions}
            title={copy.viewport.dimensions}
            aria-label={copy.viewport.dimensions}
            className={`inline-flex min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-0 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              scene.showDimensions
                ? 'bg-studio-muted text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                : 'text-studio-subtext hover:bg-studio-muted hover:text-studio-text'
            }`}
          >
            <Ruler className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span className="hidden md:inline">{language === 'id' ? 'Dimensi' : 'Dims'}</span>
          </button>

          <button
            type="button"
            onClick={() => updateScene({ autoRotate: !scene.autoRotate }, false)}
            aria-pressed={scene.autoRotate}
            title={copy.viewport.autoRotate}
            aria-label={copy.viewport.autoRotate}
            className={`inline-flex min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-0 items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              scene.autoRotate
                ? 'bg-studio-muted text-studio-text ring-1 ring-inset ring-studio-borderStrong'
                : 'text-studio-subtext hover:bg-studio-muted hover:text-studio-text'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span className="hidden md:inline">360°</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setPerformanceMode(
                performanceMode === 'auto'
                  ? 'low'
                  : performanceMode === 'low'
                  ? 'high'
                  : 'auto'
              )
            }
            title={`${copy.viewport.perfLabel}: ${
              performanceMode === 'low'
                ? copy.viewport.perfLow
                : performanceMode === 'high'
                ? copy.viewport.perfHigh
                : copy.viewport.perfAuto
            }`}
            className="hidden sm:inline-flex min-h-[32px] items-center gap-1 rounded-md px-2 py-1 text-xs text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
          >
            <Sliders className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>
              {performanceMode === 'low'
                ? copy.viewport.perfLow
                : performanceMode === 'high'
                ? copy.viewport.perfHigh
                : copy.viewport.perfAuto}
            </span>
          </button>
        </div>

        {/* Sun Study Slider (06:00 - 21:00) */}
        <div className="pointer-events-auto w-60 sm:w-64 rounded-lg border border-studio-border bg-studio-elevated/95 px-3 py-2 shadow-panel">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="sun-study-slider"
              className="flex items-center gap-1.5 font-medium text-studio-text"
            >
              {isEvening ? (
                <Moon className="h-3.5 w-3.5 text-studio-gold" strokeWidth={1.7} />
              ) : (
                <Sun className="h-3.5 w-3.5 text-studio-gold" strokeWidth={1.7} />
              )}
              <span>{copy.viewport.sunStudy}</span>
            </label>
            <span className="rounded bg-studio-muted px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-studio-text">
              {formatSunTime(scene.sunTime)}
            </span>
          </div>

          <input
            id="sun-study-slider"
            type="range"
            min={6}
            max={21}
            step={0.25}
            value={scene.sunTime}
            onChange={(e) => updateScene({ sunTime: parseFloat(e.target.value) }, false)}
            aria-label={`${copy.viewport.sunStudy} ${formatSunTime(scene.sunTime)}`}
            className="mt-1.5 h-2 w-full cursor-pointer accent-[var(--accent-terracotta)]"
          />

          <div className="mt-0.5 flex items-center justify-between text-[11px] text-studio-subtext">
            <span className="tabular-nums">06:00</span>
            <span>
              {isEvening ? copy.viewport.nightLightsActive : copy.viewport.daylightActive}
            </span>
            <span className="tabular-nums">21:00</span>
          </div>
        </div>

        {/* Raycast Selected Building Object Card */}
        {selectedElement && (
          <div
            role="region"
            aria-label={copy.viewport.selectedElement}
            className="pointer-events-auto w-64 sm:w-72 rounded-lg border border-studio-borderStrong bg-studio-elevated p-3 shadow-panel"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-studio-subtext">
                  {language === 'id' ? selectedElement.categoryId : selectedElement.categoryEn} ·{' '}
                  {language === 'id' ? 'Tahap' : 'Stage'} {selectedElement.stage}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-studio-text">
                  {language === 'id' ? selectedElement.labelId : selectedElement.labelEn}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedElement(null)}
                aria-label={copy.viewport.clearSelection}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-studio-subtext hover:bg-studio-muted hover:text-studio-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-studio-subtext">
              {language === 'id'
                ? selectedElement.materialNoteId
                : selectedElement.materialNoteEn}
            </p>
            {selectedElement.editTargetTab && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    setRightSidebar(true, selectedElement.editTargetTab);
                    setMobileSheet('right');
                  } else {
                    setRightSidebar(true, selectedElement.editTargetTab);
                  }
                }}
                className="mt-2.5 w-full rounded-md bg-studio-muted px-2.5 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-border"
              >
                {copy.viewport.editInPanel}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
