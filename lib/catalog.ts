import {
  AccentMaterial,
  AddonCompatibility,
  AddonsConfig,
  ConstructionStage,
  DimensionsConfig,
  FloorMaterial,
  HouseType,
  MaterialsConfig,
  RoofMaterial,
} from '@/types/project';

export interface HouseTypeSpec {
  id: HouseType;
  nameId: string;
  nameEn: string;
  taglineId: string;
  taglineEn: string;
  descriptionId: string;
  descriptionEn: string;
  roofFormId: string;
  roofFormEn: string;
  complexityMultiplier: number;
  defaultDimensions: DimensionsConfig;
  defaultMaterials: MaterialsConfig;
  recommendedRoof: RoofMaterial[];
}

export const HOUSE_SPECS: Record<HouseType, HouseTypeSpec> = {
  'modern-minimalist': {
    id: 'modern-minimalist',
    nameId: 'Modern Minimalist Box',
    nameEn: 'Modern Minimalist Box',
    taglineId: 'Massa kotak geometris tegas dengan parapet datar dan bukaan kaca lebar',
    taglineEn: 'Crisp rectilinear massing with flat parapet roof and wide glazing',
    descriptionId:
      'Komposisi volume kubistis bersih dengan garis parapet tegas, kanopi kantilever tipis, dan bidang kaca vertikal berbingkai ramping untuk pencahayaan alami maksimal.',
    descriptionEn:
      'Clean cubic massing featuring crisp parapet lines, a slim cantilevered canopy, and slender-framed wide glazing for abundant natural daylight.',
    roofFormId: 'Atap datar parapet + dek membran kedap air',
    roofFormEn: 'Flat parapet roof with waterproof membrane deck',
    complexityMultiplier: 1.0,
    defaultDimensions: {
      landWidth: 10,
      landLength: 16,
      buildingWidth: 7.5,
      buildingLength: 10.5,
      floors: 2,
      orientation: 0,
    },
    defaultMaterials: {
      facadeColor: '#F4F3EF',
      roofMaterial: 'concrete-membrane',
      accentMaterial: 'andesite-stone',
      floorMaterial: 'granite-marble',
    },
    recommendedRoof: ['concrete-membrane', 'bitumen-slate'],
  },
  'tropical-villa': {
    id: 'tropical-villa',
    nameId: 'Tropical Contemporary Villa',
    nameEn: 'Tropical Contemporary Villa',
    taglineId: 'Atap limasan lebar dengan tritisan teduh, kisi kayu, dan beranda tropis',
    taglineEn: 'Wide hip roof with deep overhangs, timber louvers, and tropical veranda',
    descriptionId:
      'Dirancang untuk iklim tropis lembap dengan atap limasan ber-overhang lebar, kisi secondary skin untuk meredam panas matahari, serta bukaan silang ke teras dan taman.',
    descriptionEn:
      'Tailored for humid tropical climates with deep hip-roof overhangs, timber secondary-skin louvers for solar shading, and cross-ventilated veranda openings.',
    roofFormId: 'Atap limasan lebar (overhang 1,1 m)',
    roofFormEn: 'Wide hip roof (1.1 m deep overhang)',
    complexityMultiplier: 1.08,
    defaultDimensions: {
      landWidth: 12,
      landLength: 20,
      buildingWidth: 8.5,
      buildingLength: 12,
      floors: 1,
      orientation: 0,
    },
    defaultMaterials: {
      facadeColor: '#EAE3D2',
      roofMaterial: 'ceramic-tile',
      accentMaterial: 'ulin-wood',
      floorMaterial: 'oak-parquet',
    },
    recommendedRoof: ['ceramic-tile', 'bitumen-slate'],
  },
  'industrial-loft': {
    id: 'industrial-loft',
    nameId: 'Industrial Loft House',
    nameEn: 'Industrial Loft House',
    taglineId: 'Rangka baja gelap terekspos, bukaan tinggi, dan kontras bata atau beton',
    taglineEn: 'Exposed dark steel framing, tall double-height glazing, and brick/concrete contrast',
    descriptionId:
      'Menonjolkan kejujuran struktur kolom-balok baja H-beam gelap, jendela mullion grid tinggi bergaya studio, atap pelana asimetris miring, dan kontras tekstur material ekspos.',
    descriptionEn:
      'Celebrates honest dark H-beam steel framing, tall mullioned loft glazing, an asymmetric mono-pitch gable roof, and tactile exposed masonry surfaces.',
    roofFormId: 'Atap pelana industrial & struktur baja ekspos',
    roofFormEn: 'Industrial mono-gable roof with exposed steel frame',
    complexityMultiplier: 1.05,
    defaultDimensions: {
      landWidth: 10,
      landLength: 16,
      buildingWidth: 7,
      buildingLength: 11,
      floors: 2,
      orientation: 0,
    },
    defaultMaterials: {
      facadeColor: '#9AA09C',
      roofMaterial: 'bitumen-slate',
      accentMaterial: 'exposed-brick',
      floorMaterial: 'exposed-cement',
    },
    recommendedRoof: ['bitumen-slate', 'ceramic-tile'],
  },
  'japandi-compact': {
    id: 'japandi-compact',
    nameId: 'Japandi Compact Home',
    nameEn: 'Japandi Compact Home',
    taglineId: 'Volume kompak tenang, aksen kayu hangat, dan taman dalam (inner courtyard)',
    taglineEn: 'Calm compact volume, warm timber accents, and a serene inner courtyard',
    descriptionId:
      'Menggabungkan efisiensi tata ruang Jepang dan kehangatan Skandinavia: atap pelana sederhana tanpa kerumitan, palet netral tenang, serta taman kering di tengah rumah yang terlihat dari atas atau cutaway.',
    descriptionEn:
      'Blends Japanese spatial efficiency with Scandinavian warmth: clean gable geometry, serene neutral tones, and a central inner courtyard visible from top-down and cutaway views.',
    roofFormId: 'Atap pelana tenang + void taman tengah',
    roofFormEn: 'Calm low-pitch gable + central courtyard void',
    complexityMultiplier: 0.97,
    defaultDimensions: {
      landWidth: 9,
      landLength: 14,
      buildingWidth: 6.5,
      buildingLength: 9.5,
      floors: 1,
      orientation: 0,
    },
    defaultMaterials: {
      facadeColor: '#EAE3D2',
      roofMaterial: 'bitumen-slate',
      accentMaterial: 'ulin-wood',
      floorMaterial: 'oak-parquet',
    },
    recommendedRoof: ['bitumen-slate', 'ceramic-tile'],
  },
};

