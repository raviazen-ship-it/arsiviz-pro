'use client';

import React from 'react';
import { AlertTriangle, Check, Compass, Scissors } from 'lucide-react';
import {
  ACCENT_MATERIALS,
  ADDON_SPECS,
  checkAddonCompatibility,
  FACADE_SWATCHES,
  FLOOR_MATERIALS,
  HOUSE_SPECS,
  PLOT_PRESETS,
  ROOF_MATERIALS,
} from '@/lib/catalog';
import { formatCompactIDR } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { validateDimensionsDetailed } from '@/lib/validation';
import { useProjectStore } from '@/store/useProjectStore';
import { RightSidebarTab, useUIStore } from '@/store/useUIStore';
import { BuildingOrientation, HouseType } from '@/types/project';

function HouseElevationThumb({ type }: { type: HouseType }) {
  if (type === 'modern-minimalist') {
    return (
      <svg viewBox="0 0 80 44" className="h-10 w-16 shrink-0 text-studio-text">
        <rect x="12" y="10" width="56" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1="8" y1="22" x2="54" y2="22" stroke="currentColor" strokeWidth="1.8" />
        <rect x="18" y="25" width="22" height="13" fill="currentColor" fillOpacity="0.18" />
        <rect x="52" y="8" width="6" height="30" fill="currentColor" fillOpacity="0.45" />
      </svg>
    );
  }
  if (type === 'tropical-villa') {
    return (
      <svg viewBox="0 0 80 44" className="h-10 w-16 shrink-0 text-studio-text">
        <polygon points="6,20 40,7 74,20" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="16" y="20" width="48" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="22" y1="20" x2="22" y2="38" stroke="currentColor" strokeWidth="1.2" />
        <line x1="26" y1="20" x2="26" y2="38" stroke="currentColor" strokeWidth="1.2" />
        <line x1="30" y1="20" x2="30" y2="38" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === 'industrial-loft') {
    return (
      <svg viewBox="0 0 80 44" className="h-10 w-16 shrink-0 text-studio-text">
        <polygon points="12,15 68,8 68,38 12,38" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <line x1="38" y1="12" x2="38" y2="38" stroke="currentColor" strokeWidth="1.6" />
        <rect x="17" y="18" width="16" height="18" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 80 44" className="h-10 w-16 shrink-0 text-studio-text">
      <polygon points="10,21 40,9 70,21" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="15" y="21" width="50" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="33" y="23" width="14" height="15" fill="currentColor" fillOpacity="0.22" />
    </svg>
  );
}

export function ConfiguratorTabs({ activeTab }: { activeTab: RightSidebarTab }) {
  const project = useProjectStore((s) => s.project);
  const setHouseType = useProjectStore((s) => s.setHouseType);
  const updateMaterials = useProjectStore((s) => s.updateMaterials);
  const toggleAddon = useProjectStore((s) => s.toggleAddon);
  const updateDimensions = useProjectStore((s) => s.updateDimensions);
  const fitBuildingToSafePlot = useProjectStore((s) => s.fitBuildingToSafePlot);
  const updateScene = useProjectStore((s) => s.updateScene);

  const language = useUIStore((s) => s.language);
  const addToast = useUIStore((s) => s.addToast);

  const copy = getCopy(language);
  const dimValidation = validateDimensionsDetailed(project.dimensions, language);

  if (activeTab === 'type') {
    return (
      <div className="space-y-2.5">
        {(Object.keys(HOUSE_SPECS) as HouseType[]).map((typeKey) => {
          const spec = HOUSE_SPECS[typeKey];
          const selected = project.houseType === typeKey;

          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => {
                const notice = setHouseType(typeKey);
                const notes =
                  language === 'id' ? notice.adjustedNotesId : notice.adjustedNotesEn;
                if (notes.length > 0) {
                  addToast('info', notes[0]);
                }
              }}
              aria-pressed={selected}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                selected
                  ? 'border-studio-accent bg-studio-elevated ring-1 ring-studio-accent'
                  : 'border-studio-border bg-studio-elevated hover:bg-studio-muted/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-studio-text">
                      {language === 'id' ? spec.nameId : spec.nameEn}
                    </span>
                    {selected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-studio-accent" strokeWidth={2} />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-studio-subtext">
                    {language === 'id' ? spec.taglineId : spec.taglineEn}
                  </p>
                </div>
                <HouseElevationThumb type={typeKey} />
              </div>

              <div className="mt-2 border-t border-studio-border pt-2 text-[11px] text-studio-subtext">
                {language === 'id' ? spec.roofFormId : spec.roofFormEn}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (activeTab === 'material') {
    return (
      <div className="space-y-5">
        {/* Facade Color Swatches + Native HEX Picker */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-studio-text">
              {copy.configurator.facadeHeading}
            </h3>
            <span className="font-mono text-[11px] uppercase text-studio-subtext">
              {project.materials.facadeColor}
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-5 gap-2">
            {FACADE_SWATCHES.map((sw) => {
              const selected =
                project.materials.facadeColor.toLowerCase() === sw.hex.toLowerCase();
              return (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => updateMaterials({ facadeColor: sw.hex })}
                  title={language === 'id' ? sw.nameId : sw.nameEn}
                  aria-label={language === 'id' ? sw.nameId : sw.nameEn}
                  aria-pressed={selected}
                  className={`flex h-10 w-full items-center justify-center rounded-md border transition-transform ${
                    selected
                      ? 'border-studio-accent ring-2 ring-studio-accent scale-105'
                      : 'border-studio-borderStrong hover:scale-105'
                  }`}
                  style={{ backgroundColor: sw.hex }}
                >
                  {selected && (
                    <Check
                      className={`h-4 w-4 ${
                        sw.id === 'white' || sw.id === 'warm-ivory'
                          ? 'text-[#202522]'
                          : 'text-white'
                      }`}
                      strokeWidth={2.2}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center justify-between rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1.5">
            <label htmlFor="custom-facade-color" className="text-xs text-studio-subtext">
              {copy.configurator.customColor}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="custom-facade-color"
                type="color"
                value={project.materials.facadeColor}
                onChange={(e) => updateMaterials({ facadeColor: e.target.value })}
                className="h-7 w-9 cursor-pointer rounded border border-studio-border bg-transparent"
              />
            </div>
          </div>
        </section>

        {/* Roof Material */}
        <section>
          <h3 className="text-xs font-semibold text-studio-text">
            {copy.configurator.roofHeading}
          </h3>
          <div className="mt-2 space-y-1.5">
            {ROOF_MATERIALS.map((rm) => {
              const selected = project.materials.roofMaterial === rm.id;
              return (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() => updateMaterials({ roofMaterial: rm.id })}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    selected
                      ? 'border-studio-accent bg-studio-elevated ring-1 ring-studio-accent'
                      : 'border-studio-border bg-studio-elevated hover:bg-studio-muted/60'
                  }`}
                >
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border border-studio-borderStrong"
                    style={{ backgroundColor: rm.previewHex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-studio-text">
                      {language === 'id' ? rm.nameId : rm.nameEn}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-studio-subtext">
                      {language === 'id' ? rm.descId : rm.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Exterior Accent & Secondary Skin (Kayu Ulin / Batu Andesit / Bata / Baja) */}
        <section>
          <h3 className="text-xs font-semibold text-studio-text">
            {copy.configurator.accentHeading}
          </h3>
          <div className="mt-2 space-y-1.5">
            {ACCENT_MATERIALS.map((am) => {
              const selected = project.materials.accentMaterial === am.id;
              return (
                <button
                  key={am.id}
                  type="button"
                  onClick={() => updateMaterials({ accentMaterial: am.id })}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    selected
                      ? 'border-studio-accent bg-studio-elevated ring-1 ring-studio-accent'
                      : 'border-studio-border bg-studio-elevated hover:bg-studio-muted/60'
                  }`}
                >
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border border-studio-borderStrong"
                    style={{ backgroundColor: am.previewHex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-studio-text">
                      {language === 'id' ? am.nameId : am.nameEn}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-studio-subtext">
                      {language === 'id' ? am.descId : am.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Interior Flooring */}
        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-studio-text">
              {copy.configurator.floorHeading}
            </h3>
            <button
              type="button"
              onClick={() => updateScene({ cutaway: !project.scene.cutaway }, true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-studio-accent hover:underline"
            >
              <Scissors className="h-3 w-3" />
              <span>{project.scene.cutaway ? 'Tutup Atap' : 'Buka Cutaway'}</span>
            </button>
          </div>
          <p className="mt-1 text-[11px] text-studio-subtext">{copy.configurator.interiorNote}</p>

          <div className="mt-2 space-y-1.5">
            {FLOOR_MATERIALS.map((fm) => {
              const selected = project.materials.floorMaterial === fm.id;
              return (
                <button
                  key={fm.id}
                  type="button"
                  onClick={() => updateMaterials({ floorMaterial: fm.id })}
                  aria-pressed={selected}
                  className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                    selected
                      ? 'border-studio-accent bg-studio-elevated ring-1 ring-studio-accent'
                      : 'border-studio-border bg-studio-elevated hover:bg-studio-muted/60'
                  }`}
                >
                  <span
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border border-studio-borderStrong"
                    style={{ backgroundColor: fm.previewHex }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-studio-text">
                      {language === 'id' ? fm.nameId : fm.nameEn}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-studio-subtext">
                      {language === 'id' ? fm.descId : fm.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === 'addons') {
    const interiorAddons = ADDON_SPECS.filter((a) => a.category === 'interior');
    const outdoorAddons = ADDON_SPECS.filter((a) => a.category === 'outdoor');

    const renderAddonList = (list: typeof ADDON_SPECS) => (
      <div className="space-y-2">
        {list.map((spec) => {
          const compat = checkAddonCompatibility(spec.key, project.houseType, project.dimensions);
          const enabled = Boolean(project.addons[spec.key]) && compat.supported;

          return (
            <div
              key={spec.key}
              className={`rounded-lg border p-3 ${
                !compat.supported
                  ? 'border-studio-border bg-studio-muted/50 opacity-80'
                  : enabled
                  ? 'border-studio-accent bg-studio-elevated'
                  : 'border-studio-border bg-studio-elevated'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-studio-text">
                    {language === 'id' ? spec.nameId : spec.nameEn}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium tabular-nums text-studio-accent">
                    +{formatCompactIDR(spec.estimatedPriceIdr, language)}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={language === 'id' ? spec.nameId : spec.nameEn}
                  disabled={!compat.supported}
                  onClick={() => {
                    const res = toggleAddon(spec.key);
                    if (!res.changed) {
                      addToast(
                        'warning',
                        (language === 'id' ? res.reasonId : res.reasonEn) || 'Tidak kompatibel'
                      );
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors disabled:cursor-not-allowed ${
                    enabled
                      ? 'border-studio-accent bg-studio-accent'
                      : 'border-studio-borderStrong bg-studio-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-studio-subtext">
                {language === 'id' ? spec.descId : spec.descEn}
              </p>

              {!compat.supported && (
                <p className="mt-2 flex items-start gap-1.5 rounded bg-amber-500/15 px-2 py-1 text-[11px] text-studio-text">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{language === 'id' ? compat.reasonId : compat.reasonEn}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    );

    return (
      <div className="space-y-4">
        {project.scene.constructionStage < 5 && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-studio-text">
            {language === 'id'
              ? 'Anda sedang berada di Tahap ' +
                project.scene.constructionStage +
                '. Geser timeline ke Tahap 5 untuk melihat seluruh furnitur dan lanskap di model 3D.'
              : `Currently viewing Stage ${project.scene.constructionStage}. Advance timeline to Stage 5 to see furniture and outdoor add-ons in 3D.`}
          </div>
        )}

        <section>
          <h3 className="mb-2 text-xs font-semibold text-studio-text">
            {copy.configurator.addonsInterior}
          </h3>
          {renderAddonList(interiorAddons)}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold text-studio-text">
            {copy.configurator.addonsOutdoor}
          </h3>
          {renderAddonList(outdoorAddons)}
        </section>
      </div>
    );
  }

  // activeTab === 'dimensions'
  return (
    <div className="space-y-4">
      {/* Plot Size Presets */}
      <section>
        <h3 className="text-xs font-semibold text-studio-text">
          {copy.configurator.plotPresets}
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-1.5">
          {PLOT_PRESETS.map((preset) => {
            const isMatch =
              project.dimensions.landWidth === preset.landWidth &&
              project.dimensions.landLength === preset.landLength;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  updateDimensions({
                    landWidth: preset.landWidth,
                    landLength: preset.landLength,
                    buildingWidth: preset.buildingWidth,
                    buildingLength: preset.buildingLength,
                  })
                }
                className={`rounded-md border px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  isMatch
                    ? 'border-studio-accent bg-studio-elevated text-studio-text ring-1 ring-studio-accent'
                    : 'border-studio-border bg-studio-elevated text-studio-subtext hover:bg-studio-muted hover:text-studio-text'
                }`}
              >
                {language === 'id' ? preset.labelId : preset.labelEn}
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Numeric & Range Controls */}
      <section className="rounded-lg border border-studio-border bg-studio-elevated p-3 space-y-3">
        {[
          {
            id: 'landWidth',
            label: copy.configurator.landWidth,
            val: project.dimensions.landWidth,
            min: 6,
            max: 35,
            step: 0.5,
            onChange: (v: number) => updateDimensions({ landWidth: v }),
          },
          {
            id: 'landLength',
            label: copy.configurator.landLength,
            val: project.dimensions.landLength,
            min: 8,
            max: 45,
            step: 0.5,
            onChange: (v: number) => updateDimensions({ landLength: v }),
          },
          {
            id: 'buildingWidth',
            label: copy.configurator.buildingWidth,
            val: project.dimensions.buildingWidth,
            min: 4,
            max: project.dimensions.landWidth,
            step: 0.5,
            onChange: (v: number) => updateDimensions({ buildingWidth: v }),
          },
          {
            id: 'buildingLength',
            label: copy.configurator.buildingLength,
            val: project.dimensions.buildingLength,
            min: 5,
            max: project.dimensions.landLength,
            step: 0.5,
            onChange: (v: number) => updateDimensions({ buildingLength: v }),
          },
        ].map((ctrl) => (
          <div key={ctrl.id}>
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={`dim-${ctrl.id}`} className="font-medium text-studio-text">
                {ctrl.label}
              </label>
              <input
                id={`dim-${ctrl.id}`}
                type="number"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={ctrl.val}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (!Number.isNaN(parsed)) ctrl.onChange(parsed);
                }}
                className="w-16 rounded border border-studio-borderStrong bg-studio-elevated px-1.5 py-0.5 text-right text-xs font-semibold tabular-nums text-studio-text"
              />
            </div>
            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              step={ctrl.step}
              value={ctrl.val}
              aria-label={ctrl.label}
              onChange={(e) => ctrl.onChange(parseFloat(e.target.value))}
              className="mt-1 h-2 w-full cursor-pointer accent-[var(--accent-terracotta)]"
            />
          </div>
        ))}

        {/* Warnings & Safe Fit Helper */}
        {dimValidation.warnings.length > 0 && (
          <div className="space-y-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] text-studio-text">
            {dimValidation.warnings.map((w, idx) => (
              <p key={idx} className="flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>{w}</span>
              </p>
            ))}
            <button
              type="button"
              onClick={() => fitBuildingToSafePlot()}
              className="mt-1 w-full rounded bg-studio-elevated px-2 py-1 text-xs font-medium text-studio-text ring-1 ring-studio-borderStrong hover:bg-studio-muted"
            >
              {copy.configurator.autoFitBtn}
            </button>
          </div>
        )}
      </section>

      {/* Number of Stories (1 vs 2 Floors) */}
      <section className="rounded-lg border border-studio-border bg-studio-elevated p-3">
        <h3 className="text-xs font-semibold text-studio-text">{copy.configurator.floorCount}</h3>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[1, 2].map((fl) => {
            const active = project.dimensions.floors === fl;
            return (
              <button
                key={fl}
                type="button"
                aria-pressed={active}
                onClick={() => updateDimensions({ floors: fl as 1 | 2 })}
                className={`min-h-[38px] rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-studio-accent bg-studio-accent text-studio-accentText'
                    : 'border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted'
                }`}
              >
                {fl === 1 ? copy.configurator.floor1 : copy.configurator.floor2}
              </button>
            );
          })}
        </div>
      </section>

      {/* Building Orientation */}
      <section className="rounded-lg border border-studio-border bg-studio-elevated p-3">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-studio-text">
          <Compass className="h-3.5 w-3.5 text-studio-accent" strokeWidth={1.7} />
          <span>{copy.configurator.orientation}</span>
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {(
            [
              [0, language === 'id' ? '0° U' : '0° N'],
              [90, language === 'id' ? '90° T' : '90° E'],
              [180, language === 'id' ? '180° S' : '180° S'],
              [270, language === 'id' ? '270° B' : '270° W'],
            ] as Array<[BuildingOrientation, string]>
          ).map(([deg, label]) => {
            const active = project.dimensions.orientation === deg;
            return (
              <button
                key={deg}
                type="button"
                aria-pressed={active}
                onClick={() => updateDimensions({ orientation: deg })}
                className={`min-h-[36px] rounded-md border text-xs font-medium tabular-nums ${
                  active
                    ? 'border-studio-accent bg-studio-accent text-studio-accentText'
                    : 'border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
