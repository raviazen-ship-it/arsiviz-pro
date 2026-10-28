'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { ACCENT_MATERIALS, ROOF_MATERIALS } from '@/lib/catalog';
import { getAccentTexture, getRoofTexture } from '@/lib/proceduralTextures';
import { ProjectConfig, SelectedElementInfo } from '@/types/project';

interface RoofAndTypeFeaturesProps {
  config: ProjectConfig;
  onSelect: (e: ThreeEvent<MouseEvent>, info: SelectedElementInfo) => void;
}

export function RoofAndTypeFeatures({ config, onSelect }: RoofAndTypeFeaturesProps) {
  const { houseType, dimensions, materials, scene } = config;
  const stage = scene.constructionStage;
  const cutaway = scene.cutaway;
  const { buildingWidth: bw, buildingLength: bl, landLength: ll, floors } = dimensions;

  const floorH = houseType === 'industrial-loft' ? 3.4 : 3.1;
  const topY = floors * floorH + 0.18;

  const frontSetback = Math.max(1.2, (ll - bl) * 0.65);
  const rearSetback = ll - bl - frontSetback;
  const buildingCenterZ = (rearSetback - frontSetback) / 2;

  const roofTex = useMemo(() => getRoofTexture(materials.roofMaterial), [materials.roofMaterial]);
  const accentTex = useMemo(
    () => getAccentTexture(materials.accentMaterial),
    [materials.accentMaterial]
  );

  const roofSpec =
    ROOF_MATERIALS.find((m) => m.id === materials.roofMaterial) ?? ROOF_MATERIALS[0];
  const accentSpec =
    ACCENT_MATERIALS.find((m) => m.id === materials.accentMaterial) ?? ACCENT_MATERIALS[0];

  // Triangular gable prism geometry for Japandi & Industrial gable infill
  const gableTriangleGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const halfW = bw / 2;
    const ridgeH = Math.min(1.65, bw * 0.22);
    shape.moveTo(-halfW, 0);
    shape.lineTo(halfW, 0);
    shape.lineTo(0, ridgeH);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: 0.18, bevelEnabled: false });
  }, [bw]);

  const handleRoofSelect = (e: ThreeEvent<MouseEvent>) => {
    onSelect(e, {
      id: 'roof-system',
      labelId: `Penutup & Struktur Atap (${roofSpec.nameId})`,
      labelEn: `Roof Structure & Covering (${roofSpec.nameEn})`,
      stage: stage >= 4 ? 4 : 3,
      categoryId: stage >= 4 ? 'Finishing Eksterior' : 'Rangka Atap',
      categoryEn: stage >= 4 ? 'Exterior Finish' : 'Roof Framing',
      materialNoteId: `${roofSpec.nameId}: ${roofSpec.descId}`,
      materialNoteEn: `${roofSpec.nameEn}: ${roofSpec.descEn}`,
      editTargetTab: 'material',
    });
  };

  const handleAccentSelect = (e: ThreeEvent<MouseEvent>) => {
    onSelect(e, {
      id: 'accent-skin',
      labelId: `Aksen Eksterior (${accentSpec.nameId})`,
      labelEn: `Exterior Accent (${accentSpec.nameEn})`,
      stage: 4,
      categoryId: 'Finishing Fasad & Secondary Skin',
      categoryEn: 'Facade & Secondary Skin',
      materialNoteId: `${accentSpec.nameId}: ${accentSpec.descId}`,
      materialNoteEn: `${accentSpec.nameEn}: ${accentSpec.descEn}`,
      editTargetTab: 'material',
    });
  };

  return (
    <group position={[0, 0, buildingCenterZ]}>
      {/* =========================================================
          A. MODERN MINIMALIST BOX (Flat Parapet + Cantilever + Blade Wall)
         ========================================================= */}
      {houseType === 'modern-minimalist' && (
        <>
          {/* Stage 3 Roof Deck Joists (hidden in cutaway) */}
          {stage >= 3 && !cutaway && (
            <group position={[0, topY, 0]} onClick={handleRoofSelect}>
              {[-0.35, -0.12, 0.12, 0.35].map((zFrac, i) => (
                <mesh key={`mm-joist-${i}`} position={[0, 0.06, bl * zFrac]} castShadow>
                  <boxGeometry args={[bw - 0.2, 0.14, 0.16]} />
                  <meshStandardMaterial color="#8A908D" roughness={0.75} />
                </mesh>
              ))}
            </group>
          )}

          {/* Stage 4 Parapet Roof, Waterproof Deck, Cantilever Canopy & Feature Fin */}
          {stage >= 4 && (
            <>
              {!cutaway && (
                <group position={[0, topY, 0]} onClick={handleRoofSelect}>
                  {/* Flat Roof Deck */}
                  <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
                    <boxGeometry args={[bw, 0.18, bl]} />
                    <meshStandardMaterial
                      map={roofTex.map}
                      color={roofTex.color}
                      roughness={roofTex.roughness}
                      metalness={roofTex.metalness}
                    />
                  </mesh>
                  {/* 4 Parapet Walls + Dark Coping */}
                  {[
                    { pos: [0, 0.42, bl / 2 - 0.11] as [number, number, number], size: [bw + 0.08, 0.52, 0.22] as [number, number, number] },
                    { pos: [0, 0.42, -bl / 2 + 0.11] as [number, number, number], size: [bw + 0.08, 0.52, 0.22] as [number, number, number] },
                    { pos: [-bw / 2 + 0.11, 0.42, 0] as [number, number, number], size: [0.22, 0.52, bl - 0.2] as [number, number, number] },
                    { pos: [bw / 2 - 0.11, 0.42, 0] as [number, number, number], size: [0.22, 0.52, bl - 0.2] as [number, number, number] },
                  ].map((p, idx) => (
                    <group key={`parapet-${idx}`} position={p.pos}>
                      <mesh castShadow receiveShadow>
                        <boxGeometry args={p.size} />
                        <meshStandardMaterial color={materials.facadeColor} roughness={0.72} />
                      </mesh>
                      <mesh position={[0, 0.28, 0]}>
                        <boxGeometry args={[p.size[0] + 0.03, 0.05, p.size[2] + 0.03]} />
                        <meshStandardMaterial color="#272B2D" roughness={0.45} metalness={0.4} />
                      </mesh>
                    </group>
                  ))}
                </group>
              )}

              {/* Signature Cantilevered Entry Canopy & Vertical Accent Blade Wall */}
              {!cutaway && (
                <group onClick={handleAccentSelect}>
                  {/* Vertical Feature Fin Wall */}
                  <mesh
                    position={[bw * 0.28, topY * 0.52, bl / 2 + 0.28]}
                    castShadow
                    receiveShadow
                  >
                    <boxGeometry args={[0.38, topY + 0.35, 0.85]} />
                    <meshStandardMaterial
                      map={accentTex.map}
                      color={accentTex.color}
                      roughness={accentTex.roughness}
                      metalness={accentTex.metalness}
                    />
                  </mesh>
                  {/* Slim Cantilevered Entry Canopy */}
                  <mesh position={[0.2, 2.85, bl / 2 + 0.65]} castShadow receiveShadow>
                    <boxGeometry args={[bw * 0.68, 0.14, 1.35]} />
                    <meshStandardMaterial color="#2C3133" roughness={0.45} metalness={0.35} />
                  </mesh>
                </group>
              )}
            </>
          )}
        </>
      )}

      {/* =========================================================
          B. TROPICAL CONTEMPORARY VILLA (Wide Hip Roof + Timber Louvers + Veranda)
         ========================================================= */}
      {houseType === 'tropical-villa' && (
        <>
          {/* Front Tropical Veranda Deck (Stage 2+ slab, Stage 4 timber/stone finish) */}
          {stage >= 2 && (
            <mesh position={[0, 0.12, bl / 2 + 0.72]} receiveShadow castShadow>
              <boxGeometry args={[bw * 0.84, 0.18, 1.45]} />
              <meshStandardMaterial
                color={stage >= 4 ? '#8A5E3B' : '#959B97'}
                roughness={0.68}
              />
            </mesh>
          )}

          {/* Stage 3 Hip Roof Rafter Frame */}
          {stage === 3 && !cutaway && (
            <group position={[0, topY, 0]} onClick={handleRoofSelect}>
              <mesh
                position={[0, 1.05, 0]}
                rotation={[0, Math.PI / 4, 0]}
                scale={[(bw + 2.0) / Math.SQRT2, 1, (bl + 2.0) / Math.SQRT2]}
              >
                <coneGeometry args={[1, 2.1, 4, 1, true]} />
                <meshStandardMaterial color="#8B5E3C" wireframe />
              </mesh>
            </group>
          )}

          {/* Stage 4 Wide Overhanging Hip Roof & Secondary Skin Louvers */}
          {stage >= 4 && (
            <>
              {!cutaway && (
                <group position={[0, topY, 0]} onClick={handleRoofSelect}>
                  {/* Warm Eave Soffit Slab */}
                  <mesh position={[0, 0.05, 0.25]} receiveShadow castShadow>
                    <boxGeometry args={[bw + 2.1, 0.1, bl + 2.3]} />
                    <meshStandardMaterial color="#7D5333" roughness={0.62} />
                  </mesh>
                  {/* 4-Sloped Wide Hip Roof */}
                  <mesh
                    position={[0, 1.18, 0.25]}
                    rotation={[0, Math.PI / 4, 0]}
                    scale={[(bw + 2.2) / Math.SQRT2, 1, (bl + 2.4) / Math.SQRT2]}
                    castShadow
                    receiveShadow
                  >
                    <coneGeometry args={[1, 2.25, 4]} />
                    <meshStandardMaterial
                      map={roofTex.map}
                      color={roofTex.color}
                      roughness={roofTex.roughness}
                      metalness={roofTex.metalness}
                    />
                  </mesh>
                </group>
              )}

              {/* Tropical Secondary-Skin Vertical Louvers */}
              {!cutaway && (
                <group
                  position={[-bw * 0.24, topY - 1.45, bl / 2 + 0.45]}
                  onClick={handleAccentSelect}
                >
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <mesh
                      key={`louver-${idx}`}
                      position={[(idx - 5) * (bw * 0.038), 0, 0]}
                      castShadow
                    >
                      <boxGeometry args={[0.055, 2.55, 0.14]} />
                      <meshStandardMaterial
                        map={accentTex.map}
                        color={accentTex.color}
                        roughness={accentTex.roughness}
                        metalness={accentTex.metalness}
                      />
                    </mesh>
                  ))}
                </group>
              )}
            </>
          )}
        </>
      )}

      {/* =========================================================
          C. INDUSTRIAL LOFT HOUSE (Exposed Dark Steel Frame + Mono-Pitch Roof + Brick/Accent Bays)
         ========================================================= */}
      {houseType === 'industrial-loft' && (
        <>
          {/* Exposed Dark Steel Exoskeleton Columns & Tie Beams (Stage 2+) */}
          {stage >= 2 && (
            <group
              onClick={(e) =>
                onSelect(e, {
                  id: 'steel-exoskeleton',
                  labelId: 'Rangka Baja Ekspos H-Beam',
                  labelEn: 'Exposed Dark Steel H-Beam Frame',
                  stage: 2,
                  categoryId: 'Struktur Baja Utama',
                  categoryEn: 'Primary Steel Structure',
                  materialNoteId: 'Profil kolom dan balok baja struktural bercat hitam matte antikarat.',
                  materialNoteEn: 'Structural H-beam steel frame coated in anti-corrosive matte charcoal.',
                  editTargetTab: 'type',
                })
              }
            >
              {[-bw / 2 - 0.04, 0, bw / 2 + 0.04].map((xPos, xi) =>
                [-bl / 2 - 0.04, 0, bl / 2 + 0.04].map((zPos, zi) => {
                  if (xi === 1 && zi === 1) return null;
                  const h = cutaway && zPos > 0 ? 1.0 : topY;
                  return (
                    <mesh
                      key={`steel-col-${xi}-${zi}`}
                      position={[xPos, h / 2 + 0.09, zPos]}
                      castShadow
                    >
                      <boxGeometry args={[0.18, h, 0.18]} />
                      <meshStandardMaterial color="#1F2326" roughness={0.42} metalness={0.68} />
                    </mesh>
                  );
                })
              )}
              {/* Horizontal Exposed Steel Fascia Girder */}
              {!cutaway && (
                <mesh position={[0, 3.35, bl / 2 + 0.08]} castShadow>
                  <boxGeometry args={[bw + 0.28, 0.22, 0.18]} />
                  <meshStandardMaterial color="#1F2326" roughness={0.42} metalness={0.68} />
                </mesh>
              )}
            </group>
          )}

          {/* Stage 3 Sloped Steel Roof Purlins */}
          {stage >= 3 && !cutaway && (
            <group
              position={[0, topY + 0.48, 0]}
              rotation={[0, 0, 0.13]}
              onClick={handleRoofSelect}
            >
              {[-0.36, -0.12, 0.12, 0.36].map((zFrac, idx) => (
                <mesh key={`loft-purlin-${idx}`} position={[0, 0, bl * zFrac]} castShadow>
                  <boxGeometry args={[bw + 0.8, 0.12, 0.12]} />
                  <meshStandardMaterial color="#252A2E" roughness={0.45} metalness={0.65} />
                </mesh>
              ))}
            </group>
          )}

          {/* Stage 4 Asymmetric Mono-Pitch Loft Roof & Industrial Accent Cladding */}
          {stage >= 4 && !cutaway && (
            <>
              <group
                position={[0, topY + 0.58, 0]}
                rotation={[0, 0, 0.13]}
                onClick={handleRoofSelect}
              >
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[bw + 1.05, 0.16, bl + 0.9]} />
                  <meshStandardMaterial
                    map={roofTex.map}
                    color={roofTex.color}
                    roughness={roofTex.roughness}
                    metalness={roofTex.metalness}
                  />
                </mesh>
                {/* Dark Steel Fascia Edge */}
                <mesh position={[0, 0, bl / 2 + 0.46]}>
                  <boxGeometry args={[bw + 1.08, 0.2, 0.05]} />
                  <meshStandardMaterial color="#1B1F22" roughness={0.4} metalness={0.7} />
                </mesh>
              </group>

              {/* High-Contrast Feature Accent Bay & Industrial Entry Canopy */}
              <group onClick={handleAccentSelect}>
                <mesh
                  position={[-bw * 0.27, topY * 0.5, bl / 2 + 0.04]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[bw * 0.38, topY - 0.15, 0.1]} />
                  <meshStandardMaterial
                    map={accentTex.map}
                    color={accentTex.color}
                    roughness={accentTex.roughness}
                    metalness={accentTex.metalness}
                  />
                </mesh>
                {/* Steel Entry Awning */}
                <mesh position={[bw * 0.18, 2.72, bl / 2 + 0.65]} castShadow>
                  <boxGeometry args={[2.4, 0.09, 1.25]} />
                  <meshStandardMaterial color="#202427" roughness={0.38} metalness={0.7} />
                </mesh>
              </group>
            </>
          )}
        </>
      )}

      {/* =========================================================
          D. JAPANDI COMPACT HOME (Calm Gable Roof + Inner Courtyard Glass Void + Warm Slat Screen)
         ========================================================= */}
      {houseType === 'japandi-compact' && (
        <>
          {/* Central Inner Courtyard Glass Enclosure (Visible in Top View & Cutaway from Stage 4+) */}
          {stage >= 4 && (
            <group
              position={[0, 0.18, 0]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'japandi-courtyard',
                  labelId: 'Taman Dalam Japandi (Inner Courtyard)',
                  labelEn: 'Japandi Central Inner Courtyard',
                  stage: 4,
                  categoryId: 'Ruang Terbuka Internal',
                  categoryEn: 'Internal Lightwell Courtyard',
                  materialNoteId:
                    'Void bukaan kaca tengah rumah untuk cahaya alami dan ventilasi silang tenang.',
                  materialNoteEn:
                    'Glazed central courtyard bringing daylight and calm cross-ventilation into compact rooms.',
                  editTargetTab: 'type',
                })
              }
            >
              {/* Courtyard Timber Curbs */}
              <mesh position={[0, 0.06, bl * 0.14]}>
                <boxGeometry args={[bw * 0.32, 0.12, 0.1]} />
                <meshStandardMaterial color="#8E6742" roughness={0.58} />
              </mesh>
              <mesh position={[0, 0.06, -bl * 0.14]}>
                <boxGeometry args={[bw * 0.32, 0.12, 0.1]} />
                <meshStandardMaterial color="#8E6742" roughness={0.58} />
              </mesh>
              {/* Courtyard Glass Walls (trimmed cleanly if cutaway is active) */}
              {[
                { pos: [0, (cutaway ? 0.95 : topY - 0.2) / 2, bl * 0.14] as [number, number, number], size: [bw * 0.3, cutaway ? 0.95 : topY - 0.2, 0.04] as [number, number, number] },
                { pos: [0, (cutaway ? 0.95 : topY - 0.2) / 2, -bl * 0.14] as [number, number, number], size: [bw * 0.3, cutaway ? 0.95 : topY - 0.2, 0.04] as [number, number, number] },
                { pos: [-bw * 0.15, (cutaway ? 0.95 : topY - 0.2) / 2, 0] as [number, number, number], size: [0.04, cutaway ? 0.95 : topY - 0.2, bl * 0.28] as [number, number, number] },
                { pos: [bw * 0.15, (cutaway ? 0.95 : topY - 0.2) / 2, 0] as [number, number, number], size: [0.04, cutaway ? 0.95 : topY - 0.2, bl * 0.28] as [number, number, number] },
              ].map((g, idx) => (
                <mesh key={`cy-glass-${idx}`} position={g.pos}>
                  <boxGeometry args={g.size} />
                  <meshPhysicalMaterial
                    color="#D7E8EC"
                    transparent
                    opacity={0.36}
                    roughness={0.12}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* Stage 3 Timber Gable Rafters */}
          {stage >= 3 && !cutaway && (
            <group position={[0, topY, 0]} onClick={handleRoofSelect}>
              {[-0.42, -0.22, 0.22, 0.42].map((zFrac, idx) => {
                const slopeLen = Math.hypot(bw / 2 + 0.45, Math.min(1.65, bw * 0.22));
                const angle = Math.atan2(Math.min(1.65, bw * 0.22), bw / 2);
                return (
                  <group key={`jap-truss-${idx}`} position={[0, 0, bl * zFrac]}>
                    <mesh
                      position={[-bw / 4 - 0.1, Math.min(1.65, bw * 0.22) * 0.48, 0]}
                      rotation={[0, 0, angle]}
                    >
                      <boxGeometry args={[slopeLen, 0.1, 0.1]} />
                      <meshStandardMaterial color="#9E734B" roughness={0.65} />
                    </mesh>
                    <mesh
                      position={[bw / 4 + 0.1, Math.min(1.65, bw * 0.22) * 0.48, 0]}
                      rotation={[0, 0, -angle]}
                    >
                      <boxGeometry args={[slopeLen, 0.1, 0.1]} />
                      <meshStandardMaterial color="#9E734B" roughness={0.65} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          )}

          {/* Stage 4 Calm Gable Roof Planes (with Open Lightwell Over Courtyard!) & Timber Screen */}
          {stage >= 4 && !cutaway && (
            <>
              <group position={[0, topY, 0]} onClick={handleRoofSelect}>
                {/* Front & Rear Triangular Gable Pediments */}
                <mesh
                  geometry={gableTriangleGeo}
                  position={[0, 0, bl / 2 - 0.18]}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial color={materials.facadeColor} roughness={0.75} />
                </mesh>
                <mesh
                  geometry={gableTriangleGeo}
                  position={[0, 0, -bl / 2]}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial color={materials.facadeColor} roughness={0.75} />
                </mesh>

                {/* Left & Right Pitched Gable Slopes (split around central courtyard lightwell!) */}
                {(() => {
                  const ridgeH = Math.min(1.65, bw * 0.22);
                  const slopeLen = Math.hypot(bw / 2 + 0.5, ridgeH);
                  const angle = Math.atan2(ridgeH, bw / 2);
                  const frontRoofLen = bl * 0.36;
                  const rearRoofLen = bl * 0.36;
                  return (
                    <>
                      {/* Front section of Gable Roof */}
                      <mesh
                        position={[-bw / 4 - 0.12, ridgeH * 0.5, bl * 0.34]}
                        rotation={[0, 0, angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen, 0.12, frontRoofLen]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>
                      <mesh
                        position={[bw / 4 + 0.12, ridgeH * 0.5, bl * 0.34]}
                        rotation={[0, 0, -angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen, 0.12, frontRoofLen]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>

                      {/* Rear section of Gable Roof (leaving central courtyard open to sky!) */}
                      <mesh
                        position={[-bw / 4 - 0.12, ridgeH * 0.5, -bl * 0.34]}
                        rotation={[0, 0, angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen, 0.12, rearRoofLen]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>
                      <mesh
                        position={[bw / 4 + 0.12, ridgeH * 0.5, -bl * 0.34]}
                        rotation={[0, 0, -angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen, 0.12, rearRoofLen]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>

                      {/* Side Roof Bridges Flanking the Courtyard */}
                      <mesh
                        position={[-bw * 0.36, ridgeH * 0.32, 0]}
                        rotation={[0, 0, angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen * 0.52, 0.12, bl * 0.34]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>
                      <mesh
                        position={[bw * 0.36, ridgeH * 0.32, 0]}
                        rotation={[0, 0, -angle]}
                        castShadow
                        receiveShadow
                      >
                        <boxGeometry args={[slopeLen * 0.52, 0.12, bl * 0.34]} />
                        <meshStandardMaterial
                          map={roofTex.map}
                          color={roofTex.color}
                          roughness={roofTex.roughness}
                        />
                      </mesh>
                    </>
                  );
                })()}
              </group>

              {/* Japandi Warm Vertical Timber Slat Screen (Koshi Lattice) */}
              <group
                position={[bw * 0.25, 1.5, bl / 2 + 0.32]}
                onClick={handleAccentSelect}
              >
                {Array.from({ length: 9 }).map((_, idx) => (
                  <mesh key={`koshi-${idx}`} position={[(idx - 4) * 0.18, 0, 0]} castShadow>
                    <boxGeometry args={[0.05, 2.65, 0.09]} />
                    <meshStandardMaterial
                      map={accentTex.map}
                      color={accentTex.color}
                      roughness={accentTex.roughness}
                    />
                  </mesh>
                ))}
              </group>
            </>
          )}
        </>
      )}
    </group>
  );
}