export interface ColorSwatchOption {
  id: string;
  nameId: string;
  nameEn: string;
  hex: string;
}

export const FACADE_SWATCHES: ColorSwatchOption[] = [
  { id: 'white', nameId: 'White (Putih Kapur)', nameEn: 'Architectural White', hex: '#F4F3EF' },
  { id: 'warm-ivory', nameId: 'Warm Ivory (Gading Hangat)', nameEn: 'Warm Ivory', hex: '#EAE3D2' },
  { id: 'concrete-grey', nameId: 'Concrete Grey (Abu Beton)', nameEn: 'Concrete Grey', hex: '#9AA09C' },
  { id: 'sage', nameId: 'Sage (Hijau Redup)', nameEn: 'Muted Sage', hex: '#9CAF9E' },
  { id: 'terracotta', nameId: 'Terracotta (Terakota)', nameEn: 'Warm Terracotta', hex: '#C97A63' },
];

export interface MaterialOption<T extends string> {
  id: T;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  priceMultiplier: number;
  previewHex: string;
}

export const ROOF_MATERIALS: MaterialOption<RoofMaterial>[] = [
  {
    id: 'ceramic-tile',
    nameId: 'Genteng Keramik',
    nameEn: 'Glazed Ceramic Tile',
    descId: 'Tahan cuaca tropis, meredam panas dan suara hujan dengan profil bergelombang rapi.',
    descEn: 'Durable tropical clay-ceramic profile offering strong thermal and rain-noise insulation.',
    priceMultiplier: 1.0,
    previewHex: '#8E4A3B',
  },
  {
    id: 'bitumen-slate',
    nameId: 'Bitumen Slate',
    nameEn: 'Bitumen Slate Shingle',
    descId: 'Penutup atap tipis modern bertekstur granular gelap, ringan dan kedap air.',
    descEn: 'Slim modern granular slate shingles, lightweight with crisp contemporary lines.',
    priceMultiplier: 1.12,
    previewHex: '#353A3E',
  },
  {
    id: 'concrete-membrane',
    nameId: 'Dak Beton Waterproof',
    nameEn: 'Waterproof Concrete Deck',
    descId: 'Plat beton bertulang dengan membran waterproofing coating untuk rumah beratap datar.',
    descEn: 'Reinforced flat concrete roof deck with elastomeric waterproofing membrane.',
    priceMultiplier: 1.08,
    previewHex: '#7A807D',
  },
];

