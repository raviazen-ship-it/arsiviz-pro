'use client';

import React from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { checkAddonCompatibility } from '@/lib/catalog';
import { ProjectConfig, SelectedElementInfo } from '@/types/project';

interface InteriorAndAddonsProps {
  config: ProjectConfig;
  isEvening: boolean;
  onSelect: (e: ThreeEvent<MouseEvent>, info: SelectedElementInfo) => void;
}

export function InteriorAndAddons({
  config,
  isEvening,
  onSelect,
}: InteriorAndAddonsProps) {
  const { dimensions, addons, houseType, scene } = config;
  const stage = scene.constructionStage;
  const { buildingWidth: bw, buildingLength: bl, landWidth: lw, landLength: ll, floors } = dimensions;
  const floorH = houseType === 'industrial-loft' ? 3.4 : 3.1;

  // Building sits slightly toward the rear of the plot so front setback (+Z) is spacious for carport/terrace
  const frontSetback = Math.max(1.2, (ll - bl) * 0.65);
  const rearSetback = ll - bl - frontSetback;
  const buildingCenterZ = (rearSetback - frontSetback) / 2;

  const isJapandi = houseType === 'japandi-compact';

  const poolCompat = checkAddonCompatibility('swimmingPool', houseType, dimensions);
  const carportCompat = checkAddonCompatibility('carport', houseType, dimensions);

  // Staircase appears from Stage 2 onwards if 2 floors!
  const renderStaircase = floors === 2 && stage >= 2;

  return (
    <group position={[0, 0, buildingCenterZ]}>
      {/* 2-Floor Structural Staircase (Stage 2+) */}
      {renderStaircase && (
        <group
          position={[-bw * 0.28, 0.2, -bl * 0.18]}
          onClick={(e) =>
            onSelect(e, {
              id: 'staircase',
              labelId: 'Tangga Struktur Lantai 2',
              labelEn: 'Second-Floor Structural Staircase',
              stage: 2,
              categoryId: 'Struktur Utama',
              categoryEn: 'Primary Structure',
              materialNoteId: 'Tangga beton/baja penghubung lantai 1 dan lantai 2 dengan railing pengaman.',
              materialNoteEn: 'Structural stair connecting ground and upper levels with safety balustrade.',
              editTargetTab: 'dimensions',
            })
          }
        >
          {Array.from({ length: 12 }).map((_, idx) => {
            const stepY = (idx + 1) * ((floorH - 0.15) / 12);
            const stepZ = idx * 0.22 - 1.2;
            return (
              <mesh key={`stair-step-${idx}`} position={[0, stepY, stepZ]} castShadow receiveShadow>
                <boxGeometry args={[0.92, 0.08, 0.24]} />
                <meshStandardMaterial
                  color={stage >= 5 ? '#A67C52' : '#9AA09D'}
                  roughness={0.6}
                />
              </mesh>
            );
          })}
          {/* Railing */}
          {stage >= 4 && (
            <mesh position={[0.44, floorH * 0.55, 0.1]}>
              <boxGeometry args={[0.04, 0.85, 2.7]} />
              <meshPhysicalMaterial
                color="#CFE4EA"
                transparent
                opacity={0.42}
                roughness={0.15}
              />
            </mesh>
          )}
        </group>
      )}

      {/* STAGE 5 INTERIOR & OUTDOOR ADD-ONS */}
      {stage >= 5 && (
        <>
          {/* Living Room Furniture (Front-Left Zone) */}
          {addons.livingRoomFurniture && (
            <group
              position={[-bw * 0.22, 0.22, bl * 0.22]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-living',
                  labelId: 'Furnitur Ruang Tamu',
                  labelEn: 'Living Room Furniture Package',
                  stage: 5,
                  categoryId: 'Interior & Furnitur',
                  categoryEn: 'Interior & Furniture',
                  materialNoteId: 'Sofa modular kain tenun, meja kopi kayu oak, karpet, dan konsol media.',
                  materialNoteEn: 'Woven modular sofa, oak coffee table, rug, and low media console.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Area Rug */}
              <mesh position={[0, 0.01, 0]} receiveShadow>
                <boxGeometry args={[Math.min(2.4, bw * 0.34), 0.02, Math.min(2.0, bl * 0.22)]} />
                <meshStandardMaterial color="#DCD6CA" roughness={0.92} />
              </mesh>
              {/* Main Sofa Seat & Backrest */}
              <mesh position={[0, 0.22, -0.45]} castShadow receiveShadow>
                <boxGeometry args={[Math.min(2.0, bw * 0.28), 0.4, 0.78]} />
                <meshStandardMaterial color="#6D746E" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.52, -0.75]} castShadow>
                <boxGeometry args={[Math.min(2.0, bw * 0.28), 0.38, 0.18]} />
                <meshStandardMaterial color="#5E655F" roughness={0.85} />
              </mesh>
              {/* Coffee Table */}
              <mesh position={[0, 0.2, 0.22]} castShadow receiveShadow>
                <boxGeometry args={[1.05, 0.34, 0.58]} />
                <meshStandardMaterial color="#9E7348" roughness={0.55} />
              </mesh>
              {/* Low Media Console */}
              <mesh position={[0, 0.22, 0.85]} castShadow>
                <boxGeometry args={[1.5, 0.4, 0.36]} />
                <meshStandardMaterial color="#4A3B2C" roughness={0.6} />
              </mesh>
            </group>
          )}

          {/* Kitchen Set & Island (Rear-Right Zone) */}
          {addons.kitchenSet && (
            <group
              position={[bw * 0.24, 0.22, -bl * 0.26]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-kitchen',
                  labelId: 'Kitchen Set & Meja Island',
                  labelEn: 'Kitchen Cabinetry & Prep Island',
                  stage: 5,
                  categoryId: 'Interior & Furnitur',
                  categoryEn: 'Interior & Furniture',
                  materialNoteId: 'Kabinet bawah-atas HPL tahan lembap dengan top table batu kuarsa.',
                  materialNoteEn: 'Moisture-resistant cabinetry with engineered quartz countertop.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Base Cabinet */}
              <mesh position={[0, 0.44, -0.5]} castShadow receiveShadow>
                <boxGeometry args={[Math.min(2.3, bw * 0.32), 0.86, 0.6]} />
                <meshStandardMaterial color="#3E4441" roughness={0.65} />
              </mesh>
              {/* Quartz Countertop */}
              <mesh position={[0, 0.89, -0.5]} castShadow>
                <boxGeometry args={[Math.min(2.34, bw * 0.33), 0.05, 0.64]} />
                <meshStandardMaterial color="#F0EFEA" roughness={0.25} />
              </mesh>
              {/* Kitchen Island */}
              <mesh position={[0, 0.43, 0.42]} castShadow receiveShadow>
                <boxGeometry args={[Math.min(1.65, bw * 0.24), 0.85, 0.65]} />
                <meshStandardMaterial color="#9A7147" roughness={0.55} />
              </mesh>
              <mesh position={[0, 0.88, 0.42]} castShadow>
                <boxGeometry args={[Math.min(1.72, bw * 0.25), 0.05, 0.72]} />
                <meshStandardMaterial color="#F2F1EC" roughness={0.25} />
              </mesh>
            </group>
          )}

          {/* Master Bedroom Suite (Upper floor if 2 floors, else Rear-Left Ground Room) */}
          {addons.masterBedroomFurniture && (
            <group
              position={[
                floors === 2 ? bw * 0.22 : -bw * 0.24,
                floors === 2 ? floorH + 0.22 : 0.22,
                floors === 2 ? bl * 0.16 : -bl * 0.26,
              ]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-bedroom',
                  labelId: 'Furnitur Kamar Tidur Utama',
                  labelEn: 'Master Bedroom Suite',
                  stage: 5,
                  categoryId: 'Interior & Furnitur',
                  categoryEn: 'Interior & Furniture',
                  materialNoteId: 'Ranjang queen ber-headboard kayu, dua nakas, dan lemari pakaian.',
                  materialNoteEn: 'Queen platform bed with timber headboard, twin nightstands, and wardrobe.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Bed Frame */}
              <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.68, 0.28, 2.02]} />
                <meshStandardMaterial color="#8A623E" roughness={0.6} />
              </mesh>
              {/* Mattress & Duvet */}
              <mesh position={[0, 0.38, 0.04]} castShadow>
                <boxGeometry args={[1.56, 0.2, 1.88]} />
                <meshStandardMaterial color="#EFECE4" roughness={0.85} />
              </mesh>
              {/* Pillows */}
              <mesh position={[-0.38, 0.52, -0.68]} castShadow>
                <boxGeometry args={[0.58, 0.12, 0.36]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
              </mesh>
              <mesh position={[0.38, 0.52, -0.68]} castShadow>
                <boxGeometry args={[0.58, 0.12, 0.36]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
              </mesh>
              {/* Headboard */}
              <mesh position={[0, 0.58, -0.96]} castShadow>
                <boxGeometry args={[1.74, 0.85, 0.1]} />
                <meshStandardMaterial color="#6D4C2F" roughness={0.58} />
              </mesh>
              {/* Wardrobe */}
              {!scene.cutaway && (
                <mesh position={[1.15, 0.95, -0.3]} castShadow>
                  <boxGeometry args={[0.55, 1.85, 1.35]} />
                  <meshStandardMaterial color="#D8D2C5" roughness={0.65} />
                </mesh>
              )}
            </group>
          )}

          {/* Japandi Inner Courtyard Zen Tree & Rocks (Stage 5) */}
          {isJapandi && (
            <group position={[0, 0.18, 0]}>
              <mesh position={[0, 0.02, 0]} receiveShadow>
                <boxGeometry args={[bw * 0.28, 0.05, bl * 0.26]} />
                <meshStandardMaterial color="#DFDDD4" roughness={0.95} />
              </mesh>
              <mesh position={[0, 1.05, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.09, 1.9, 8]} />
                <meshStandardMaterial color="#5E432C" roughness={0.8} />
              </mesh>
              <mesh position={[0, 2.1, 0]} castShadow>
                <dodecahedronGeometry args={[0.68, 1]} />
                <meshStandardMaterial color="#6E8F6A" roughness={0.82} />
              </mesh>
            </group>
          )}
        </>
      )}

      {/* OUTDOOR SITE ADD-ONS (Relative to Plot Origin [0,0,0]) */}
      {stage >= 5 && (
        <group position={[0, 0, -buildingCenterZ]}>
          {/* Carport (Front Right Setback) */}
          {addons.carport && carportCompat.supported && (
            <group
              position={[
                Math.min(lw * 0.24, bw * 0.28),
                0.04,
                ll / 2 - Math.min(2.4, Math.max(1.7, frontSetback * 0.48)),
              ]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-carport',
                  labelId: 'Carport & Kanopi Baja',
                  labelEn: 'Carport & Shade Canopy',
                  stage: 5,
                  categoryId: 'Fitur Luar Ruang',
                  categoryEn: 'Outdoor Amenity',
                  materialNoteId: 'Perkerasan batu andesit/beton sikat dengan kanopi rangka baja hitam.',
                  materialNoteEn: 'Brushed concrete/stone apron with powder-coated steel shade canopy.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Paved Apron */}
              <mesh position={[0, 0.02, 0]} receiveShadow>
                <boxGeometry args={[3.0, 0.06, Math.min(4.6, Math.max(3.1, frontSetback - 0.3))]} />
                <meshStandardMaterial color="#7C827E" roughness={0.88} />
              </mesh>
              {/* Canopy Posts */}
              {[
                [-1.38, 1.25, -1.3],
                [1.38, 1.25, -1.3],
                [-1.38, 1.25, 1.3],
                [1.38, 1.25, 1.3],
              ].map(([px, py, pz], idx) => (
                <mesh key={`cp-post-${idx}`} position={[px, py, pz]} castShadow>
                  <boxGeometry args={[0.09, 2.45, 0.09]} />
                  <meshStandardMaterial color="#272B2D" roughness={0.45} metalness={0.6} />
                </mesh>
              ))}
              {/* Canopy Roof */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.15, 0.08, Math.min(4.4, Math.max(3.0, frontSetback - 0.4))]} />
                <meshStandardMaterial color="#32383B" roughness={0.4} metalness={0.35} />
              </mesh>
            </group>
          )}

          {/* Private Plunge Pool (Front-Left or Side Yard) */}
          {addons.swimmingPool && poolCompat.supported && (
            <group
              position={[
                -Math.min(lw * 0.25, bw * 0.28),
                0.05,
                ll / 2 - Math.min(2.2, Math.max(1.6, frontSetback * 0.46)),
              ]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-pool',
                  labelId: 'Kolam Renang Pribadi & Dek Kayu',
                  labelEn: 'Private Plunge Pool & Timber Deck',
                  stage: 5,
                  categoryId: 'Fitur Luar Ruang',
                  categoryEn: 'Outdoor Amenity',
                  materialNoteId: 'Kolam beton kedap air dengan sirkulasi filtrasi dan dek tepi kayu ulin.',
                  materialNoteEn: 'Waterproof concrete plunge pool with filtration and Ulin timber coping.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Timber Pool Deck Coping */}
              <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
                <boxGeometry args={[3.3, 0.12, 2.5]} />
                <meshStandardMaterial color="#875A36" roughness={0.65} />
              </mesh>
              {/* Turquoise Water Surface */}
              <mesh position={[0, 0.09, 0]}>
                <boxGeometry args={[2.75, 0.08, 1.95]} />
                <meshPhysicalMaterial
                  color={isEvening ? '#39B8C9' : '#4BA8B8'}
                  emissive={isEvening ? '#1D6E7A' : '#000000'}
                  emissiveIntensity={isEvening ? 0.65 : 0}
                  roughness={0.12}
                  transmission={0.25}
                />
              </mesh>
              {isEvening && (
                <pointLight position={[0, 0.45, 0]} color="#5CE1F5" intensity={1.4} distance={4.5} />
              )}
            </group>
          )}

          {/* Rooftop Solar PV Panels (Mounted on top of roof when not in Cutaway) */}
          {addons.solarPanels && !scene.cutaway && (
            <group
              position={[
                0,
                floors * floorH + (houseType === 'modern-minimalist' ? 0.62 : 1.15),
                buildingCenterZ + 0.3,
              ]}
              rotation={[houseType === 'modern-minimalist' ? 0.22 : 0.36, 0, 0]}
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-solar',
                  labelId: 'Panel Surya Atap (PLTS 3,3 kWp)',
                  labelEn: 'Rooftop Solar PV Array (3.3 kWp)',
                  stage: 5,
                  categoryId: 'Energi Terbarukan',
                  categoryEn: 'Clean Energy Add-on',
                  materialNoteId: 'Modul fotovoltaik monokristalin dengan dudukan rel aluminium anodized.',
                  materialNoteEn: 'Monocrystalline solar PV modules on anodized aluminum roof rails.',
                  editTargetTab: 'addons',
                })
              }
            >
              {[-1.15, 0, 1.15].map((xPos, idx) => (
                <group key={`pv-panel-${idx}`} position={[xPos, 0, 0]}>
                  <mesh castShadow>
                    <boxGeometry args={[1.04, 0.05, 1.72]} />
                    <meshStandardMaterial color="#C8CFD4" metalness={0.65} roughness={0.35} />
                  </mesh>
                  <mesh position={[0, 0.03, 0]}>
                    <boxGeometry args={[0.98, 0.01, 1.66]} />
                    <meshStandardMaterial color="#18283D" metalness={0.5} roughness={0.22} />
                  </mesh>
                </group>
              ))}
            </group>
          )}

          {/* Tropical Landscape & Trees (Stage 5 when Landscape active, or signature palms on Tropical Villa) */}
          {(addons.landscape || houseType === 'tropical-villa') && (
            <group
              onClick={(e) =>
                onSelect(e, {
                  id: 'addon-landscape',
                  labelId: 'Lanskap, Pohon Peneduh & Lampu Taman',
                  labelEn: 'Garden Landscape, Shade Trees & Bollards',
                  stage: 5,
                  categoryId: 'Lanskap & Ruang Hijau',
                  categoryEn: 'Landscape & Greenery',
                  materialNoteId: 'Kombinasi pohon peneduh, tanaman semak tropis, pijakan batu, dan lampu taman.',
                  materialNoteEn: 'Shade trees, tropical shrubs, stone pavers, and warm garden bollards.',
                  editTargetTab: 'addons',
                })
              }
            >
              {/* Front Corner Shade Tree */}
              <group position={[-lw / 2 + 1.1, 0, ll / 2 - 1.1]}>
                <mesh position={[0, 1.0, 0]} castShadow>
                  <cylinderGeometry args={[0.1, 0.15, 2.0, 8]} />
                  <meshStandardMaterial color="#634832" roughness={0.85} />
                </mesh>
                <mesh position={[0, 2.35, 0]} castShadow>
                  <dodecahedronGeometry args={[1.05, 1]} />
                  <meshStandardMaterial color="#5E855B" roughness={0.82} />
                </mesh>
                <mesh position={[0.45, 2.0, 0.3]} castShadow>
                  <dodecahedronGeometry args={[0.72, 1]} />
                  <meshStandardMaterial color="#6F986B" roughness={0.82} />
                </mesh>
              </group>

              {/* Rear Corner Tree */}
              <group position={[lw / 2 - 1.0, 0, -ll / 2 + 1.0]}>
                <mesh position={[0, 1.15, 0]} castShadow>
                  <cylinderGeometry args={[0.09, 0.14, 2.3, 8]} />
                  <meshStandardMaterial color="#5E432E" roughness={0.85} />
                </mesh>
                <mesh position={[0, 2.6, 0]} castShadow>
                  <dodecahedronGeometry args={[0.98, 1]} />
                  <meshStandardMaterial color="#557A54" roughness={0.82} />
                </mesh>
              </group>

              {/* Shrubs & Stepping Stones */}
              {[-0.8, -0.1, 0.6].map((stepIdx, i) => (
                <mesh
                  key={`paver-${i}`}
                  position={[0, 0.04, ll / 2 - 0.65 - i * 0.72]}
                  receiveShadow
                >
                  <boxGeometry args={[0.75, 0.04, 0.44]} />
                  <meshStandardMaterial color="#91958F" roughness={0.88} />
                </mesh>
              ))}

              {/* Garden Bollard Lamp */}
              <group position={[-0.75, 0, ll / 2 - 1.35]}>
                <mesh position={[0, 0.32, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.05, 0.64, 8]} />
                  <meshStandardMaterial color="#2A2E2C" roughness={0.5} />
                </mesh>
                <mesh position={[0, 0.66, 0]}>
                  <cylinderGeometry args={[0.055, 0.055, 0.12, 8]} />
                  <meshStandardMaterial
                    color={isEvening ? '#FFE3A8' : '#E2E4DF'}
                    emissive={isEvening ? '#FFB84D' : '#000000'}
                    emissiveIntensity={isEvening ? 2.0 : 0}
                  />
                </mesh>
                {isEvening && (
                  <pointLight position={[0, 0.72, 0]} color="#FFC670" intensity={1.1} distance={4} />
                )}
              </group>
            </group>
          )}
        </group>
      )}
    </group>
  );
}
