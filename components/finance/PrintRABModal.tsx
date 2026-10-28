'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, X } from 'lucide-react';
import {
  ACCENT_MATERIALS,
  ADDON_SPECS,
  checkAddonCompatibility,
  FLOOR_MATERIALS,
  HOUSE_SPECS,
  ROOF_MATERIALS,
} from '@/lib/catalog';
import { formatArea, formatDateTime, formatIDR, formatMeters } from '@/lib/format';
import { calculateRAB } from '@/lib/rab';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

export function PrintRABModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  if (activeModal !== 'print-rab') return null;
  return <PrintRABDocument />;
}

function PrintRABDocument() {
  const project = useProjectStore((s) => s.project);
  const closeModal = useUIStore((s) => s.closeModal);
  const openModal = useUIStore((s) => s.openModal);
  const language = useUIStore((s) => s.language);
  const snapshotProvider = useUIStore((s) => s.snapshotProvider);

  const [snapshotUrl] = useState<string | undefined>(() => {
    const liveSnap = snapshotProvider ? snapshotProvider() : undefined;
    return liveSnap || project.thumbnailDataUrl;
  });
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeModal]);

  const rab = calculateRAB(project);
  const houseSpec = HOUSE_SPECS[project.houseType];
  const roofSpec = ROOF_MATERIALS.find((r) => r.id === project.materials.roofMaterial);
  const accentSpec = ACCENT_MATERIALS.find((a) => a.id === project.materials.accentMaterial);
  const floorSpec = FLOOR_MATERIALS.find((f) => f.id === project.materials.floorMaterial);

  const activeAddons = ADDON_SPECS.filter(
    (a) =>
      project.addons[a.key] &&
      checkAddonCompatibility(a.key, project.houseType, project.dimensions).supported
  );

  return (
    <div className="print-only-container fixed inset-0 z-50 overflow-y-auto bg-studio-bg p-4 sm:p-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-studio-border bg-white p-6 sm:p-10 text-[#181C19] shadow-modal print:shadow-none print:border-none print:p-0">
        {/* Top Action Bar (Hidden when printing) */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={() => openModal('finance', 'rab')}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>
              {language === 'id' ? 'Kembali ke Kalkulator RAB' : 'Back to RAB Calculator'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-md bg-[#C25438] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#A9452B]"
            >
              <Printer className="h-4 w-4" />
              <span>
                {language === 'id' ? 'Cetak / Simpan sebagai PDF' : 'Print / Save as PDF'}
              </span>
            </button>
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close print view"
              className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Document Header */}
        <div className="flex flex-col justify-between gap-4 border-b-2 border-gray-900 pb-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#C25438]">
              ARSIVIZ PRO v2.0 ·{' '}
              {language === 'id'
                ? 'DOKUMEN SIMULASI KONSEPTUAL'
                : 'CONCEPTUAL SIMULATION REPORT'}
            </div>
            <h1 className="mt-1 text-xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-0.5 text-xs text-gray-600">
              {language === 'id' ? 'Pembaruan Konfigurasi' : 'Configuration Timestamp'}:{' '}
              {formatDateTime(project.updatedAt, language)}
            </p>
          </div>

          <div className="rounded border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
            {language === 'id'
              ? 'ESTIMASI SIMULASI AWAL - BUKAN PENAWARAN RESMI KONTRAKTOR'
              : 'PRELIMINARY SIMULATION ESTIMATE - NOT A BINDING CONTRACTOR QUOTE'}
          </div>
        </div>

        {/* Snapshot + Specification Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          {snapshotUrl && !imgFailed && (
            <div className="md:col-span-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshotUrl}
                alt={project.name}
                onError={() => setImgFailed(true)}
                className="h-48 w-full rounded-lg border border-gray-200 object-cover"
              />
            </div>
          )}

          <div
            className={
              snapshotUrl && !imgFailed ? 'md:col-span-7' : 'md:col-span-12'
            }
          >
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-700">
              {language === 'id' ? 'Ringkasan Spesifikasi Rumah' : 'Architectural Specifications'}
            </h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-200 pt-2 text-xs">
              <div>
                <dt className="text-gray-500">{language === 'id' ? 'Tipe Rumah' : 'Typology'}</dt>
                <dd className="font-semibold text-gray-900">
                  {language === 'id' ? houseSpec.nameId : houseSpec.nameEn}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">
                  {language === 'id' ? 'Ukuran Lahan' : 'Plot Size'}
                </dt>
                <dd className="font-semibold tabular-nums text-gray-900">
                  {formatMeters(project.dimensions.landWidth, language)} ×{' '}
                  {formatMeters(project.dimensions.landLength, language)} (
                  {formatArea(rab.landArea, language)})
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">
                  {language === 'id' ? 'Luas Bangunan' : 'Gross Floor Area'}
                </dt>
                <dd className="font-semibold tabular-nums text-gray-900">
                  {formatArea(rab.grossFloorArea, language)} ({project.dimensions.floors}{' '}
                  {language === 'id' ? 'Lantai' : 'Stories'})
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">
                  {language === 'id' ? 'Warna Fasad & Aksen' : 'Facade & Accent'}
                </dt>
                <dd className="font-semibold text-gray-900">
                  {project.materials.facadeColor.toUpperCase()} +{' '}
                  {language === 'id' ? accentSpec?.nameId : accentSpec?.nameEn}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">
                  {language === 'id' ? 'Atap & Lantai' : 'Roof & Flooring'}
                </dt>
                <dd className="font-semibold text-gray-900">
                  {language === 'id' ? roofSpec?.nameId : roofSpec?.nameEn} ·{' '}
                  {language === 'id' ? floorSpec?.nameId : floorSpec?.nameEn}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">
                  {language === 'id' ? 'Add-on Aktif' : 'Active Add-ons'}
                </dt>
                <dd className="font-semibold text-gray-900">
                  {activeAddons.length > 0
                    ? activeAddons
                        .map((a) => (language === 'id' ? a.nameId : a.nameEn))
                        .join(', ')
                    : language === 'id'
                    ? 'Standar tanpa add-on'
                    : 'Base build'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bill of Quantities Table */}
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-700">
            {language === 'id'
              ? 'Rincian Anggaran Biaya (Bill of Quantities)'
              : 'Bill of Quantities Breakdown'}
          </h2>
          <table className="w-full border-collapse border border-gray-300 text-left text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border border-gray-300 px-3 py-2 font-semibold">
                  {language === 'id' ? 'Uraian Pekerjaan' : 'Item Description'}
                </th>
                <th className="border border-gray-300 px-2.5 py-2 text-right font-semibold">
                  {language === 'id' ? 'Volume' : 'Qty'}
                </th>
                <th className="border border-gray-300 px-2.5 py-2 font-semibold">
                  {language === 'id' ? 'Satuan' : 'Unit'}
                </th>
                <th className="border border-gray-300 px-2.5 py-2 text-right font-semibold">
                  {language === 'id' ? 'Harga Satuan' : 'Unit Rate'}
                </th>
                <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {rab.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="font-semibold text-gray-900">
                      {language === 'id' ? item.titleId : item.titleEn}
                    </div>
                    <div className="text-[11px] text-gray-600">
                      {language === 'id' ? item.basisId : item.basisEn}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2.5 py-2 text-right tabular-nums text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-2.5 py-2 text-gray-700">
                    {language === 'id' ? item.unitId : item.unitEn}
                  </td>
                  <td className="border border-gray-300 px-2.5 py-2 text-right tabular-nums text-gray-700">
                    {formatIDR(item.unitPrice, language)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-semibold tabular-nums text-gray-900">
                    {formatIDR(item.subtotal, language)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-gray-900">
                <td colSpan={4} className="border border-gray-300 px-3 py-2 text-right">
                  {language === 'id' ? 'Subtotal Pekerjaan Fisik' : 'Physical Works Subtotal'}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right tabular-nums">
                  {formatIDR(rab.physicalSubtotal, language)}
                </td>
              </tr>
              <tr className="bg-gray-100 font-bold text-gray-950">
                <td colSpan={4} className="border border-gray-300 px-3 py-2.5 text-right">
                  {language === 'id'
                    ? `TOTAL ESTIMASI SIMULASI (Termasuk Contingency ${rab.contingencyPercent}%)`
                    : `TOTAL SIMULATED ESTIMATE (Incl. ${rab.contingencyPercent}% Contingency)`}
                </td>
                <td className="border border-gray-300 px-3 py-2.5 text-right text-sm tabular-nums">
                  {formatIDR(rab.totalEstimatedCost, language)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Assumptions & Exclusions Footer */}
        <div className="mt-6 rounded border border-gray-300 bg-gray-50 p-4 text-[11px] leading-relaxed text-gray-700">
          <p className="font-bold text-gray-900">
            {language === 'id'
              ? 'Catatan Penting, Asumsi & Pengecualian:'
              : 'Important Notes, Assumptions & Exclusions:'}
          </p>
          <p className="mt-1">
            {language === 'id'
              ? '1. Dokumen ini dihasilkan oleh simulator ArsiViz Pro berdasarkan formula volumetrik konseptual dan BUKAN penawaran harga kontraktor, dokumen tender, maupun perhitungan struktur resmi. 2. Estimasi belum termasuk biaya pembelian tanah, pajak (PPN/BPHTB), biaya retribusi PBG/SLF daerah, penyambungan daya PLN/PDAM resmi, penyelidikan tanah (sondir), serta pekerjaan dinding penahan tanah khusus pada lahan miring. 3. Wajib diverifikasi bersama arsitek berlisensi, insinyur sipil, dan kontraktor pelaksana di kota proyek Anda.'
              : '1. Generated by ArsiViz Pro from conceptual volumetric assumptions; this document is NOT a binding contractor quotation, tender BoQ, or stamped engineering calculation. 2. Excludes land acquisition, VAT/transfer taxes, municipal PBG/SLF permit fees, utility hookup charges, geotechnical soil testing, and retaining walls for sloped terrain. 3. Verify all quantities and structural specifications with licensed professionals in your region.'}
          </p>
        </div>
      </div>
    </div>
  );
}