export const ACCENT_MATERIALS: MaterialOption<AccentMaterial>[] = [
  {
    id: 'ulin-wood',
    nameId: 'Kayu Ulin (Secondary Skin)',
    nameEn: 'Ulin Ironwood Louvers',
    descId: 'Kisi-kisi fasad, plafon tritisan, dan panel aksen kayu keras Kalimantan tahan cuaca.',
    descEn: 'Weather-resistant Borneo ironwood slats applied to secondary-skin louvers and soffits.',
    priceMultiplier: 1.18,
    previewHex: '#7A4E2D',
  },
  {
    id: 'andesite-stone',
    nameId: 'Batu Alam Andesit',
    nameEn: 'Flamed Andesite Stone',
    descId: 'Pasangan batu alam bakar abu gelap pada bidang aksen fasad dan kaki dinding.',
    descEn: 'Textured dark-grey natural andesite stone cladding on feature walls and plinths.',
    priceMultiplier: 1.12,
    previewHex: '#4F5452',
  },
  {
    id: 'exposed-brick',
    nameId: 'Bata Ekspos Terakota',
    nameEn: 'Exposed Terracotta Brick',
    descId: 'Dinding aksen bata merah presisi dengan coating anti-lumut.',
    descEn: 'Precision-laid exposed red clay brickwork sealed with matte protective coating.',
    priceMultiplier: 1.06,
    previewHex: '#9C4F3E',
  },
  {
    id: 'matte-steel',
    nameId: 'Panel Baja Hitam Matte',
    nameEn: 'Matte Charcoal Steel',
    descId: 'Profil baja dan lis aluminium anodized gelap untuk garis fasad tegas.',
    descEn: 'Powder-coated dark steel trims and architectural mullions for crisp framing.',
    priceMultiplier: 1.1,
    previewHex: '#262A2C',
  },
];

export const FLOOR_MATERIALS: MaterialOption<FloorMaterial>[] = [
  {
    id: 'granite-marble',
    nameId: 'Granit / Marmer Terang',
    nameEn: 'Light Granite / Marble Tile',
    descId: 'Homogeneous tile ukuran besar dengan urat batu halus, sejuk dan mudah dirawat.',
    descEn: 'Large-format stone-veined porcelain/marble slab, cool underfoot and easy to maintain.',
    priceMultiplier: 1.15,
    previewHex: '#E7E5DF',
  },
  {
    id: 'oak-parquet',
    nameId: 'Parket Kayu Oak',
    nameEn: 'Engineered Oak Parquet',
    descId: 'Lantai bilah kayu hangat dengan tekstur serat alami untuk kenyamanan ruang dalam.',
    descEn: 'Warm engineered oak planks adding natural grain texture to living and sleeping zones.',
    priceMultiplier: 1.22,
    previewHex: '#B88B5E',
  },
  {
    id: 'exposed-cement',
    nameId: 'Semen Ekspos Poles',
    nameEn: 'Polished Micro-Cement',
    descId: 'Permukaan acian semen halus seamless bernuansa tenang dan monolitik.',
    descEn: 'Seamless troweled micro-cement floor with subtle mineral tonal variation.',
    priceMultiplier: 0.95,
    previewHex: '#9A9E9B',
  },
];

export interface AddonSpec {
  key: keyof AddonsConfig;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  estimatedPriceIdr: number;
  category: 'interior' | 'outdoor';
}

