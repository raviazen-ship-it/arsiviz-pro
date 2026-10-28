'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { ModalDialog } from '@/components/layout/ModalDialog';
import { HOUSE_SPECS } from '@/lib/catalog';
import { formatMeters } from '@/lib/format';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { HouseType } from '@/types/project';

export function CatalogModal() {
  const project = useProjectStore((s) => s.project);
  const setHouseType = useProjectStore((s) => s.setHouseType);
  const updateDimensions = useProjectStore((s) => s.updateDimensions);
  const updateMaterials = useProjectStore((s) => s.updateMaterials);

  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const language = useUIStore((s) => s.language);
  const addToast = useUIStore((s) => s.addToast);

  return (
    <ModalDialog
      open={activeModal === 'catalog'}
      onClose={closeModal}
      title={language === 'id' ? 'Katalog Empat Geometri Tipe Rumah' : 'Four Architectural Typologies'}
      subtitle={
        language === 'id'
          ? 'Setiap tipe membangun geometri 3D, bentuk atap, dan karakter struktur yang berbeda secara nyata di Studio.'
          : 'Each typology constructs a genuinely distinct 3D massing, roof system, and structural frame in the Studio.'
      }
      maxWidthClass="max-w-4xl"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(Object.keys(HOUSE_SPECS) as HouseType[]).map((key) => {
          const spec = HOUSE_SPECS[key];
          const isCurrent = project.houseType === key;

          return (
            <div
              key={key}
              className={`flex flex-col justify-between rounded-xl border p-4 ${
                isCurrent
                  ? 'border-studio-accent bg-studio-elevated ring-1 ring-studio-accent'
                  : 'border-studio-border bg-studio-elevated'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-studio-text">
                      {language === 'id' ? spec.nameId : spec.nameEn}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-studio-accent">
                      {language === 'id' ? spec.roofFormId : spec.roofFormEn}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded bg-studio-sageBg px-2 py-0.5 text-[11px] font-semibold text-studio-sage">
                      <Check className="h-3 w-3" />
                      {language === 'id' ? 'Aktif' : 'Active'}
                    </span>
                  )}
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-studio-subtext">
                  {language === 'id' ? spec.descriptionId : spec.descriptionEn}
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-studio-muted/60 p-2.5 text-[11px]">
                  <div>
                    <dt className="text-studio-subtext">
                      {language === 'id' ? 'Kavling Ideal' : 'Suggested Plot'}
                    </dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatMeters(spec.defaultDimensions.landWidth, language)} ×{' '}
                      {formatMeters(spec.defaultDimensions.landLength, language)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-studio-subtext">
                      {language === 'id' ? 'Konfigurasi Awal' : 'Signature Massing'}
                    </dt>
                    <dd className="font-semibold tabular-nums text-studio-text">
                      {formatMeters(spec.defaultDimensions.buildingWidth, language)} ×{' '}
                      {formatMeters(spec.defaultDimensions.buildingLength, language)} ·{' '}
                      {spec.defaultDimensions.floors}F
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const notice = setHouseType(key);
                    const notes =
                      language === 'id' ? notice.adjustedNotesId : notice.adjustedNotesEn;
                    addToast(
                      'success',
                      notes[0] ||
                        (language === 'id'
                          ? `Geometri diubah ke ${spec.nameId}.`
                          : `Switched geometry to ${spec.nameEn}.`)
                    );
                    closeModal();
                  }}
                  className="min-h-[38px] flex-1 rounded-md bg-studio-accent px-3 py-1.5 text-xs font-semibold text-studio-accentText hover:bg-studio-accentHover"
                >
                  {language === 'id' ? 'Gunakan Geometri Ini' : 'Apply Geometry'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setHouseType(key);
                    updateDimensions(spec.defaultDimensions);
                    updateMaterials(spec.defaultMaterials);
                    addToast(
                      'success',
                      language === 'id'
                        ? `${spec.nameId} beserta ukuran & palet rekomendasinya diterapkan.`
                        : `Applied ${spec.nameEn} with recommended plot & palette.`
                    );
                    closeModal();
                  }}
                  className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
                >
                  <Sparkles className="h-3.5 w-3.5 text-studio-accent" />
                  <span>{language === 'id' ? 'Paket Lengkap' : 'Full Preset'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ModalDialog>
  );
}
