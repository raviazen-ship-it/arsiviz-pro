'use client';

import React from 'react';
import { Camera, CheckCircle2, Clock, FileCheck2, HardHat, Wrench } from 'lucide-react';
import { CONSTRUCTION_STAGES } from '@/lib/catalog';
import { getCopy } from '@/lib/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { ConstructionStage } from '@/types/project';

export function StageEducationPanel() {
  const activeStage = useProjectStore((s) => s.project.scene.constructionStage);
  const setConstructionStage = useProjectStore((s) => s.setConstructionStage);
  const language = useUIStore((s) => s.language);
  const triggerCamera = useUIStore((s) => s.triggerCameraResetOrCustom);
  const setMobileSheet = useUIStore((s) => s.setMobileSheet);

  const copy = getCopy(language);
  const guide = CONSTRUCTION_STAGES[activeStage] ?? CONSTRUCTION_STAGES[5];

  return (
    <div className="space-y-4">
      {/* Stage Selector Pills 0..5 */}
      <div className="grid grid-cols-6 gap-1 rounded-lg border border-studio-border bg-studio-muted/60 p-1">
        {CONSTRUCTION_STAGES.map((st) => {
          const selected = st.stage === activeStage;
          return (
            <button
              key={st.stage}
              type="button"
              onClick={() => setConstructionStage(st.stage as ConstructionStage, true)}
              aria-pressed={selected}
              className={`min-h-[38px] rounded-md text-xs font-semibold tabular-nums transition-colors ${
                selected
                  ? 'bg-studio-accent text-studio-accentText'
                  : 'text-studio-subtext hover:bg-studio-elevated hover:text-studio-text'
              }`}
            >
              {st.stage}
            </button>
          );
        })}
      </div>

      {/* Stage Title & Objective */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-studio-accent">
          {copy.timeline.stagePrefix} {guide.stage} {copy.timeline.ofFive}
        </div>
        <h3 className="mt-0.5 text-sm font-semibold text-studio-text">
          {language === 'id' ? guide.titleId : guide.titleEn}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-studio-subtext">
          {language === 'id' ? guide.purposeId : guide.purposeEn}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-studio-muted px-2.5 py-2 text-xs text-studio-text">
          <Clock className="h-3.5 w-3.5 shrink-0 text-studio-accent" strokeWidth={1.7} />
          <div>
            <span className="font-medium">{copy.stagePanel.duration}: </span>
            <span className="text-studio-subtext">
              {language === 'id' ? guide.durationId : guide.durationEn}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerCamera(guide.recommendedCamera);
            setMobileSheet(null);
          }}
          className="mt-3 inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-md border border-studio-borderStrong bg-studio-elevated px-3 py-1.5 text-xs font-medium text-studio-text hover:bg-studio-muted"
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{copy.stagePanel.focusCamera}</span>
        </button>
      </div>

      {/* Scope of Works */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-studio-text">
          <Wrench className="h-3.5 w-3.5 text-studio-accent" strokeWidth={1.7} />
          <span>{copy.stagePanel.works}</span>
        </h4>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-studio-subtext">
          {(language === 'id' ? guide.worksId : guide.worksEn).map((w, idx) => (
            <li key={`work-${idx}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-studio-accent" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Inspection Checklist */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-studio-text">
          <CheckCircle2 className="h-3.5 w-3.5 text-studio-sage" strokeWidth={1.7} />
          <span>{copy.stagePanel.checklist}</span>
        </h4>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-studio-subtext">
          {(language === 'id' ? guide.inspectionId : guide.inspectionEn).map((chk, idx) => (
            <li key={`chk-${idx}`} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-studio-sage" />
              <span>{chk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Permits & PBG / SLF Context */}
      <div className="rounded-lg border border-studio-border bg-studio-elevated p-3.5">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-studio-text">
          <FileCheck2 className="h-3.5 w-3.5 text-studio-text" strokeWidth={1.7} />
          <span>{copy.stagePanel.permits}</span>
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-studio-subtext">
          {language === 'id' ? guide.permitsId : guide.permitsEn}
        </p>
      </div>

      {/* Contractor Supervision Tip */}
      <div className="rounded-lg border border-studio-border bg-studio-sageBg p-3.5">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold text-studio-text">
          <HardHat className="h-3.5 w-3.5 text-studio-sage" strokeWidth={1.7} />
          <span>{copy.stagePanel.supervision}</span>
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-studio-text/90">
          {language === 'id' ? guide.supervisionTipId : guide.supervisionTipEn}
        </p>
      </div>
    </div>
  );
}
