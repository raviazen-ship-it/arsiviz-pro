'use client';

import React, { useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { FLOOR_MATERIALS } from '@/lib/catalog';
import { getFloorTexture } from '@/lib/proceduralTextures';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { SelectedElementInfo } from '@/types/project';
import { InteriorAndAddons } from './InteriorAndAddons';
import { RoofAndTypeFeatures } from './RoofAndTypeFeatures';

export function ArchitecturalHouse() {
  const project = useProjectStore((s) => s.project);
  const setSelectedElement = useUIStore((s) => s.setSelectedElement);

  const { dimensions, materials, houseType, scene } = project;
  const stage = scene.constructionStage;
  const cutaway = scene.cutaway;
  const {
    landWidth: lw,
    landLength: ll,
    buildingWidth: bw,
    buildingLength: bl,
    floors,
    orientation,
  } = dimensions;

  const floorH = houseType === 'industrial-loft' ? 3.4 : 3.1;
  const frontSetback = Math.max(1.2, (ll - bl) * 0.65);
  const rearSetback = ll - bl - frontSetback;
  const buildingCenterZ = (rearSetback - frontSetback) / 2;

  const isEvening = scene.sunTime >= 17.5 || scene.sunTime <= 6.5;
  const isJapandi = houseType === 'japandi-compact';

  const floorTex = useMemo(
    () => getFloorTexture(materials.floorMaterial),
    [materials.floorMaterial]
  );
  const floorSpec =
    FLOOR_MATERIALS.find((m) => m.id === materials.floorMaterial) ?? FLOOR_MATERIALS[0];

  // Raycast click handler that ignores camera orbit drags (delta > 5px)
  const handleSelect = (e: ThreeEvent<MouseEvent>, info: SelectedElementInfo) => {
    if (e.delta > 5) return;
    e.stopPropagation();
    setSelectedElement(info);
  };

  // Wall appearance: Stage 3 shows unplastered brick/block masonry; Stage 4+ shows painted render
  const wallColor = stage >= 4 ? materials.facadeColor : '#B68A79';
  const interiorWallColor = stage >= 4 ? '#EFEDE6' : '#B9B1A8';

  const orientationRadians = ((orientation ?? 0) * Math.PI) / 180;

  return (
    <group rotation={[0, orientationRadians, 0]}>
      {/* =========================================================
          STAGE 0: PLOT TERRAIN, BOUNDARY CURB, & BOUWPLANK BATTER BOARDS
         ========================================================= */}
      <group>
        {/* Plot Lawn / Earth Pad */}
        <mesh
          position={[0, -0.06, 0]}
          receiveShadow
          onClick={(e) =>
            handleSelect(e, {
              id: 'site-plot',
              labelId: `Kavling Lahan (${lw} × ${ll} m)`,
              labelEn: `Site Plot (${lw} × ${ll} m)`,
              stage: 0,
              categoryId: 'Pra-Konstruksi & Lahan',
              categoryEn: 'Site Preparation',
              materialNoteId: 'Batas lahan efektif tempat perhitungan KDB dan jarak bebas bangunan.',
              materialNoteEn: 'Legal plot boundary governing building footprint and setbacks.',
              editTargetTab: 'dimensions',
            })
          }
        >
          <boxGeometry args={[lw, 0.12, ll]} />
          <meshStandardMaterial
            color={stage === 0 ? '#C9BFA9' : stage >= 5 ? '#9DB18C' : '#C2BAAC'}
            roughness={0.94}
          />
        </mesh>

        {/* Subtle Plot Perimeter Curb */}
        {[
          { pos: [0, 0.02, ll / 2] as [number, number, number], size: [lw + 0.08, 0.06, 0.08] as [number, number, number] },
          { pos: [0, 0.02, -ll / 2] as [number, number, number], size: [lw + 0.08, 0.06, 0.08] as [number, number, number] },
          { pos: [-lw / 2, 0.02, 0] as [number, number, number], size: [0.08, 0.06, ll] as [number, number, number] },
          { pos: [lw / 2, 0.02, 0] as [number, number, number], size: [0.08, 0.06, ll] as [number, number, number] },
        ].map((b, i) => (
          <mesh key={`plot-curb-${i}`} position={b.pos} receiveShadow>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color="#8A908A" roughness={0.85} />
          </mesh>
        ))}

        {/* Bouwplank (Wooden Batter Boards & Axis Cord) visible during Stages 0 & 1 */}
        {stage <= 1 && (
          <group
            position={[0, 0, buildingCenterZ]}
            onClick={(e) =>
              handleSelect(e, {
                id: 'bouwplank',
                labelId: 'Patok & Papan Bouwplank',
                labelEn: 'Wooden Batter Boards (Bouwplank)',
                stage: 0,
                categoryId: 'Pra-Konstruksi & Pengukuran',
                categoryEn: 'Site Setting-Out',
                materialNoteId: 'Papan acuan tarikan benang siku as pondasi dan elevasi +0.00 lantai.',
                materialNoteEn: 'Corner reference boards holding string lines for orthogonal wall axes.',
              })
            }
          >
            {[
              [-bw / 2 - 0.55, bl / 2 + 0.55, 1, 1],
              [bw / 2 + 0.55, bl / 2 + 0.55, -1, 1],
              [-bw / 2 - 0.55, -bl / 2 - 0.55, 1, -1],
              [bw / 2 + 0.55, -bl / 2 - 0.55, -1, -1],
            ].map(([cx, cz, sx, sz], idx) => (
              <group key={`bp-corner-${idx}`} position={[cx, 0, cz]}>
                {/* Corner Stakes */}
                <mesh position={[0, 0.32, 0]} castShadow>
                  <boxGeometry args={[0.07, 0.65, 0.07]} />
                  <meshStandardMaterial color="#A97B50" roughness={0.8} />
                </mesh>
                <mesh position={[sx * 0.9, 0.32, 0]} castShadow>
                  <boxGeometry args={[0.07, 0.65, 0.07]} />
                  <meshStandardMaterial color="#A97B50" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.32, sz * 0.9]} castShadow>
                  <boxGeometry args={[0.07, 0.65, 0.07]} />
                  <meshStandardMaterial color="#A97B50" roughness={0.8} />
                </mesh>
                {/* Horizontal Bouwplank Boards */}
                <mesh position={[sx * 0.45, 0.52, 0]} castShadow>
                  <boxGeometry args={[0.98, 0.12, 0.03]} />
                  <meshStandardMaterial color="#C89B6E" roughness={0.75} />
                </mesh>
                <mesh position={[0, 0.52, sz * 0.45]} castShadow>
                  <boxGeometry args={[0.03, 0.12, 0.98]} />
                  <meshStandardMaterial color="#C89B6E" roughness={0.75} />
                </mesh>
              </group>
            ))}

            {/* Setting-Out String Axis Lines */}
            <mesh position={[0, 0.54, bl / 2]}>
              <boxGeometry args={[bw + 1.1, 0.015, 0.015]} />
              <meshBasicMaterial color="#D95338" />
            </mesh>
            <mesh position={[0, 0.54, -bl / 2]}>
              <boxGeometry args={[bw + 1.1, 0.015, 0.015]} />
              <meshBasicMaterial color="#D95338" />
            </mesh>
            <mesh position={[-bw / 2, 0.54, 0]}>
              <boxGeometry args={[0.015, 0.015, bl + 1.1]} />
              <meshBasicMaterial color="#D95338" />
            </mesh>
            <mesh position={[bw / 2, 0.54, 0]}>
              <boxGeometry args={[0.015, 0.015, bl + 1.1]} />
              <meshBasicMaterial color="#D95338" />
            </mesh>
          </group>
        )}
      </group>

      {/* =========================================================
          STAGE 1: FOUNDATION, FOOTINGS (CAKAR AYAM), & TIE BEAMS (SLOOF)
         ========================================================= */}
      {stage >= 1 && (
        <group
          position={[0, 0, buildingCenterZ]}
          onClick={(e) =>
            handleSelect(e, {
              id: 'foundation-sloof',
              labelId: 'Pondasi Tapak & Balok Sloof Beton',
              labelEn: 'Pad Footings & Concrete Tie Beams (Sloof)',
              stage: 1,
              categoryId: 'Pondasi & Struktur Bawah',
              categoryEn: 'Substructure & Foundation',
              materialNoteId:
                'Tapak beton bertulang (cakar ayam), pasangan batu kali, dan balok sloof pengikat.',
              materialNoteEn:
                'Reinforced concrete pad footings, stone strip plinth, and perimeter tie beams.',
            })
          }
        >
          {/* Excavated Soil Bed visible in Stage 1 */}
          {stage === 1 && (
            <mesh position={[0, 0.01, 0]} receiveShadow>
              <boxGeometry args={[bw + 0.7, 0.04, bl + 0.7]} />
              <meshStandardMaterial color="#8A725A" roughness={0.95} />
            </mesh>
          )}

          {/* 9 Pad Footings (Cakar Ayam) at Grid Intersections */}
          {[-bw / 2, 0, bw / 2].map((fx, xi) =>
            [-bl / 2, 0, bl / 2].map((fz, zi) => {
              if (isJapandi && xi === 1 && zi === 1) return null;
              return (
                <group key={`footing-${xi}-${zi}`} position={[fx, 0.06, fz]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.78, 0.14, 0.78]} />
                    <meshStandardMaterial color="#7B827E" roughness={0.88} />
                  </mesh>
                  {/* Column Rebar Starter Stub in Stage 1 */}
                  {stage === 1 && (
                    <mesh position={[0, 0.25, 0]} castShadow>
                      <boxGeometry args={[0.2, 0.36, 0.2]} />
                      <meshStandardMaterial color="#585E61" metalness={0.5} roughness={0.5} />
                    </mesh>
                  )}
                </group>
              );
            })
          )}

          {/* Perimeter & Cross Concrete Sloof Beams */}
          {[
            { pos: [0, 0.11, bl / 2] as [number, number, number], size: [bw + 0.18, 0.22, 0.24] as [number, number, number] },
            { pos: [0, 0.11, -bl / 2] as [number, number, number], size: [bw + 0.18, 0.22, 0.24] as [number, number, number] },
            { pos: [-bw / 2, 0.11, 0] as [number, number, number], size: [0.24, 0.22, bl + 0.18] as [number, number, number] },
            { pos: [bw / 2, 0.11, 0] as [number, number, number], size: [0.24, 0.22, bl + 0.18] as [number, number, number] },
            { pos: [0, 0.11, -bl * 0.16] as [number, number, number], size: [bw, 0.2, 0.2] as [number, number, number] },
            { pos: [bw * 0.16, 0.11, 0] as [number, number, number], size: [0.2, 0.2, bl] as [number, number, number] },
          ].map((s, idx) => (
            <mesh key={`sloof-${idx}`} position={s.pos} castShadow receiveShadow>
              <boxGeometry args={s.size} />
              <meshStandardMaterial color="#878E8A" roughness={0.85} />
            </mesh>
          ))}
        </group>
      )}

      {/* =========================================================
          STAGE 2: PRIMARY STRUCTURE (FLOOR SLABS, COLUMNS, RING BEAMS)
         ========================================================= */}
      {stage >= 2 && (
        <group position={[0, 0, buildingCenterZ]}>
          {/* Ground Structural Concrete Slab */}
          <mesh
            position={[0, 0.15, 0]}
            receiveShadow
            castShadow
            onClick={(e) =>
              handleSelect(e, {
                id: 'ground-slab',
                labelId: 'Plat Lantai Dasar Beton',
                labelEn: 'Ground Structural Concrete Slab',
                stage: 2,
                categoryId: 'Struktur Utama',
                categoryEn: 'Primary Structure',
                materialNoteId: 'Plat lantai beton di atas urugan padat dan balok sloof.',
                materialNoteEn: 'Reinforced concrete ground slab cast over compacted base.',
              })
            }
          >
            <boxGeometry args={[bw, 0.12, bl]} />
            <meshStandardMaterial color="#9BA19E" roughness={0.82} />
          </mesh>

          {/* Structural Columns & Ring Beams per Story */}
          {Array.from({ length: floors }).map((_, fIdx) => {
            const baseLevelY = 0.18 + fIdx * floorH;
            const isUpperCut = cutaway && (fIdx === 1 || true);
            return (
              <group key={`struct-story-${fIdx}`}>
                {/* Modular Columns */}
                {[-bw / 2 + 0.11, 0, bw / 2 - 0.11].map((cx, xi) =>
                  [-bl / 2 + 0.11, 0, bl / 2 - 0.11].map((cz, zi) => {
                    if (isJapandi && xi === 1 && zi === 1) return null;
                    const sliceLow = isUpperCut && (cz > 0 || cx > 0);
                    const colH = sliceLow ? 0.95 : floorH;
                    return (
                      <mesh
                        key={`col-${fIdx}-${xi}-${zi}`}
                        position={[cx, baseLevelY + colH / 2, cz]}
                        castShadow
                        receiveShadow
                        onClick={(e) =>
                          handleSelect(e, {
                            id: `col-${fIdx}`,
                            labelId:
                              houseType === 'industrial-loft'
                                ? 'Kolom Struktur Baja'
                                : 'Kolom Struktur Beton Bertulang',
                            labelEn:
                              houseType === 'industrial-loft'
                                ? 'Structural Steel Column'
                                : 'Reinforced Concrete Column',
                            stage: 2,
                            categoryId: 'Struktur Utama',
                            categoryEn: 'Primary Structure',
                            materialNoteId: 'Kolom pemikul beban vertikal dan kekakuan portal gempa.',
                            materialNoteEn: 'Load-bearing structural column resisting gravity and lateral loads.',
                          })
                        }
                      >
                        <boxGeometry args={[0.22, colH, 0.22]} />
                        <meshStandardMaterial
                          color={houseType === 'industrial-loft' ? '#2A2F33' : '#929895'}
                          roughness={0.75}
                        />
                      </mesh>
                    );
                  })
                )}

                {/* Ring Beams (hidden on front/right when Cutaway is active) */}
                {!cutaway && (
                  <group position={[0, baseLevelY + floorH - 0.12, 0]}>
                    <mesh position={[0, 0, bl / 2 - 0.1]} castShadow>
                      <boxGeometry args={[bw, 0.24, 0.2]} />
                      <meshStandardMaterial color="#8F9692" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 0, -bl / 2 + 0.1]} castShadow>
                      <boxGeometry args={[bw, 0.24, 0.2]} />
                      <meshStandardMaterial color="#8F9692" roughness={0.8} />
                    </mesh>
                    <mesh position={[-bw / 2 + 0.1, 0, 0]} castShadow>
                      <boxGeometry args={[0.2, 0.24, bl]} />
                      <meshStandardMaterial color="#8F9692" roughness={0.8} />
                    </mesh>
                    <mesh position={[bw / 2 - 0.1, 0, 0]} castShadow>
                      <boxGeometry args={[0.2, 0.24, bl]} />
                      <meshStandardMaterial color="#8F9692" roughness={0.8} />
                    </mesh>
                  </group>
                )}

                {/* Second Floor Structural Slab (when floors === 2, positioned at top of ground story) */}
                {floors === 2 && fIdx === 0 && (
                  <group position={[0, baseLevelY + floorH, 0]}>
                    {/* In cutaway mode, render rear/right L-portion of 2nd slab so ground living room stays visible too */}
                    <mesh
                      position={[cutaway ? bw * 0.18 : 0, 0, 0]}
                      castShadow
                      receiveShadow
                      onClick={(e) =>
                        handleSelect(e, {
                          id: 'second-slab',
                          labelId: 'Plat Beton Lantai 2',
                          labelEn: 'Second-Floor Concrete Slab',
                          stage: 2,
                          categoryId: 'Struktur Utama (2 Lantai)',
                          categoryEn: 'Primary 2-Story Structure',
                          materialNoteId: 'Plat lantai beton bertulang pemisah ruang lantai 1 dan lantai 2.',
                          materialNoteEn: 'Suspended reinforced concrete slab supporting upper rooms.',
                          editTargetTab: 'dimensions',
                        })
                      }
                    >
                      <boxGeometry args={[cutaway ? bw * 0.62 : bw - 0.08, 0.16, bl - 0.08]} />
                      <meshStandardMaterial color="#9BA19E" roughness={0.8} />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      )}

      {/* =========================================================
          STAGE 3 & 4: MASONRY WALLS, WINDOW OPENINGS, GLAZING, & MEP ROUGH-IN
         ========================================================= */}
      {stage >= 3 && (
        <group position={[0, 0, buildingCenterZ]}>
          {Array.from({ length: floors }).map((_, fIdx) => {
            const baseY = 0.18 + fIdx * floorH;
            const fullWallH = floorH - 0.08;
            const cutWallH = 0.95;

            const rearH = fullWallH;
            const leftH = fullWallH;
            const frontH = cutaway ? cutWallH : fullWallH;
            const rightH = cutaway ? cutWallH : fullWallH;

            return (
              <group key={`walls-story-${fIdx}`} position={[0, baseY, 0]}>
                {/* REAR WALL (-Z) - Full height even in cutaway for architectural backdrop */}
                <mesh
                  position={[0, rearH / 2, -bl / 2 + 0.09]}
                  castShadow
                  receiveShadow
                  onClick={(e) =>
                    handleSelect(e, {
                      id: 'wall-facade',
                      labelId:
                        stage >= 4
                          ? `Dinding Fasad (${materials.facadeColor.toUpperCase()})`
                          : 'Pasangan Dinding Bata (Belum Plester)',
                      labelEn:
                        stage >= 4
                          ? `Rendered Facade Wall (${materials.facadeColor.toUpperCase()})`
                          : 'Rough Masonry Wall (Pre-Plaster)',
                      stage: stage >= 4 ? 4 : 3,
                      categoryId: stage >= 4 ? 'Finishing Fasad' : 'Pasangan Dinding',
                      categoryEn: stage >= 4 ? 'Facade Finish' : 'Masonry Envelope',
                      materialNoteId:
                        stage >= 4
                          ? 'Dinding plester-aci halus dengan cat eksterior tahan cuaca.'
                          : 'Pasangan bata/hebel dengan kolom praktis sebelum tahap plesteran.',
                      materialNoteEn:
                        stage >= 4
                          ? 'Plastered masonry wall finished in weather-resistant architectural paint.'
                          : 'Unplastered masonry wall ready for MEP inspection and rendering.',
                      editTargetTab: 'material',
                    })
                  }
                >
                  <boxGeometry args={[bw, rearH, 0.16]} />
                  <meshStandardMaterial color={wallColor} roughness={0.78} />
                </mesh>

                {/* LEFT WALL (-X) with Window Opening */}
                <group position={[-bw / 2 + 0.09, 0, 0]}>
                  {/* Sill wall */}
                  <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.16, 0.9, bl - 0.18]} />
                    <meshStandardMaterial color={wallColor} roughness={0.78} />
                  </mesh>
                  {/* Header wall */}
                  <mesh position={[0, leftH - 0.35, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.16, 0.7, bl - 0.18]} />
                    <meshStandardMaterial color={wallColor} roughness={0.78} />
                  </mesh>
                  {/* Side piers leaving central window aperture */}
                  <mesh position={[0, leftH / 2, -bl * 0.32]} castShadow receiveShadow>
                    <boxGeometry args={[0.16, leftH, bl * 0.34]} />
                    <meshStandardMaterial color={wallColor} roughness={0.78} />
                  </mesh>
                  <mesh position={[0, leftH / 2, bl * 0.32]} castShadow receiveShadow>
                    <boxGeometry args={[0.16, leftH, bl * 0.34]} />
                    <meshStandardMaterial color={wallColor} roughness={0.78} />
                  </mesh>
                  {/* Stage 4 Glazing inside Left Window */}
                  {stage >= 4 && (
                    <mesh position={[0, 1.65, 0]}>
                      <boxGeometry args={[0.05, leftH - 1.55, bl * 0.32]} />
                      <meshPhysicalMaterial
                        color={isEvening ? '#FFE5AD' : '#C9DFE6'}
                        emissive={isEvening ? '#F4B961' : '#000000'}
                        emissiveIntensity={isEvening ? 0.55 : 0}
                        transparent
                        opacity={0.55}
                        roughness={0.12}
                      />
                    </mesh>
                  )}
                </group>

                {/* RIGHT WALL (+X) - Sliced cleanly in Cutaway */}
                <group position={[bw / 2 - 0.09, 0, 0]}>
                  <mesh position={[0, rightH / 2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.16, rightH, bl - 0.18]} />
                    <meshStandardMaterial color={wallColor} roughness={0.78} />
                  </mesh>
                  {cutaway && (
                    <mesh position={[0, rightH + 0.015, 0]}>
                      <boxGeometry args={[0.18, 0.03, bl - 0.16]} />
                      <meshBasicMaterial color="#C25438" />
                    </mesh>
                  )}
                </group>

                {/* FRONT FACADE WALL (+Z) with Wide Panoramic Window & Main Entrance Doorway */}
                <group position={[0, 0, bl / 2 - 0.09]}>
                  {cutaway ? (
                    <>
                      <mesh position={[-bw * 0.22, frontH / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.54, frontH, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      <mesh position={[bw * 0.36, frontH / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.26, frontH, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      {/* Architectural Section-Cut Highlight Cap */}
                      <mesh position={[-bw * 0.22, frontH + 0.015, 0]}>
                        <boxGeometry args={[bw * 0.54, 0.03, 0.18]} />
                        <meshBasicMaterial color="#C25438" />
                      </mesh>
                      <mesh position={[bw * 0.36, frontH + 0.015, 0]}>
                        <boxGeometry args={[bw * 0.26, 0.03, 0.18]} />
                        <meshBasicMaterial color="#C25438" />
                      </mesh>
                    </>
                  ) : (
                    <>
                      {/* Left Window Sill & Header */}
                      <mesh position={[-bw * 0.22, 0.35, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.44, 0.7, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      <mesh position={[0, fullWallH - 0.32, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw, 0.64, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      {/* Corner & Center Mullion Piers */}
                      <mesh position={[-bw * 0.46, fullWallH / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.08, fullWallH, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      <mesh position={[bw * 0.05, fullWallH / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.12, fullWallH, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>
                      <mesh position={[bw * 0.38, fullWallH / 2, 0]} castShadow receiveShadow>
                        <boxGeometry args={[bw * 0.24, fullWallH, 0.16]} />
                        <meshStandardMaterial color={wallColor} roughness={0.78} />
                      </mesh>

                      {/* Stage 4 Front Panoramic Window Glass & Mullions */}
                      {stage >= 4 && (
                        <group
                          position={[-bw * 0.21, 1.55, 0]}
                          onClick={(e) =>
                            handleSelect(e, {
                              id: 'front-glazing',
                              labelId: 'Bukaan Jendela Kaca & Kusen',
                              labelEn: 'Architectural Window Glazing & Mullions',
                              stage: 4,
                              categoryId: 'Kusen, Pintu & Kaca',
                              categoryEn: 'Frames & Glazing',
                              materialNoteId:
                                'Kaca bening hemat cahaya dengan kusen aluminium slim-profile kedap air.',
                              materialNoteEn:
                                'Clear architectural glazing set in slim weather-sealed frames.',
                            })
                          }
                        >
                          <mesh>
                            <boxGeometry args={[bw * 0.4, fullWallH - 1.3, 0.05]} />
                            <meshPhysicalMaterial
                              color={isEvening ? '#FFE3A3' : '#C4DCE5'}
                              emissive={isEvening ? '#F5B85B' : '#000000'}
                              emissiveIntensity={isEvening ? 0.65 : 0}
                              transparent
                              opacity={0.52}
                              roughness={0.1}
                            />
                          </mesh>
                          {/* Window Frame Trim */}
                          <mesh position={[0, (fullWallH - 1.3) / 2, 0.02]}>
                            <boxGeometry args={[bw * 0.41, 0.05, 0.08]} />
                            <meshStandardMaterial color="#262A2D" roughness={0.4} />
                          </mesh>
                          {houseType === 'industrial-loft' &&
                            [-0.1, 0.1].map((mx, mi) => (
                              <mesh key={`loft-mullion-${mi}`} position={[bw * mx, 0, 0.02]}>
                                <boxGeometry args={[0.04, fullWallH - 1.3, 0.07]} />
                                <meshStandardMaterial color="#1E2225" roughness={0.4} />
                              </mesh>
                            ))}
                        </group>
                      )}

                      {/* Stage 4 Main Entrance Door (Ground Story only, or Upper Balcony Window on Story 2) */}
                      {stage >= 4 &&
                        (fIdx === 0 ? (
                          <mesh
                            position={[bw * 0.18, 1.18, 0]}
                            castShadow
                            onClick={(e) =>
                              handleSelect(e, {
                                id: 'main-door',
                                labelId: 'Pintu Utama Engineering Wood / Baja',
                                labelEn: 'Solid Main Entrance Door',
                                stage: 4,
                                categoryId: 'Kusen, Pintu & Kaca',
                                categoryEn: 'Frames & Doors',
                                materialNoteId: 'Daun pintu utama solid dengan handle arsitektural.',
                                materialNoteEn: 'Solid main pivot/hinged door leaf with weather seal.',
                              })
                            }
                          >
                            <boxGeometry args={[bw * 0.14, 2.35, 0.09]} />
                            <meshStandardMaterial color="#6D492C" roughness={0.55} />
                          </mesh>
                        ) : (
                          <mesh position={[bw * 0.18, 1.55, 0]}>
                            <boxGeometry args={[bw * 0.14, fullWallH - 1.3, 0.05]} />
                            <meshPhysicalMaterial
                              color={isEvening ? '#FFE3A3' : '#C4DCE5'}
                              emissive={isEvening ? '#F5B85B' : '#000000'}
                              emissiveIntensity={isEvening ? 0.55 : 0}
                              transparent
                              opacity={0.52}
                              roughness={0.1}
                            />
                          </mesh>
                        ))}
                    </>
                  )}
                </group>

                {/* INTERIOR ROOM PARTITIONS (Sliced cleanly to 0.95m in Cutaway so layout is legible!) */}
                {(() => {
                  const partH = cutaway ? 0.95 : fullWallH - 0.12;
                  return (
                    <group>
                      {!isJapandi && (
                        <>
                          <mesh position={[-bw * 0.18, partH / 2, -bl * 0.08]} castShadow receiveShadow>
                            <boxGeometry args={[bw * 0.58, partH, 0.11]} />
                            <meshStandardMaterial color={interiorWallColor} roughness={0.82} />
                          </mesh>
                          <mesh position={[bw * 0.08, partH / 2, -bl * 0.24]} castShadow receiveShadow>
                            <boxGeometry args={[0.11, partH, bl * 0.45]} />
                            <meshStandardMaterial color={interiorWallColor} roughness={0.82} />
                          </mesh>
                        </>
                      )}
                    </group>
                  );
                })()}
              </group>
            );
          })}

          {/* STAGE 3 MEP ROUGH-IN PIPES, CONDUITS & DISTRIBUTION BOARD */}
          <group
            onClick={(e) =>
              handleSelect(e, {
                id: 'mep-system',
                labelId: 'Jalur Pipa Air & Konduit Listrik (MEP)',
                labelEn: 'Plumbing & Electrical Rough-In (MEP)',
                stage: 3,
                categoryId: 'Instalasi MEP',
                categoryEn: 'MEP Rough-In Utilities',
                materialNoteId:
                  'Biru: pipa air bersih bertekanan; Abu: pembuangan air limbah; Kuning: konduit listrik & panel MCB.',
                materialNoteEn:
                  'Blue: clean water line; Grey: waste drain; Amber: electrical conduit & MCB breaker box.',
              })
            }
          >
            {/* MCB Electrical Panel Box on Rear Utility Wall */}
            <mesh position={[bw * 0.35, 1.65, -bl / 2 + 0.2]} castShadow>
              <boxGeometry args={[0.38, 0.48, 0.1]} />
              <meshStandardMaterial color="#384044" metalness={0.4} roughness={0.45} />
            </mesh>

            {/* Stage 3 Exposed Rough-In Pipes & Conduits (before final plaster covers walls) */}
            {(stage === 3 || cutaway) && (
              <>
                {/* Clean Water Supply Pipe (Blue) */}
                <mesh position={[bw * 0.24, 0.35, -bl * 0.28]}>
                  <boxGeometry args={[bw * 0.38, 0.045, 0.045]} />
                  <meshStandardMaterial color="#2B7BB9" roughness={0.4} />
                </mesh>
                <mesh position={[bw * 0.42, 1.1, -bl * 0.28]}>
                  <boxGeometry args={[0.045, 1.5, 0.045]} />
                  <meshStandardMaterial color="#2B7BB9" roughness={0.4} />
                </mesh>

                {/* Waste Drain Pipe (Dark Grey) */}
                <mesh position={[bw * 0.26, 0.22, -bl * 0.36]}>
                  <boxGeometry args={[bw * 0.42, 0.075, 0.075]} />
                  <meshStandardMaterial color="#51585C" roughness={0.5} />
                </mesh>

                {/* Electrical Conduit Riser (Amber) */}
                <mesh position={[bw * 0.35, 1.35, -bl / 2 + 0.18]}>
                  <boxGeometry args={[0.035, 2.3, 0.035]} />
                  <meshStandardMaterial color="#D99B26" roughness={0.45} />
                </mesh>
              </>
            )}
          </group>
        </group>
      )}

      {/* =========================================================
          HOUSE-TYPE SPECIFIC ROOFS, LOUVERS, PARAPETS & COURTYARD (Stages 3 & 4+)
         ========================================================= */}
      <RoofAndTypeFeatures config={project} onSelect={handleSelect} />

      {/* =========================================================
          STAGE 5: INTERIOR FINISHED FLOORING & WARM ARCHITECTURAL LIGHTING
         ========================================================= */}
      {stage >= 5 && (
        <group position={[0, 0, buildingCenterZ]}>
          {/* Ground & Upper Story Finished Interior Floors */}
          {Array.from({ length: floors }).map((_, fIdx) => {
            const yLevel = 0.215 + fIdx * floorH;
            const widthSpan = fIdx === 1 && cutaway ? bw * 0.6 : bw - 0.24;
            const xOffset = fIdx === 1 && cutaway ? bw * 0.18 : 0;

            return (
              <mesh
                key={`finish-floor-${fIdx}`}
                position={[xOffset, yLevel, 0]}
                receiveShadow
                onClick={(e) =>
                  handleSelect(e, {
                    id: `interior-floor-${fIdx}`,
                    labelId: `Lantai Interior (${floorSpec.nameId})`,
                    labelEn: `Interior Floor Finish (${floorSpec.nameEn})`,
                    stage: 5,
                    categoryId: 'Finishing Interior',
                    categoryEn: 'Interior Finish',
                    materialNoteId: `${floorSpec.nameId}: ${floorSpec.descId}`,
                    materialNoteEn: `${floorSpec.nameEn}: ${floorSpec.descEn}`,
                    editTargetTab: 'material',
                  })
                }
              >
                <boxGeometry args={[widthSpan, 0.03, bl - 0.24]} />
                <meshStandardMaterial
                  map={floorTex.map}
                  color={floorTex.color}
                  roughness={floorTex.roughness}
                  metalness={floorTex.metalness}
                />
              </mesh>
            );
          })}

          {/* Warm Interior & Porch Luminaires (Activate automatically during Dusk/Night Sun Study!) */}
          {isEvening && (
            <>
              <pointLight
                position={[-bw * 0.2, 2.4, bl * 0.18]}
                color="#FFC978"
                intensity={2.4}
                distance={7.5}
              />
              <pointLight
                position={[bw * 0.2, 2.4, -bl * 0.2]}
                color="#FFC978"
                intensity={1.9}
                distance={6.5}
              />
              {floors === 2 && (
                <pointLight
                  position={[bw * 0.18, floorH + 2.3, 0]}
                  color="#FFC978"
                  intensity={2.0}
                  distance={6.5}
                />
              )}
              {/* Exterior Front Porch Warm Downlight */}
              <pointLight
                position={[bw * 0.18, 2.6, bl / 2 + 0.55]}
                color="#FFB957"
                intensity={1.8}
                distance={5.5}
              />
            </>
          )}
        </group>
      )}

      {/* =========================================================
          INTERIOR FURNITURE, STAIRCASE & OUTDOOR ADD-ONS
         ========================================================= */}
      <InteriorAndAddons config={project} isEvening={isEvening} onSelect={handleSelect} />
    </group>
  );
}
