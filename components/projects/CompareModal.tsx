'use client';

import React from 'react';
import { Copy, Save } from 'lucide-react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import {
  ACCENT_MATERIALS,
  ADDON_SPECS,
  checkAddonCompatibility,
  FLOOR_MATERIALS,
  HOUSE_SPECS,
  ROOF_MATERIALS,
} from '@/lib/catalog';
import { formatArea, formatIDR, formatMeters } from '@/lib/format';
import { calculateRAB } from '@/lib/rab';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { ProjectConfig } from '@/types/project';

export function CompareModal() {
  const savedProjects = useProjectStore((s) => s.savedProjects);
  const currentProject = useProjectStore((s) => s.project);
  const saveCurrentProject = useProjectStore((s) => s.saveCurrentProject);
  const duplicateSavedProject = useProjectStore((s) => s.duplicateSavedProject);

  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const compareIds = useUIStore((s) => s.compareIds);
  const setCompareIds = useUIStore((s) => s.setCompareIds);
  const language = useUIStore((s) => s.language);
  const snapshotProvider = useUIStore((s) => s.snapshotProvider);
  const addToast = useUIStore((s) => s.addToast);

  const projectA: ProjectConfig | undefined =
    savedProjects.find((p) => p.projectId === compareIds[0]) ?? savedProjects[0];
  const projectB: ProjectConfig | undefined =
    savedProjects.find((p) => p.projectId === compareIds[1]) ??
    savedProjects.find((p) => p.projectId !== projectA?.projectId);

  const renderProjectDetails = (p: ProjectConfig) => {
    const rab = calculateRAB(p);
    const house = HOUSE_SPECS[p.houseType];
    const roof = ROOF_MATERIALS.find((r) => r.id === p.materials.roofMaterial);
    const accent = ACCENT_MATERIALS.find((a) => a.id === p.materials.accentMaterial);
    const floor = FLOOR_MATERIALS.find((f) => f.id === p.materials.floorMaterial);
    const activeAddonNames = ADDON_SPECS.filter(
      (a) =>
        p.addons[a.key] && checkAddonCompatibility(a.key, p.houseType, p.dimensions).supported
    ).map((a) => (language === 'id' ? a.nameId : a.nameEn));

    return {
      rab,
      typeName: language === 'id' ? house.nameId : house.nameEn,
      plotText: `${formatMeters(p.dimensions.landWidth, language)} × ${formatMeters(
        p.dimensions.landLength,
        language
      )} (${formatArea(rab.landArea, language)})`,
      buildingText: `${formatMeters(p.dimensions.buildingWidth, language)} × ${formatMeters(
        p.dimensions.buildingLength,
        language
      )} (${formatArea(rab.grossFloorArea, language)})`,
      floorsText: `${p.dimensions.floors} ${language === 'id' ? 'Lantai' : 'Stories'}`,
      facadeText: p.materials.facadeColor.toUpperCase(),
      roofText: (language === 'id' ? roof?.nameId : roof?.nameEn) || '-',
      accentText: (language === 'id' ? accent?.nameId : accent?.nameEn) || '-',
      floorText: (language === 'id' ? floor?.nameId : floor?.nameEn) || '-',
      addonsText:
        activeAddonNames.length > 0
          ? activeAddonNames.join(', ')
          : language === 'id'
          ? 'Tanpa add-on tambahan'
          : 'No optional add-ons',
      contingencyText: `${rab.contingencyPercent}%`,
      rabTotalText: formatIDR(rab.totalEstimatedCost, language),
      costM2Text: `${formatIDR(rab.estimatedCostPerM2, language)} / m²`,
    };
  };

  return (
    <ModalDialog
      open={activeModal === 'compare'}
      onClose={closeModal}
      title={language === 'id' ? 'Bandingkan Dua Alternatif Desain' : 'Compare Two Design Options'}
      subtitle={
        language === 'id'
          ? 'Lihat perbedaan dimensi, spesifikasi material, fitur add-on, dan estimasi RAB secara berdampingan.'
          : 'Evaluate dimensional, material, add-on, and simulated RAB differences side by side.'
      }
      maxWidthClass="max-w-5xl"
    >
      {savedProjects.length < 2 || !projectA || !projectB ? (
        <div className="rounded-xl border border-dashed border-studio-borderStrong bg-studio-muted/40 p-6 text-center space-y-3">
          <h3 className="text-sm font-semibold text-studio-text">
            {language === 'id'
              ? 'Dibutuhkan Minimal 2 Proyek Tersimpan untuk Perbandingan'
              : 'At Least 2 Saved Projects Are Needed to Compare'}
          </h3>
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-studio-subtext">
            {language === 'id'
              ? `Saat ini Anda memiliki ${savedProjects.length} proyek tersimpan. Simpan proyek aktif Anda terlebih dahulu, lalu buat salinan (duplikasi) dan ubah tipe/materialnya untuk membandingkan dua skenario biaya.`
              : `You currently have ${savedProjects.length} saved project(s). Save your current configuration first, then duplicate it and modify materials or floors to compare two scenarios.`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                const thumb = snapshotProvider ? snapshotProvider() : undefined;
                const s1 = saveCurrentProject(language, thumb);
                if (s1.ok) {
                  const s2 = duplicateSavedProject(currentProject.projectId, language);
                  if (s2.ok && s2.newProject) {
                    setCompareIds([currentProject.projectId, s2.newProject.projectId]);
                    addToast(
                      'success',
                      language === 'id'
                        ? 'Proyek disimpan & salinan pembanding telah disiapkan.'
                        : 'Saved current project and created a comparison copy.'
                    );
                  }
                }
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-studio-accent px-4 py-2 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover"
            >
              {savedProjects.length === 0 ? (
                <Save className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {language === 'id'
                  ? 'Simpan & Duplikasi Otomatis untuk Mulai Membandingkan'
                  : 'Save & Duplicate Now to Start Comparing'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        (() => {
          const dA = renderProjectDetails(projectA);
          const dB = renderProjectDetails(projectB);
          const diffRab = dB.rab.totalEstimatedCost - dA.rab.totalEstimatedCost;

          const rows: Array<{
            label: string;
            valA: string;
            valB: string;
            highlight?: boolean;
          }> = [
            {
              label: language === 'id' ? 'Tipe Rumah' : 'House Typology',
              valA: dA.typeName,
              valB: dB.typeName,
            },
            {
              label: language === 'id' ? 'Ukuran & Luas Lahan' : 'Plot Size & Area',
              valA: dA.plotText,
              valB: dB.plotText,
            },
            {
              label: language === 'id' ? 'Dimensi & Luas Bangunan' : 'Footprint & GFA',
              valA: dA.buildingText,
              valB: dB.buildingText,
            },
            {
              label: language === 'id' ? 'Jumlah Lantai' : 'Stories',
              valA: dA.floorsText,
              valB: dB.floorsText,
            },
            {
              label: language === 'id' ? 'Warna Fasad' : 'Facade Color',
              valA: dA.facadeText,
              valB: dB.facadeText,
            },
            {
              label: language === 'id' ? 'Material Atap' : 'Roof Material',
              valA: dA.roofText,
              valB: dB.roofText,
            },
            {
              label: language === 'id' ? 'Aksen / Secondary Skin' : 'Exterior Accent',
              valA: dA.accentText,
              valB: dB.accentText,
            },
            {
              label: language === 'id' ? 'Lantai Interior' : 'Interior Floor',
              valA: dA.floorText,
              valB: dB.floorText,
            },
            {
              label: language === 'id' ? 'Add-on Aktif' : 'Active Add-ons',
              valA: dA.addonsText,
              valB: dB.addonsText,
            },
            {
              label: language === 'id' ? 'Asumsi Contingency' : 'Contingency Assumption',
              valA: dA.contingencyText,
              valB: dB.contingencyText,
            },
            {
              label: language === 'id' ? 'Total Simulasi RAB' : 'Simulated RAB Total',
              valA: dA.rabTotalText,
              valB: dB.rabTotalText,
              highlight: true,
            },
            {
              label: language === 'id' ? 'Rata-rata Biaya / m²' : 'Simulated Cost / m²',
              valA: dA.costM2Text,
              valB: dB.costM2Text,
            },
          ];

          return (
            <div className="space-y-4">
              {/* Project A & B Selectors */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-studio-border bg-studio-muted/50 p-3">
                  <label
                    htmlFor="compare-select-a"
                    className="block text-[11px] font-semibold uppercase tracking-wide text-studio-subtext"
                  >
                    {language === 'id' ? 'Desain A (Acuan)' : 'Design A (Baseline)'}
                  </label>
                  <select
                    id="compare-select-a"
                    value={projectA.projectId}
                    onChange={(e) => setCompareIds([e.target.value, projectB.projectId])}
                    className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-2.5 py-2 text-xs font-semibold text-studio-text"
                  >
                    {savedProjects.map((p) => (
                      <option
                        key={p.projectId}
                        value={p.projectId}
                        disabled={p.projectId === projectB.projectId}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-lg border border-studio-border bg-studio-muted/50 p-3">
                  <label
                    htmlFor="compare-select-b"
                    className="block text-[11px] font-semibold uppercase tracking-wide text-studio-subtext"
                  >
                    {language === 'id' ? 'Desain B (Pembanding)' : 'Design B (Alternative)'}
                  </label>
                  <select
                    id="compare-select-b"
                    value={projectB.projectId}
                    onChange={(e) => setCompareIds([projectA.projectId, e.target.value])}
                    className="mt-1 w-full rounded-md border border-studio-borderStrong bg-studio-elevated px-2.5 py-2 text-xs font-semibold text-studio-text"
                  >
                    {savedProjects.map((p) => (
                      <option
                        key={p.projectId}
                        value={p.projectId}
                        disabled={p.projectId === projectA.projectId}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Delta Banner */}
              <div className="rounded-lg border border-studio-border bg-studio-elevated px-4 py-3 text-xs flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-studio-subtext">
                  {language === 'id'
                    ? `Selisih Estimasi RAB (${projectB.name} terhadap ${projectA.name}):`
                    : `Simulated RAB Difference (${projectB.name} vs ${projectA.name}):`}
                </span>
                <span className="font-bold tabular-nums text-studio-text">
                  {diffRab === 0
                    ? language === 'id'
                      ? 'Sama persis (Rp 0)'
                      : 'Identical (IDR 0)'
                    : `${diffRab > 0 ? '+' : ''}${formatIDR(diffRab, language)}`}
                </span>
              </div>

              {/* Desktop Table & Mobile Aligned Cards */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-studio-border">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-studio-border bg-studio-muted/70">
                      <th className="w-1/4 px-3.5 py-2.5 font-semibold text-studio-subtext">
                        {language === 'id' ? 'Parameter' : 'Parameter'}
                      </th>
                      <th className="w-[34%] px-3.5 py-2.5 font-semibold text-studio-text">
                        {projectA.name}
                      </th>
                      <th className="w-[34%] px-3.5 py-2.5 font-semibold text-studio-text">
                        {projectB.name}
                      </th>
                      <th className="px-2.5 py-2.5 text-center font-semibold text-studio-subtext">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-studio-border bg-studio-elevated">
                    {rows.map((r) => {
                      const differs = r.valA !== r.valB;
                      return (
                        <tr
                          key={r.label}
                          className={
                            r.highlight
                              ? 'bg-studio-muted/50 font-semibold'
                              : differs
                              ? 'bg-amber-500/5'
                              : ''
                          }
                        >
                          <td className="px-3.5 py-2.5 font-medium text-studio-subtext">
                            {r.label}
                          </td>
                          <td className="px-3.5 py-2.5 tabular-nums text-studio-text">
                            {r.valA}
                          </td>
                          <td className="px-3.5 py-2.5 tabular-nums text-studio-text">
                            {r.valB}
                          </td>
                          <td className="px-2.5 py-2.5 text-center">
                            {differs ? (
                              <span className="inline-block rounded bg-studio-accent/15 px-2 py-0.5 text-[10px] font-semibold text-studio-accent">
                                {language === 'id' ? 'Berbeda' : 'Differs'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-studio-subtext">=</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Paired Rows */}
              <div className="space-y-2 md:hidden">
                {rows.map((r) => {
                  const differs = r.valA !== r.valB;
                  return (
                    <div
                      key={r.label}
                      className="rounded-lg border border-studio-border bg-studio-elevated p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-studio-subtext">{r.label}</span>
                        {differs && (
                          <span className="rounded bg-studio-accent/15 px-2 py-0.5 text-[10px] font-semibold text-studio-accent">
                            {language === 'id' ? 'Berbeda' : 'Differs'}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-studio-border pt-2">
                        <div>
                          <div className="truncate text-[10px] text-studio-subtext">
                            {projectA.name}
                          </div>
                          <div className="mt-0.5 font-medium tabular-nums text-studio-text">
                            {r.valA}
                          </div>
                        </div>
                        <div>
                          <div className="truncate text-[10px] text-studio-subtext">
                            {projectB.name}
                          </div>
                          <div className="mt-0.5 font-medium tabular-nums text-studio-text">
                            {r.valB}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}
    </ModalDialog>
  );
}