export const ADDON_SPECS: AddonSpec[] = [
  {
    key: 'livingRoomFurniture',
    nameId: 'Furnitur Ruang Tamu',
    nameEn: 'Living Room Furniture',
    descId: 'Sofa L-shape modular, meja kopi kayu, karpet tenun, dan credenza TV.',
    descEn: 'Modular sofa, timber coffee table, woven rug, and low media console.',
    estimatedPriceIdr: 28_500_000,
    category: 'interior',
  },
  {
    key: 'kitchenSet',
    nameId: 'Kitchen Set & Island',
    nameEn: 'Built-in Kitchen Set & Island',
    descId: 'Kabinet bawah-atas HPL tahan lembap, top table batu kuarsa, sink, dan meja saji.',
    descEn: 'Moisture-resistant cabinetry, quartz countertop, sink station, and prep island.',
    estimatedPriceIdr: 36_000_000,
    category: 'interior',
  },
  {
    key: 'masterBedroomFurniture',
    nameId: 'Furnitur Kamar Utama',
    nameEn: 'Master Bedroom Suite',
    descId: 'Ranjang queen ber-headboard, dua nakas, dan lemari pakaian built-in.',
    descEn: 'Queen platform bed with headboard, twin nightstands, and built-in wardrobe.',
    estimatedPriceIdr: 31_000_000,
    category: 'interior',
  },
  {
    key: 'carport',
    nameId: 'Carport & Kanopi',
    nameEn: 'Carport & Canopy',
    descId: 'Perkerasan lantai carport depan dan kanopi rangka baja dengan atap peneduh.',
    descEn: 'Paved front parking apron with structural steel frame shade canopy.',
    estimatedPriceIdr: 24_000_000,
    category: 'outdoor',
  },
  {
    key: 'swimmingPool',
    nameId: 'Kolam Renang Pribadi',
    nameEn: 'Private Plunge Pool',
    descId: 'Kolam renang halaman + dek tepi kayu, sistem sirkulasi pompa, dan lampu kolam.',
    descEn: 'Back/side plunge pool with timber deck coping, filtration pump, and underwater LED.',
    estimatedPriceIdr: 95_000_000,
    category: 'outdoor',
  },
  {
    key: 'solarPanels',
    nameId: 'Panel Surya Atap (PLTS)',
    nameEn: 'Rooftop Solar PV Array',
    descId: 'Modul fotovoltaik monokristalin 3,3 kWp on-grid beserta inverter dan dudukan atap.',
    descEn: '3.3 kWp monocrystalline rooftop solar PV panels with mounting rails and inverter.',
    estimatedPriceIdr: 48_000_000,
    category: 'outdoor',
  },
  {
    key: 'landscape',
    nameId: 'Lanskap & Tanaman Tropis',
    nameEn: 'Tropical Garden & Landscape',
    descId: 'Pohon peneduh, semak tropis, batu pijakan taman, rumput, dan lampu taman.',
    descEn: 'Shade trees, tropical shrubs, stepping stones, turf lawn, and garden bollards.',
    estimatedPriceIdr: 18_500_000,
    category: 'outdoor',
  },
];

export function checkAddonCompatibility(
  addonKey: keyof AddonsConfig,
  houseType: HouseType,
  dimensions: DimensionsConfig
): AddonCompatibility {
  const landArea = dimensions.landWidth * dimensions.landLength;
  const footprint = dimensions.buildingWidth * dimensions.buildingLength;
  const remainingYard = landArea - footprint;
  const frontSetbackLength = dimensions.landLength - dimensions.buildingLength;
  const sideClearance = dimensions.landWidth - dimensions.buildingWidth;

  if (addonKey === 'swimmingPool') {
    if (remainingYard < 26 || (frontSetbackLength < 3.5 && sideClearance < 3.2)) {
      return {
        supported: false,
        reasonId:
          'Sisa lahan terbuka terlalu sempit (< 26 m² atau jarak bebas < 3,2 m) untuk struktur kolam renang yang aman.',
        reasonEn:
          'Remaining open yard is too tight (< 26 m² or clearance < 3.2 m) for a safe pool structure.',
      };
    }
  }

  if (addonKey === 'carport') {
    if (frontSetbackLength < 3.2 && sideClearance < 3.0) {
      return {
        supported: false,
        reasonId:
          'Panjang sisa halaman depan/samping kurang dari 3,2 m sehingga ruang parkir mobil tidak mencukupi.',
        reasonEn:
          'Front/side setback is under 3.2 m, leaving insufficient clearance for vehicle parking.',
      };
    }
  }

  return { supported: true };
}

export interface PlotPreset {
  id: string;
  labelId: string;
  labelEn: string;
  landWidth: number;
  landLength: number;
  buildingWidth: number;
  buildingLength: number;
}

export const PLOT_PRESETS: PlotPreset[] = [
  {
    id: 'compact-90',
    labelId: 'Kavling Kompak 8 × 12 m (96 m²)',
    labelEn: 'Compact Plot 8 × 12 m (96 m²)',
    landWidth: 8,
    landLength: 12,
    buildingWidth: 6,
    buildingLength: 8,
  },
  {
    id: 'urban-150',
    labelId: 'Kavling Keluarga 10 × 15 m (150 m²)',
    labelEn: 'Family Plot 10 × 15 m (150 m²)',
    landWidth: 10,
    landLength: 15,
    buildingWidth: 7.5,
    buildingLength: 10,
  },
  {
    id: 'hoek-240',
    labelId: 'Kavling Villa 12 × 20 m (240 m²)',
    labelEn: 'Villa Plot 12 × 20 m (240 m²)',
    landWidth: 12,
    landLength: 20,
    buildingWidth: 8.5,
    buildingLength: 12,
  },
  {
    id: 'estate-360',
    labelId: 'Kavling Luas 15 × 24 m (360 m²)',
    labelEn: 'Spacious Plot 15 × 24 m (360 m²)',
    landWidth: 15,
    landLength: 24,
    buildingWidth: 10,
    buildingLength: 14,
  },
];

