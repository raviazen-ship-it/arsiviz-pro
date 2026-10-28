import {
  ACCENT_MATERIALS,
  ADDON_SPECS,
  checkAddonCompatibility,
  FLOOR_MATERIALS,
  HOUSE_SPECS,
  ROOF_MATERIALS,
} from '@/lib/catalog';
import { EditableRateKey, ProjectConfig, RABLineItem, RABSummary } from '@/types/project';

/**
 * Asumsi harga dasar simulasi (IDR) - BUKAN penawaran kontraktor atau harga pasar real-time.
 * Disusun pada satu sumber konfigurasi agar transparan dan dapat diedit pengguna.
 */
export const DEFAULT_UNIT_RATES: Record<EditableRateKey, number> = {
  sitePrepPerM2: 145_000, // per m2 luas lahan
  foundationPerM2: 980_000, // per m2 tapak bangunan dasar (adjusted by floors)
  structurePerM2: 1_850_000, // per m2 luas lantai kotor (GFA)
  wallsPerM2: 720_000, // per m2 estimasi bidang dinding bersih
  roofBasePerM2: 690_000, // per m2 luas bidang atap miring/datar
  openingsPerM2: 640_000, // per m2 luas lantai bangunan
  facadeBasePerM2: 430_000, // per m2 bidang fasad luar + aksen
  floorBasePerM2: 520_000, // per m2 lantai interior efektif
  mepPerM2: 560_000, // per m2 luas lantai bangunan
};

export const EDITABLE_RATE_LABELS: Record<
  EditableRateKey,
  { labelId: string; labelEn: string; unitId: string; unitEn: string }
> = {
  sitePrepPerM2: {
    labelId: 'Persiapan & Tanah',
    labelEn: 'Site Prep & Earthwork',
    unitId: 'm² lahan',
    unitEn: 'm² plot',
  },
  foundationPerM2: {
    labelId: 'Pondasi & Sloof Dasar',
    labelEn: 'Foundation & Tie Beams',
    unitId: 'm² tapak',
    unitEn: 'm² footprint',
  },
  structurePerM2: {
    labelId: 'Struktur Utama (Beton/Baja)',
    labelEn: 'Primary Structure',
    unitId: 'm² bangunan',
    unitEn: 'm² GFA',
  },
  wallsPerM2: {
    labelId: 'Pasangan Dinding & Plester',
    labelEn: 'Masonry Walls & Plaster',
    unitId: 'm² dinding',
    unitEn: 'm² wall',
  },
  roofBasePerM2: {
    labelId: 'Rangka & Penutup Atap Dasar',
    labelEn: 'Roof Framing & Covering',
    unitId: 'm² atap',
    unitEn: 'm² roof',
  },
  openingsPerM2: {
    labelId: 'Kusen, Pintu, Jendela & Kaca',
    labelEn: 'Frames, Doors & Glazing',
    unitId: 'm² bangunan',
    unitEn: 'm² GFA',
  },
  facadeBasePerM2: {
    labelId: 'Finishing Fasad & Aksen Dasar',
    labelEn: 'Facade Finish & Accent',
    unitId: 'm² fasad',
    unitEn: 'm² facade',
  },
  floorBasePerM2: {
    labelId: 'Penutup Lantai Interior Dasar',
    labelEn: 'Interior Flooring Base',
    unitId: 'm² lantai bersih',
    unitEn: 'm² net floor',
  },
  mepPerM2: {
    labelId: 'Instalasi Listrik & Plumbing (MEP)',
    labelEn: 'Electrical & Plumbing (MEP)',
    unitId: 'm² bangunan',
    unitEn: 'm² GFA',
  },
};

