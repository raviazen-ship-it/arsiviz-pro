'use client';

import React from 'react';
import { Calculator, Printer } from 'lucide-react';
import { HOUSE_SPECS } from '@/lib/catalog';
import { formatArea, formatIDR, formatMeters } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { calculateRAB } from '@/lib/rab';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

export function TechnicalSummaryPanel() {
  const project = useProjectStore((s) => s.project);
  const language = useUIStore((s) => s.language);
  const openModal = useUIStore((s) => s.openModal);

  const copy = getCopy(language);
  const rab = calculateRAB(project);
  const spec = HOUSE_SPECS[project.houseType];
  const kdbPercent =
    rab.landArea > 0 ? Math.round((rab.footprintArea / rab.landArea) * 100) : 0;

  const orientationLabel =
    project.dimensions.orientation === 0
      ? language === 'id'
        ? '0° Utara'
        : '0° North'
      : project.dimensions.orientation === 90
      ? language === 'id'
        ? '90° Timur'
        : '90° East'
      : project.dimensions.orientation === 180
      ? language === 'id'
        ? '180° Selatan'
        : '180° South'
      : language === 'id'
      ? '270° Barat'
      : '270° West';

  const rows: Array<{ label: string; value: string }> = [
    {
      label: language === 'id' ? 'Tipologi Arsitektur' : 'Architectural Typology',
      value: language === 'id' ? spec.nameId : spec.nameEn,
    },
    {
      label: copy.technicalPanel.landSize,
      value: `${formatMeters(project.dimensions.landWidth, language)} × ${formatMeters(
        project.dimensions.landLength,
        language
      )}`,
    },
    {
      label: copy.technicalPanel.landArea,
      value: formatArea(rab.landArea, language),
    },
    {
      label: copy.technicalPanel.footprint,
      value: formatArea(rab.footprintArea, language),
    },
    {
      label: copy.technicalPanel.grossArea,
      value: formatArea(rab.grossFloorArea, language),
    },
    {
      label: copy.technicalPanel.remainingYard,
      value: formatArea(rab.remainingYardArea, language),
    },
    {
      label: copy.technicalPanel.floors,
      value: `${project.dimensions.floors} ${language === 'id' ? 'Lantai' : 'Story'}`,
    },
    {
      label: copy.technicalPanel.orientation,
      value: orientationLabel,
    },
    {
      label: copy.technicalPanel.kdbRatio,
      value: `${kdbPercent}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
        <h3 className="text-xs font-semibold text-studio-text">
          {copy.technicalPanel.summaryTitle}
        </h3>

        <dl className="mt-3 divide-y divide-studio-border text-xs">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2 py-2">
              <dt className="text-studio-subtext">{r.label}</dt>
              <dd className="text-right font-medium tabular-nums text-studio-text">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Simulated Cost Highlight */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5 space-y-2.5">
        <div className="text-[11px] font-medium text-studio-subtext">
          {copy.technicalPanel.estimatedRab}
        </div>
        <div className="text-base font-bold tabular-nums text-studio-text">
          {formatIDR(rab.totalEstimatedCost, language)}
        </div>
        <div className="text-xs tabular-nums text-studio-subtext">
          {copy.technicalPanel.costPerM2}: {formatIDR(rab.estimatedCostPerM2, language)} / m²
        </div>

        <div className="pt-1 space-y-1.5">
          <button
            type="button"
            onClick={() => openModal('finance', 'rab')}
            className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-md bg-studio-accent px-3 py-1.5 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover"
          >
            <Calculator className="h-3.5 w-3.5" strokeWidth={1.7} />
            <span>{copy.technicalPanel.openFullRab}</span>
          </button>

          <button
            type="button"
            onClick={() => openModal('print-rab')}
            className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <Printer className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span>{copy.technicalPanel.openPrintView}</span>
          </button>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-studio-subtext">
        {copy.technicalPanel.disclaimer}
      </p>
    </div>
  );
}