export interface ConstructionStageGuide {
  stage: ConstructionStage;
  titleId: string;
  titleEn: string;
  shortId: string;
  shortEn: string;
  purposeId: string;
  purposeEn: string;
  durationId: string;
  durationEn: string;
  worksId: string[];
  worksEn: string[];
  permitsId: string;
  permitsEn: string;
  inspectionId: string[];
  inspectionEn: string[];
  supervisionTipId: string;
  supervisionTipEn: string;
  recommendedCamera: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export const CONSTRUCTION_STAGES: ConstructionStageGuide[] = [
  {
    stage: 0,
    titleId: 'Pra-Konstruksi & Persiapan Lahan',
    titleEn: 'Pre-Construction & Site Preparation',
    shortId: 'Pra-Konstruksi',
    shortEn: 'Site Prep',
    purposeId:
      'Memastikan batas kavling sah, kontur tanah bersih, patok bouwplank siku, dan dokumen kerja siap sebelum penggalian dimulai.',
    purposeEn:
      'Verify legal plot boundaries, clear topsoil, set orthogonal batter boards (bouwplank), and finalize working drawings before excavation.',
    durationId: '2 - 4 minggu (ilustrasi, tergantung proyek & lokasi)',
    durationEn: '2 - 4 weeks (illustrative, varies by project & location)',
    worksId: [
      'Pembersihan lahan (land clearing) dan perataan tanah awal',
      'Pengukuran ulang batas kavling dan pemasangan pagar kerja sementara',
      'Pemasangan patok dan papan bouwplank untuk as dinding',
      'Penyediaan listrik dan air kerja serta gudang material sederhana',
    ],
    worksEn: [
      'Site clearing, stripping, and initial grading',
      'Boundary verification and temporary work perimeter setup',
      'Batter board (bouwplank) installation marking structural grid axes',
      'Temporary site water, power supply, and material storage shed',
    ],
    permitsId:
      'Persiapkan dokumen PBG (Persetujuan Bangunan Gedung, menggantikan istilah lama IMB), kesesuaian tata ruang (KKPR/KRK daerah), gambar kerja arsitektur-struktur-MEP, dan persetujuan lingkungan warga bila dipersyaratkan pemda.',
    permitsEn:
      'Prepare PBG (Building Approval, replacing legacy IMB terminology), local zoning compliance (GSB/KDB/KLB), coordinated architectural-structural-MEP drawings, and neighborhood notifications per local regulations.',
    inspectionId: [
      'Pastikan diagonal bouwplank benar-benar siku (aturan 3-4-5 atau total station)',
      'Periksa mundur bangunan terhadap Garis Sempadan Bangunan (GSB)',
      'Sepakati jadwal pembayaran bertahap dan spesifikasi tertulis di kontrak',
    ],
    inspectionEn: [
      'Verify diagonal squareness of batter boards (3-4-5 check or theodolite)',
      'Confirm building setbacks against local street boundary lines (GSB)',
      'Lock written material specs and milestone payment schedule in contract',
    ],
    supervisionTipId:
      'Jangan mengizinkan penggalian pondasi sebelum gambar kerja struktur final disetujui insinyur sipil dan titik nol lantai (peil +0.00) ditetapkan di lapangan.',
    supervisionTipEn:
      'Never start trenching before structural drawings are signed off by a qualified engineer and the +0.00 finished floor datum is marked on site.',
    recommendedCamera: { position: [14, 11, 14], target: [0, 0.3, 0] },
  },
  {
    stage: 1,
    titleId: 'Pondasi & Sloof Beton',
    titleEn: 'Foundation & Tie Beams (Sloof)',
    shortId: 'Pondasi & Sloof',
    shortEn: 'Foundation',
    purposeId:
      'Menyalurkan beban bangunan ke lapisan tanah keras secara merata dan mengikat titik tumpuan kolom melalui balok sloof.',
    purposeEn:
      'Transfer structural loads safely into bearing soil strata and tie column footings together via reinforced grade beams (sloof).',
    durationId: '3 - 6 minggu (ilustrasi, tergantung kondisi tanah & cuaca)',
    durationEn: '3 - 6 weeks (illustrative, depends on soil & weather)',
    worksId: [
      'Galian tanah pondasi sesuai kedalaman rencana struktur',
      'Lantai kerja (lean concrete) dan urugan pasir padat',
      'Pemasangan pondasi batu kali dan tapak/cakar ayam beton bertulang (ilustrasi)',
      'Pembesian, bekisting, dan pengecoran balok sloof pengikat bawah',
    ],
    worksEn: [
      'Foundation trenching and footing excavation per structural plan',
      'Compacted sand bed and lean concrete blinding layer',
      'Rubble strip foundation and reinforced concrete pad footings (illustrative)',
      'Rebar cage fabrication, formwork, and concrete pouring for tie beams (sloof)',
    ],
    permitsId:
      'Pastikan laporan penyelidikan tanah (sondir/boring) telah dijadikan dasar perhitungan insinyur struktur dan sesuai dokumen teknis PBG.',
    permitsEn:
      'Ensure soil investigation data (CPT/sondir or boring) underpins structural footing design and aligns with PBG technical filings.',
    inspectionId: [
      'Cek diameter, jarak sengkang, dan selimut beton (concrete cover) tulangan sloof',
      'Pastikan tidak ada air menggenang atau lumpur saat beton dituang',
      'Periksa posisi stek besi kolom sebelum pengecoran sloof dilakukan',
    ],
    inspectionEn: [
      'Verify rebar diameter, stirrup spacing, and concrete cover spacers before pour',
      'Confirm trenches are dewatered and free of mud prior to concreting',
      'Check column starter bar positions against structural grid axes',
    ],
    supervisionTipId:
      'Dokumentasikan foto pembesian pondasi dan sloof sebelum ditutup beton karena pekerjaan bawah tanah tidak bisa diperiksa secara visual setelah ditimbun.',
    supervisionTipEn:
      'Photograph all footing and tie-beam rebar cages with a measuring tape before pouring concrete, as underground work is hidden once backfilled.',
    recommendedCamera: { position: [12, 9, 12], target: [0, 0.4, 0] },
  },
  {
    stage: 2,
    titleId: 'Struktur Utama (Kolom, Balok & Plat)',
    titleEn: 'Primary Structure (Columns, Beams & Slabs)',
    shortId: 'Struktur Utama',
    shortEn: 'Main Structure',
    purposeId:
      'Membentuk rangka pemikul beban vertikal dan gaya gempa agar bangunan kokoh sebelum menerima beban dinding dan atap.',
    purposeEn:
      'Erect the load-bearing vertical and lateral seismic frame supporting floor slabs and roof framing.',
    durationId: '4 - 9 minggu (ilustrasi, 1 vs 2 lantai sangat menentukan)',
    durationEn: '4 - 9 weeks (illustrative, strongly affected by 1 vs 2 floors)',
    worksId: [
      'Pengecoran plat lantai dasar dan pemadatan tanah bawah lantai',
      'Pembesian, bekisting, dan pengecoran kolom struktur utama',
      'Pekerjaan balok induk, ring balk, serta plat lantai 2 dan tangga (bila 2 lantai)',
      'Perawatan kelembapan beton (curing) selama masa pengerasan awal',
    ],
    worksEn: [
      'Ground floor slab-on-grade preparation and concreting',
      'Formwork, reinforcement, and pouring of structural columns',
      'Primary beams, ring beams, plus 2nd-floor slab and staircase (if 2 floors)',
      'Wet curing of exposed concrete members during early strength gain',
    ],
    permitsId:
      'Simpan catatan mutu beton (misal K-250/fc 21 MPa atau sesuai perhitungan struktur) dan uji slump lapangan untuk lampiran pengawasan konstruksi.',
    permitsEn:
      'Retain concrete batch tickets, slump test logs, and cylinder test records for construction quality documentation.',
    inspectionId: [
      'Ukur ketegaklurusan (plumbness) bekisting kolom sebelum dan sesudah cor',
      'Pastikan kait sengkang 135 derajat pada zona tumpuan tahan gempa',
      'Jangan membongkar perancah balok/plat lantai sebelum umur beton mencukupi',
    ],
    inspectionEn: [
      'Check vertical plumbness of column formwork before and after pouring',
      'Verify 135-degree seismic stirrup hooks at beam-column joints',
      'Keep slab and beam shoring props in place until required concrete strength is met',
    ],
    supervisionTipId:
      'Minta kontraktor menyiram atau menyelimuti beton kolom dan plat lantai secara rutin pada 7 hari pertama agar beton tidak retak susut dini.',
    supervisionTipEn:
      'Insist on consistent water curing for at least 7 days after pouring to prevent plastic shrinkage cracking and achieve design strength.',
    recommendedCamera: { position: [13, 8, 13], target: [0, 2.0, 0] },
  },
  {
    stage: 3,
    titleId: 'Dinding, Rangka Atap & Jalur MEP',
    titleEn: 'Walls, Roof Framing & Rough-in MEP',
    shortId: 'Dinding & MEP',
    shortEn: 'Walls & MEP',
    purposeId:
      'Membentuk ruang dalam, memasang rangka atap pelindung cuaca, serta menanam pipa air dan konduit listrik sebelum diplester.',
    purposeEn:
      'Enclose interior rooms, erect roof framing, and install concealed plumbing pipes and electrical conduits prior to plastering.',
    durationId: '4 - 8 minggu (ilustrasi, tergantung luas & kompleksitas MEP)',
    durationEn: '4 - 8 weeks (illustrative, varies by floor area & MEP scope)',
    worksId: [
      'Pasangan dinding bata ringan/bata merah beserta kolom praktis dan balok latai',
      'Pemasangan kuda-kuda dan rangka atap baja ringan/baja atau bekisting dak atap',
      'Penarikan pipa air bersih, air kotor, air limbah, dan ventilasi plumbing',
      'Pemasangan pipa konduit listrik, inbow dus saklar/stopkontak, dan jalur AC',
    ],
    worksEn: [
      'Masonry wall laying with practical tie columns and lintel beams above openings',
      'Roof truss/rafter installation or flat roof parapet framing',
      'Clean water supply, greywater, blackwater, and vent pipe rough-ins',
      'Electrical conduit routing, recessed backboxes, and AC refrigerant/drain lines',
    ],
    permitsId:
      'Pastikan daya listrik PLN, titik meteran air, serta pemisahan septic tank kedap dengan sumur resapan mengikuti standar sanitasi setempat.',
    permitsEn:
      'Coordinate utility meter placements and ensure sealed septic/bio-tank separation from infiltration wells meets local sanitation standards.',
    inspectionId: [
      'Lakukan uji tekan pipa air bersih dan uji alir kemiringan pipa pembuangan sebelum dinding ditutup',
      'Cocokkan tinggi saklar, stopkontak, dan kran dengan layout furnitur/kitchen set',
      'Periksa angkur pengikat rangka atap ke ring balk beton',
    ],
    inspectionEn: [
      'Pressure-test supply pipes and flow-test drain slopes before wall plastering',
      'Cross-check outlet and faucet heights against kitchen and furniture layouts',
      'Inspect roof truss hold-down anchors bolted into concrete ring beams',
    ],
    supervisionTipId:
      'Wajib buat gambar as-built atau foto jalur pipa dan kabel di dinding sebelum plesteran dimulai agar kelak pengeboran dinding tidak mengenai pipa/kabel.',
    supervisionTipEn:
      'Always photograph every wall showing concealed pipes and conduits before plastering so future wall drilling never punctures utilities.',
    recommendedCamera: { position: [12, 7.5, 13], target: [0, 2.2, 0] },
  },
  {
    stage: 4,
    titleId: 'Finishing Eksterior, Atap & Kaca',
    titleEn: 'Exterior Finishing, Roofing & Glazing',
    shortId: 'Finishing Eksterior',
    shortEn: 'Exterior Finish',
    purposeId:
      'Menutup selubung bangunan sepenuhnya dari hujan dan panas matahari melalui penutup atap, kusen kaca, plester-aci, dan material fasad.',
    purposeEn:
      'Make the building fully weather-tight with final roof coverings, window/door glazing, exterior render, waterproofing, and facade accents.',
    durationId: '4 - 7 minggu (ilustrasi, tergantung detail fasad)',
    durationEn: '4 - 7 weeks (illustrative, depends on facade detailing)',
    worksId: [
      'Pemasangan penutup atap final, nok, talang, dan flashing anti-bocor',
      'Plesteran, acian, waterproofing area basah/dak, dan pengecatan eksterior weatherproof',
      'Pemasangan kusen aluminium/kayu, daun pintu utama, dan kaca jendela',
      'Pemasangan secondary skin kayu ulin, batu alam andesit, atau aksen fasad pilihan',
    ],
    worksEn: [
      'Final roof tile/slate/membrane installation, ridge caps, gutters, and flashing',
      'Exterior plastering, skim coat, wet-area waterproofing, and weatherproof paint',
      'Window and door frames, glazing panels, and perimeter weather-sealant',
      'Installation of Ulin timber louvers, Andesite stone cladding, or brick accents',
    ],
    permitsId:
      'Pastikan saluran air hujan kavling tidak melimpas ke lahan tetangga sesuai ketentuan bangunan gedung daerah.',
    permitsEn:
      'Ensure roof rainwater downspouts discharge into on-site drainage/infiltration rather than neighboring plots.',
    inspectionId: [
      'Lakukan tes rendam (flood test 24-48 jam) pada dak beton dan kamar mandi lantai atas',
      'Semprot uji bocor pada pertemuan kusen jendela dan flashing atap',
      'Periksa kerataan bidang plester dinding pada cahaya miring sore hari',
    ],
    inspectionEn: [
      'Run a 24-48 hour ponding test on flat roofs and upper-floor wet bathrooms',
      'Hose-test window perimeter sealants and roof wall flashings for leaks',
      'Inspect facade wall flatness under raking afternoon sunlight',
    ],
    supervisionTipId:
      'Jangan mengecat dinding eksterior sebelum kadar lembap acian benar-benar kering agar cat tidak menggelembung atau mengelupas dalam beberapa bulan.',
    supervisionTipEn:
      'Check wall moisture before applying exterior primer and topcoat; painting over damp render causes blistering and peeling.',
    recommendedCamera: { position: [13, 6.5, 14], target: [0, 2.2, 0] },
  },
  {
    stage: 5,
    titleId: 'Interior, Furnitur, Add-ons & Lanskap',
    titleEn: 'Interior Finishes, Furniture & Landscape',
    shortId: 'Interior & Lanskap',
    shortEn: 'Interior & Final',
    purposeId:
      'Menyelesaikan lantai interior, plafon, armatur lampu, sanitair, built-in furnitur, serta fitur luar ruang hingga rumah siap huni.',
    purposeEn:
      'Complete interior flooring, ceilings, lighting fixtures, sanitaryware, custom cabinetry, and outdoor amenities ready for handover.',
    durationId: '3 - 6 minggu (ilustrasi, tergantung paket interior & lanskap)',
    durationEn: '3 - 6 weeks (illustrative, depends on interior & outdoor scope)',
    worksId: [
      'Pemasangan lantai interior (granit/marmer, parket oak, atau semen ekspos)',
      'Pemasangan plafon, lampu interior/eksterior, saklar, dan perlengkapan sanitair',
      'Instalasi furnitur ruang tamu, kitchen set, dan kamar utama sesuai pilihan',
      'Penyelesaian carport, kolam renang, panel surya, dan penanaman lanskap',
    ],
    worksEn: [
      'Interior floor finish installation (granite/marble, oak parquet, or micro-cement)',
      'Ceilings, warm architectural luminaires, switchgear, and sanitary fixtures',
      'Placement of living room, kitchen set, and master bedroom furniture add-ons',
      'Completion of carport, plunge pool, solar PV array, and garden planting',
    ],
    permitsId:
      'Siapkan pemeriksaan kelayakan fungsi untuk pengajuan SLF (Sertifikat Laik Fungsi) sesuai ketentuan pemda, garansi instalasi, dan berita acara serah terima (BAST). Catatan: aplikasi ini bersifat edukatif dan bukan penerbit izin maupun nasihat hukum.',
    permitsEn:
      'Prepare post-construction commissioning records for SLF (Certificate of Worthiness, per local regulations), equipment warranties, and handover sign-off (BAST). Note: this guidance is educational, not legal advice.',
    inspectionId: [
      'Buat daftar periksa cacat akhir (punch list / defect list) per ruangan bersama kontraktor',
      'Uji seluruh MCB listrik, grounding/arde, tekanan kran, dan pembuangan lantai',
      'Pastikan kemiringan lantai kamar mandi mengarah tepat ke floor drain tanpa genangan',
    ],
    inspectionEn: [
      'Walk every room to compile a written punch-list before releasing retention payment',
      'Test all circuit breakers, earthing/RCD protection, water pressure, and floor drains',
      'Verify bathroom floor gradients drain cleanly toward floor traps with zero pooling',
    ],
    supervisionTipId:
      'Tahan retensi pembayaran akhir (umumnya 5%) selama masa pemeliharaan kontrak (misal 3-6 bulan) untuk memastikan kebocoran musiman atau retak rambut diperbaiki kontraktor.',
    supervisionTipEn:
      'Hold a contract retention sum (typically 5%) through the defects liability period (e.g., 3-6 months) to cover seasonal leaks or settlement hairline cracks.',
    recommendedCamera: { position: [14, 7.5, 15], target: [0, 1.8, 0] },
  },
];
