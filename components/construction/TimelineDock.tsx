'use client';

import React, { useEffect } from 'react';
import {
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CONSTRUCTION_STAGES } from '@/lib/catalog';
import { getCopy } from '@/lib/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { ConstructionStage } from '@/types/project';

export function TimelineDock() {
  const stage = useProjectStore((s) => s.project.scene.constructionStage);
  const setConstructionStage = useProjectStore((s) => s.setConstructionStage);

  const language = useUIStore((s) => s.language);
  const isPlaying = useUIStore((s) => s.isPlayingTimeline);
  const setIsPlaying = useUIStore((s) => s.setIsPlayingTimeline);
  const setLeftSidebar = useUIStore((s) => s.setLeftSidebar);
  const setMobileSheet = useUIStore((s) => s.setMobileSheet);
  const triggerCamera = useUIStore((s) => s.triggerCameraResetOrCustom);

  const copy = getCopy(language);
  const currentGuide = CONSTRUCTION_STAGES[stage] ?? CONSTRUCTION_STAGES[5];

  // Autoplay progression: stops deterministically at Stage 5
  useEffect(() => {
    if (!isPlaying) return;
    if (stage >= 5) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(() => {
      const next = Math.min(5, stage + 1) as ConstructionStage;
      setConstructionStage(next, false);
      if (next >= 5) {
        setIsPlaying(false);
      }
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [isPlaying, stage, setConstructionStage, setIsPlaying]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (stage >= 5) {
      setConstructionStage(0, false);
    }
    setIsPlaying(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setIsPlaying(false);
      setConstructionStage(Math.max(0, stage - 1) as ConstructionStage, true);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setIsPlaying(false);
      setConstructionStage(Math.min(5, stage + 1) as ConstructionStage, true);
    }
  };

  return (
    <div
      role="region"
      aria-label={language === 'id' ? 'Timeline Tahap Konstruksi' : 'Construction Stage Timeline'}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="no-print fixed bottom-16 lg:bottom-4 left-1/2 z-20 w-[calc(100vw-1.5rem)] max-w-lg lg:max-w-[410px] xl:max-w-xl -translate-x-1/2 rounded-xl border border-studio-border bg-studio-surface px-3 py-2.5 shadow-panel backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Play / Prev / Next Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePlayToggle}
            title={
              isPlaying
                ? copy.timeline.pause
                : stage >= 5
                ? copy.timeline.replay
                : copy.timeline.play
            }
            aria-label={
              isPlaying
                ? copy.timeline.pause
                : stage >= 5
                ? copy.timeline.replay
                : copy.timeline.play
            }
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[34px] items-center justify-center rounded-md bg-studio-accent text-studio-accentText transition-colors hover:bg-studio-accentHover"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" strokeWidth={1.8} />
            ) : stage >= 5 ? (
              <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <Play className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>

          <button
            type="button"
            disabled={stage === 0}
            onClick={() => {
              setIsPlaying(false);
              setConstructionStage(Math.max(0, stage - 1) as ConstructionStage, true);
            }}
            title={copy.timeline.prev}
            aria-label={copy.timeline.prev}
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[32px] items-center justify-center rounded-md border border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.7} />
          </button>

          <button
            type="button"
            disabled={stage === 5}
            onClick={() => {
              setIsPlaying(false);
              setConstructionStage(Math.min(5, stage + 1) as ConstructionStage, true);
            }}
            title={copy.timeline.next}
            aria-label={copy.timeline.next}
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-[32px] items-center justify-center rounded-md border border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>

        {/* Stage Label & Progress */}
        <div className="min-w-0 flex-1 px-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-studio-accent tabular-nums">
            <span>
              {copy.timeline.stagePrefix} {stage}/5
            </span>
          </div>
          <div className="truncate text-xs font-semibold text-studio-text">
            {language === 'id' ? currentGuide.titleId : currentGuide.titleEn}
          </div>
        </div>

        {/* Best Camera & Stage Guide Shortcuts */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => triggerCamera(currentGuide.recommendedCamera)}
            title={copy.timeline.bestCamera}
            aria-label={copy.timeline.bestCamera}
            className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[34px] sm:min-w-0 items-center justify-center gap-1 rounded-md border border-studio-border bg-studio-elevated px-2.5 py-1 text-xs font-medium text-studio-text hover:bg-studio-muted"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.6} />
            <span className="hidden md:inline">{copy.timeline.bestCamera}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setLeftSidebar(true, 'stage');
                setMobileSheet('left');
              } else {
                setLeftSidebar(true, 'stage');
              }
            }}
            title={copy.timeline.stageGuideBtn}
            aria-label={copy.timeline.stageGuideBtn}
            className="inline-flex lg:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-studio-border bg-studio-elevated text-studio-text hover:bg-studio-muted"
          >
            <BookOpen className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {/* Scrubber Slider + 6 Milestone Dots */}
      <div className="mt-2 flex items-center gap-2.5">
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={stage}
          onChange={(e) => {
            setIsPlaying(false);
            setConstructionStage(Number(e.target.value) as ConstructionStage, true);
          }}
          aria-label={
            language === 'id'
              ? `Penggeser tahap konstruksi, saat ini tahap ${stage} dari 5`
              : `Construction stage scrubber, currently stage ${stage} of 5`
          }
          className="h-2 w-full cursor-pointer accent-[var(--accent-terracotta)]"
        />
      </div>

      <div className="mt-1 hidden sm:grid grid-cols-6 text-[10px] text-studio-subtext">
        {CONSTRUCTION_STAGES.map((st) => (
          <button
            key={st.stage}
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setConstructionStage(st.stage, true);
            }}
            className={`truncate text-left transition-colors hover:text-studio-text ${
              st.stage === stage ? 'font-semibold text-studio-text' : ''
            } ${st.stage === 5 ? 'text-right' : st.stage > 0 ? 'text-center' : ''}`}
          >
            {st.stage}. {language === 'id' ? st.shortId : st.shortEn}
          </button>
        ))}
      </div>
    </div>
  );
}