export function calculateRAB(config: ProjectConfig): RABSummary {
  const { dimensions, materials, addons, houseType, rabAssumptions } = config;
  const houseSpec = HOUSE_SPECS[houseType];
  const overrides = rabAssumptions.unitRateOverrides ?? {};

  const getRate = (key: EditableRateKey): number => {
    const custom = overrides[key];
    return typeof custom === 'number' && Number.isFinite(custom) && custom >= 0
      ? custom
      : DEFAULT_UNIT_RATES[key];
  };

  const landArea = round2(dimensions.landWidth * dimensions.landLength);
  const footprintArea = round2(dimensions.buildingWidth * dimensions.buildingLength);
  // Japandi compact has an inner courtyard void (~12% of footprint)
  const courtyardVoidFactor = houseType === 'japandi-compact' ? 0.88 : 1.0;
  const effectiveFootprint = round2(footprintArea * courtyardVoidFactor);
  const grossFloorArea = round2(effectiveFootprint * dimensions.floors);
  const remainingYardArea = Math.max(0, round2(landArea - footprintArea));

  // Perimeter & wall surface calculation (net of ~24% openings so we do not double-count windows/doors)
  const perimeter = 2 * (dimensions.buildingWidth + dimensions.buildingLength);
  const floorToFloorHeight = houseType === 'industrial-loft' ? 3.5 : 3.2;
  const interiorPartitionLength = (dimensions.buildingWidth + dimensions.buildingLength) * 1.15;
  const grossWallArea = (perimeter + interiorPartitionLength) * floorToFloorHeight * dimensions.floors;
  const netWallArea = round2(grossWallArea * 0.76);

  // Exterior facade surface (outer perimeter * height * 0.78 net of exterior glazing)
  const exteriorFacadeArea = round2(perimeter * floorToFloorHeight * dimensions.floors * 0.78);

  // Roof area depends on overhang and pitch of each house type
  const roofProjectionFactor =
    houseType === 'tropical-villa'
      ? 1.38
      : houseType === 'industrial-loft'
      ? 1.18
      : houseType === 'japandi-compact'
      ? 1.22
      : 1.06; // modern minimalist flat parapet
  const roofArea = round2(effectiveFootprint * roofProjectionFactor);

  // Multipliers from material selections
  const roofMat = ROOF_MATERIALS.find((m) => m.id === materials.roofMaterial) ?? ROOF_MATERIALS[0];
  const accentMat =
    ACCENT_MATERIALS.find((m) => m.id === materials.accentMaterial) ?? ACCENT_MATERIALS[0];
  const floorMat =
    FLOOR_MATERIALS.find((m) => m.id === materials.floorMaterial) ?? FLOOR_MATERIALS[0];

  // Foundation load factor increases when 2 floors require deeper pile caps / footplates
  const foundationFloorFactor = dimensions.floors === 2 ? 1.42 : 1.0;
  // Structure factor accounts for house type structural system (e.g. exposed steel on industrial loft) + 2nd floor slab/stairs
  const structureFloorFactor =
    (dimensions.floors === 2 ? 1.12 : 1.0) * houseSpec.complexityMultiplier;
  // Glazing factor (modern minimalist & industrial loft have larger glazing ratio)
  const glazingTypeFactor =
    houseType === 'modern-minimalist' || houseType === 'industrial-loft' ? 1.16 : 1.0;

  // Net interior tiled/parquet floor area (88% of GFA excluding wall thicknesses)
  const netFloorArea = round2(grossFloorArea * 0.88);

  // 1. Site Prep
  const sitePrepDefault = DEFAULT_UNIT_RATES.sitePrepPerM2;
  const sitePrepUnit = getRate('sitePrepPerM2');

  // 2. Foundation
  const foundationDefault = Math.round(DEFAULT_UNIT_RATES.foundationPerM2 * foundationFloorFactor);
  const foundationUnit = Math.round(getRate('foundationPerM2') * foundationFloorFactor);

  // 3. Main Structure
  const structureDefault = Math.round(DEFAULT_UNIT_RATES.structurePerM2 * structureFloorFactor);
  const structureUnit = Math.round(getRate('structurePerM2') * structureFloorFactor);

  // 4. Walls & Plaster
  const wallsDefault = DEFAULT_UNIT_RATES.wallsPerM2;
  const wallsUnit = getRate('wallsPerM2');

  // 5. Roof Framing & Covering
  const roofDefault = Math.round(DEFAULT_UNIT_RATES.roofBasePerM2 * roofMat.priceMultiplier);
  const roofUnit = Math.round(getRate('roofBasePerM2') * roofMat.priceMultiplier);

  // 6. Doors, Windows & Glazing
  const openingsDefault = Math.round(DEFAULT_UNIT_RATES.openingsPerM2 * glazingTypeFactor);
  const openingsUnit = Math.round(getRate('openingsPerM2') * glazingTypeFactor);

  // 7. Facade Finish & Secondary Skin Accent
  const facadeDefault = Math.round(DEFAULT_UNIT_RATES.facadeBasePerM2 * accentMat.priceMultiplier);
  const facadeUnit = Math.round(getRate('facadeBasePerM2') * accentMat.priceMultiplier);

  // 8. Interior Flooring
  const floorDefault = Math.round(DEFAULT_UNIT_RATES.floorBasePerM2 * floorMat.priceMultiplier);
  const floorUnit = Math.round(getRate('floorBasePerM2') * floorMat.priceMultiplier);

  // 9. MEP
  const mepDefault = DEFAULT_UNIT_RATES.mepPerM2;
  const mepUnit = getRate('mepPerM2');

  // 10. Interior Furniture Add-ons (only active & compatible items)
  const activeInteriorAddons = ADDON_SPECS.filter(
    (spec) =>
      spec.category === 'interior' &&
      addons[spec.key] &&
      checkAddonCompatibility(spec.key, houseType, dimensions).supported
  );
  const interiorSubtotal = activeInteriorAddons.reduce(
    (sum, item) => sum + item.estimatedPriceIdr,
    0
  );

  // 11. Outdoor Add-ons (carport, pool, solar, landscape - only active & compatible)
  const activeOutdoorAddons = ADDON_SPECS.filter((spec) => {
    if (spec.category !== 'outdoor') return false;
    if (!addons[spec.key]) return false;
    return checkAddonCompatibility(spec.key, houseType, dimensions).supported;
  });

  // Landscape scales gently with remaining yard if active
  const outdoorSubtotal = activeOutdoorAddons.reduce((sum, item) => {
    if (item.key === 'landscape') {
      const yardScale = Math.max(0.75, Math.min(1.8, remainingYardArea / 65));
      return sum + Math.round(item.estimatedPriceIdr * yardScale);
    }
    return sum + item.estimatedPriceIdr;
  }, 0);

  const baseItems: RABLineItem[] = [
    {
      id: 'site-prep',
      rateKey: 'sitePrepPerM2',
      titleId: '1. Persiapan Lahan & Pekerjaan Tanah',
      titleEn: '1. Site Preparation & Earthwork',
      quantity: landArea,
      unitId: 'm² lahan',
      unitEn: 'm² plot',
      unitPrice: sitePrepUnit,
      defaultUnitPrice: sitePrepDefault,
      subtotal: Math.round(landArea * sitePrepUnit),
      basisId: `Luas kavling ${dimensions.landWidth} × ${dimensions.landLength} m (pembersihan, bouwplank, perataan)`,
      basisEn: `Plot area ${dimensions.landWidth} × ${dimensions.landLength} m (clearing, batter boards, grading)`,
    },
    {
      id: 'foundation',
      rateKey: 'foundationPerM2',
      titleId: '2. Pondasi & Balok Sloof',
      titleEn: '2. Foundation & Grade Beams (Sloof)',
      quantity: effectiveFootprint,
      unitId: 'm² tapak',
      unitEn: 'm² footprint',
      unitPrice: foundationUnit,
      defaultUnitPrice: foundationDefault,
      subtotal: Math.round(effectiveFootprint * foundationUnit),
      basisId: `Tapak dasar ${effectiveFootprint} m² × faktor beban ${dimensions.floors} lantai`,
      basisEn: `Ground footprint ${effectiveFootprint} m² × ${dimensions.floors}-story load factor`,
    },
    {
      id: 'main-structure',
      rateKey: 'structurePerM2',
      titleId: '3. Struktur Utama (Kolom, Balok & Plat)',
      titleEn: '3. Primary Structure (Columns, Beams & Slabs)',
      quantity: grossFloorArea,
      unitId: 'm² bangunan',
      unitEn: 'm² GFA',
      unitPrice: structureUnit,
      defaultUnitPrice: structureDefault,
      subtotal: Math.round(grossFloorArea * structureUnit),
      basisId: `Luas bangunan ${grossFloorArea} m² (${houseSpec.nameId}, ${dimensions.floors} lantai)`,
      basisEn: `Gross floor area ${grossFloorArea} m² (${houseSpec.nameEn}, ${dimensions.floors} fl)`,
    },
    {
      id: 'walls-plaster',
      rateKey: 'wallsPerM2',
      titleId: '4. Pasangan Dinding & Plester Aci',
      titleEn: '4. Masonry Walls & Plastering',
      quantity: netWallArea,
      unitId: 'm² dinding',
      unitEn: 'm² net wall',
      unitPrice: wallsUnit,
      defaultUnitPrice: wallsDefault,
      subtotal: Math.round(netWallArea * wallsUnit),
      basisId: 'Bidang dinding bersih dikurangi 24% bukaan pintu/jendela (tanpa hitung ganda)',
      basisEn: 'Net wall surface after deducting 24% glazing/door openings (no double counting)',
    },
    {
      id: 'roof-structure',
      rateKey: 'roofBasePerM2',
      titleId: '5. Rangka & Penutup Atap',
      titleEn: '5. Roof Framing & Weather Covering',
      quantity: roofArea,
      unitId: 'm² atap',
      unitEn: 'm² roof',
      unitPrice: roofUnit,
      defaultUnitPrice: roofDefault,
      subtotal: Math.round(roofArea * roofUnit),
      basisId: `${roofMat.nameId} + proyeksi atap tipe rumah (${roofArea} m²)`,
      basisEn: `${roofMat.nameEn} + house roof projection (${roofArea} m²)`,
    },
    {
      id: 'openings',
      rateKey: 'openingsPerM2',
      titleId: '6. Kusen, Pintu, Jendela & Kaca',
      titleEn: '6. Frames, Doors, Windows & Glazing',
      quantity: grossFloorArea,
      unitId: 'm² bangunan',
      unitEn: 'm² GFA',
      unitPrice: openingsUnit,
      defaultUnitPrice: openingsDefault,
      subtotal: Math.round(grossFloorArea * openingsUnit),
      basisId: `Rasio bukaan kaca & pintu untuk karakter ${houseSpec.nameId}`,
      basisEn: `Architectural glazing & door ratio for ${houseSpec.nameEn}`,
    },
    {
      id: 'facade-finish',
      rateKey: 'facadeBasePerM2',
      titleId: '7. Finishing Fasad, Cat Eksterior & Aksen',
      titleEn: '7. Facade Render, Weathercoat & Accents',
      quantity: exteriorFacadeArea,
      unitId: 'm² fasad',
      unitEn: 'm² facade',
      unitPrice: facadeUnit,
      defaultUnitPrice: facadeDefault,
      subtotal: Math.round(exteriorFacadeArea * facadeUnit),
      basisId: `Cat fasad (${materials.facadeColor.toUpperCase()}) + aksen ${accentMat.nameId}`,
      basisEn: `Exterior paint (${materials.facadeColor.toUpperCase()}) + ${accentMat.nameEn}`,
    },
    {
      id: 'interior-floor',
      rateKey: 'floorBasePerM2',
      titleId: '8. Penutup Lantai Interior',
      titleEn: '8. Interior Floor Finishes',
      quantity: netFloorArea,
      unitId: 'm² lantai',
      unitEn: 'm² net floor',
      unitPrice: floorUnit,
      defaultUnitPrice: floorDefault,
      subtotal: Math.round(netFloorArea * floorUnit),
      basisId: `${floorMat.nameId} pada area ruang efektif (${netFloorArea} m²)`,
      basisEn: `${floorMat.nameEn} across net interior area (${netFloorArea} m²)`,
    },
    {
      id: 'mep',
      rateKey: 'mepPerM2',
      titleId: '9. Instalasi Listrik, Air Bersih/Kotor & MEP',
      titleEn: '9. Electrical, Plumbing & MEP Systems',
      quantity: grossFloorArea,
      unitId: 'm² bangunan',
      unitEn: 'm² GFA',
      unitPrice: mepUnit,
      defaultUnitPrice: mepDefault,
      subtotal: Math.round(grossFloorArea * mepUnit),
      basisId: 'Titik lampu, saklar, panel MCB, pemipaan air bersih/limbah, & pompa dasar',
      basisEn: 'Lighting circuits, distribution board, clean/waste water piping, & booster pump',
    },
    {
      id: 'interior-furniture',
      titleId: '10. Paket Interior & Furnitur Pilihan',
      titleEn: '10. Selected Interior & Cabinetry Add-ons',
      quantity: activeInteriorAddons.length,
      unitId: 'paket aktif',
      unitEn: 'active pkg',
      unitPrice:
        activeInteriorAddons.length > 0
          ? Math.round(interiorSubtotal / activeInteriorAddons.length)
          : 0,
      defaultUnitPrice: 0,
      subtotal: interiorSubtotal,
      basisId:
        activeInteriorAddons.length > 0
          ? activeInteriorAddons.map((a) => a.nameId).join(', ')
          : 'Tidak ada paket furnitur yang diaktifkan',
      basisEn:
        activeInteriorAddons.length > 0
          ? activeInteriorAddons.map((a) => a.nameEn).join(', ')
          : 'No interior furniture packages enabled',
    },
    {
      id: 'outdoor-addons',
      titleId: '11. Carport, Kolam, Panel Surya & Lanskap',
      titleEn: '11. Carport, Pool, Solar PV & Landscape',
      quantity: activeOutdoorAddons.length,
      unitId: 'fitur aktif',
      unitEn: 'active feat',
      unitPrice:
        activeOutdoorAddons.length > 0
          ? Math.round(outdoorSubtotal / activeOutdoorAddons.length)
          : 0,
      defaultUnitPrice: 0,
      subtotal: outdoorSubtotal,
      basisId:
        activeOutdoorAddons.length > 0
          ? activeOutdoorAddons.map((a) => a.nameId).join(', ')
          : 'Tidak ada fitur eksterior tambahan yang diaktifkan',
      basisEn:
        activeOutdoorAddons.length > 0
          ? activeOutdoorAddons.map((a) => a.nameEn).join(', ')
          : 'No outdoor add-on features enabled',
    },
  ];

  const physicalSubtotal = baseItems.reduce((sum, item) => sum + item.subtotal, 0);
  const safeContingencyPct = Math.min(30, Math.max(0, rabAssumptions.contingencyPercent));
  const contingencyAmount = Math.round(physicalSubtotal * (safeContingencyPct / 100));

  const contingencyItem: RABLineItem = {
    id: 'contingency',
    titleId: `12. Biaya Cadangan / Contingency (${safeContingencyPct}%)`,
    titleEn: `12. Construction Contingency (${safeContingencyPct}%)`,
    quantity: safeContingencyPct,
    unitId: '% subtotal',
    unitEn: '% subtotal',
    unitPrice: Math.round(physicalSubtotal / 100),
    defaultUnitPrice: Math.round(physicalSubtotal / 100),
    subtotal: contingencyAmount,
    basisId: `Cadangan risiko perubahan lapangan ${safeContingencyPct}% dari subtotal fisik`,
    basisEn: `${safeContingencyPct}% buffer applied to physical construction subtotal`,
  };

  const items = [...baseItems, contingencyItem];
  const totalEstimatedCost = physicalSubtotal + contingencyAmount;
  const estimatedCostPerM2 =
    grossFloorArea > 0 ? Math.round(totalEstimatedCost / grossFloorArea) : 0;

  return {
    items,
    physicalSubtotal,
    contingencyAmount,
    contingencyPercent: safeContingencyPct,
    totalEstimatedCost,
    landArea,
    footprintArea: effectiveFootprint,
    grossFloorArea,
    remainingYardArea,
    estimatedCostPerM2,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
