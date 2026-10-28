'use client';

import React from 'react';
import { Compass, Layers } from 'lucide-react';
import { CONSTRUCTION_STAGES, HOUSE_SPECS } from '@/lib/catalog';
import { formatArea, formatMeters } from '@/lib/format';
import { getCopy } from '@/lib/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';

interface FallbackSchematic2DProps {
  reason?: string;
}

export function FallbackSchematic2D({ reason }: FallbackSchematic2DProps) {
  const project = useProjectStore((s) => s.project);
  const language = useUIStore((s) => s.language);
  const copy = getCopy(language);

  const { dimensions, materials, addons, houseType, scene } = project;
  const spec = HOUSE_SPECS[houseType];
  const stageInfo = CONSTRUCTION_STAGES[scene.constructionStage];

  const maxDim = Math.max(dimensions.landWidth, dimensions.landLength, 1);
  const scale = 260 / maxDim;
  const plotW = dimensions.landWidth * scale;
  const plotL = dimensions.landLength * scale;
  const bldgW = dimensions.buildingWidth * scale;
  const bldgL = dimensions.buildingLength * scale;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-studio-bg px-4 py-16">
      <div className="max-w-xl w-full rounded-xl border border-studio-border bg-studio-elevated p-5 shadow-panel">
        <div className="flex items-start justify-between gap-3 border-b border-studio-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-studio-text">
              {copy.viewport.webglUnavailableTitle}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-studio-subtext">
              {reason || copy.viewport.webglUnavailableDesc}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-studio-muted px-2.5 py-1 text-xs font-medium text-studio-text">
            <Compass className="h-3.5 w-3.5" strokeWidth={1.6} />
            {dimensions.orientation}°
          </span>
        </div>

        {/* Proportional Architectural 2D Plan SVG */}
        <div className="my-4 flex items-center justify-center rounded-lg border border-studio-border bg-studio-muted/50 p-4">
          <svg
            width="320"
            height="300"
            viewBox="0 0 320 300"
            role="img"
            aria-label={language === 'id' ? 'Denah skematik kavling dan rumah' : 'Scaled plot and house plan'}
          >
            {/* Plot Rectangle */}
            <rect
              x={(320 - plotW) / 2}
              y={(300 - plotL) / 2}
              width={plotW}
              height={plotL}
              fill="#D9DFD2"
              stroke="#58635B"
              strokeWidth="2"
              strokeDasharray={scene.constructionStage === 0 ? '6 4' : undefined}
            />

            {/* Building Footprint */}
            {scene.constructionStage >= 1 && (
              <rect
                x={(320 - bldgW) / 2}
                y={(300 - plotL) / 2 + (plotL - bldgL) * 0.35}
                width={bldgW}
                height={bldgL}
                fill={scene.constructionStage >= 4 ? materials.facadeColor : '#C7B8AC'}
                stroke="#202522"
                strokeWidth="2"
              />
            )}

            {/* Japandi Inner Courtyard Void */}
            {houseType === 'japandi-compact' && scene.constructionStage >= 2 && (
              <rect
                x={(320 - bldgW * 0.3) / 2}
                y={(300 - plotL) / 2 + (plotL - bldgL) * 0.35 + bldgL * 0.35}
                width={bldgW * 0.3}
                height={bldgL * 0.3}
                fill="#BFD3B8"
                stroke="#202522"
                strokeWidth="1.2"
              />
            )}

            {/* Swimming Pool Indicator */}
            {addons.swimmingPool && scene.constructionStage >= 5 && (
              <rect
                x={(320 - plotW) / 2 + 12}
                y={(300 + plotL) / 2 - 44}
                width={Math.min(58, plotW * 0.36)}
                height={32}
                rx="3"
                fill="#59B7C7"
                stroke="#2C6975"
                strokeWidth="1.5"
              />
            )}

            {/* Carport Indicator */}
            {addons.carport && scene.constructionStage >= 5 && (
              <rect
                x={(320 + plotW) / 2 - Math.min(62, plotW * 0.38) - 12}
                y={(300 + plotL) / 2 - 52}
                width={Math.min(62, plotW * 0.38)}
                height={42}
                fill="#8D9490"
                stroke="#434A46"
                strokeWidth="1.5"
              />
            )}

            {/* Dimension Labels */}
            <text x="160" y="18" textAnchor="middle" fontSize="11" fill="currentColor">
              {formatMeters(dimensions.landWidth, language)} × {formatMeters(dimensions.landLength, language)}
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-md border border-studio-border p-2">
            <div className="text-studio-subtext">{language === 'id' ? 'Tipe' : 'Type'}</div>
            <div className="mt-0.5 font-medium text-studio-text">
              {language === 'id' ? spec.nameId : spec.nameEn}
            </div>
          </div>
          <div className="rounded-md border border-studio-border p-2">
            <div className="text-studio-subtext">{language === 'id' ? 'Luas Lahan' : 'Plot Area'}</div>
            <div className="mt-0.5 font-medium tabular-nums text-studio-text">
              {formatArea(dimensions.landWidth * dimensions.landLength, language)}
            </div>
          </div>
          <div className="rounded-md border border-studio-border p-2">
            <div className="text-studio-subtext">{language === 'id' ? 'Bangunan' : 'Building'}</div>
            <div className="mt-0.5 font-medium tabular-nums text-studio-text">
              {formatArea(
                dimensions.buildingWidth * dimensions.buildingLength * dimensions.floors,
                language
              )}{' '}
              ({dimensions.floors}F)
            </div>
          </div>
          <div className="rounded-md border border-studio-border p-2">
            <div className="flex items-center gap-1 text-studio-subtext">
              <Layers className="h-3 w-3" />
              {language === 'id' ? 'Tahap Aktif' : 'Stage'}
            </div>
            <div className="mt-0.5 font-medium text-studio-text">
              {scene.constructionStage}/5 {language === 'id' ? stageInfo.shortId : stageInfo.shortEn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
