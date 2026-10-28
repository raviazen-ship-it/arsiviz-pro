import { z } from 'zod';
import { HOUSE_SPECS } from '@/lib/catalog';
import {
  BookingRecord,
  ConsultationSlot,
  ConsultationType,
  DimensionsConfig,
  Language,
  ProjectConfig,
} from '@/types/project';

export const CURRENT_SCHEMA_VERSION = 2;

const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus berupa kode HEX 6 digit (contoh #F4F3EF)');

export const DimensionsSchema = z
  .object({
    landWidth: z.number().min(6).max(40),
    landLength: z.number().min(8).max(50),
    buildingWidth: z.number().min(4).max(36),
    buildingLength: z.number().min(5).max(44),
    floors: z.union([z.literal(1), z.literal(2)]),
    orientation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]),
  })
  .refine((d) => d.buildingWidth <= d.landWidth, {
    message: 'Lebar bangunan tidak boleh melebihi lebar lahan.',
    path: ['buildingWidth'],
  })
  .refine((d) => d.buildingLength <= d.landLength, {
    message: 'Panjang bangunan tidak boleh melebihi panjang lahan.',
    path: ['buildingLength'],
  });

export const MaterialsSchema = z.object({
  facadeColor: HexColorSchema,
  roofMaterial: z.enum(['ceramic-tile', 'bitumen-slate', 'concrete-membrane']),
  accentMaterial: z.enum(['ulin-wood', 'andesite-stone', 'exposed-brick', 'matte-steel']),
  floorMaterial: z.enum(['granite-marble', 'oak-parquet', 'exposed-cement']),
});

export const AddonsSchema = z.object({
  livingRoomFurniture: z.boolean(),
  kitchenSet: z.boolean(),
  masterBedroomFurniture: z.boolean(),
  swimmingPool: z.boolean(),
  solarPanels: z.boolean(),
  carport: z.boolean(),
  landscape: z.boolean(),
});

export const SceneSettingsSchema = z.object({
  constructionStage: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  cutaway: z.boolean(),
  showGrid: z.boolean(),
  showDimensions: z.boolean(),
  autoRotate: z.boolean(),
  cameraPreset: z.enum(['perspective', 'front', 'top', 'interior']),
  sunTime: z.number().min(6).max(21),
});

const OptionalRateSchema = z.number().min(0).max(100_000_000).optional();

export const RABAssumptionsSchema = z.object({
  unitRateOverrides: z
    .object({
      sitePrepPerM2: OptionalRateSchema,
      foundationPerM2: OptionalRateSchema,
      structurePerM2: OptionalRateSchema,
      wallsPerM2: OptionalRateSchema,
      roofBasePerM2: OptionalRateSchema,
      openingsPerM2: OptionalRateSchema,
      facadeBasePerM2: OptionalRateSchema,
      floorBasePerM2: OptionalRateSchema,
      mepPerM2: OptionalRateSchema,
    })
    .default({}),
  contingencyPercent: z.number().min(0).max(30),
  landPricePerM2: z.number().min(0).max(250_000_000),
});

export const ProjectConfigSchema: z.ZodType<ProjectConfig, z.ZodTypeDef, unknown> = z.object({
  projectId: z.string().min(3).max(80),
  name: z.string().trim().min(1).max(80),
  createdAt: z.string().min(10),
  updatedAt: z.string().min(10),
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  houseType: z.enum([
    'modern-minimalist',
    'tropical-villa',
    'industrial-loft',
    'japandi-compact',
  ]),
  dimensions: DimensionsSchema,
  materials: MaterialsSchema,
  addons: AddonsSchema,
  scene: SceneSettingsSchema,
  rabAssumptions: RABAssumptionsSchema,
  thumbnailDataUrl: z
    .string()
    .max(600_000)
    .refine(
      (val) => val.startsWith('data:image/') || val.length === 0,
      'Thumbnail harus berupa data URI gambar yang aman.'
    )
    .optional(),
});

export function createDefaultProject(name = 'Rumah Tropis Keluarga'): ProjectConfig {
  const now = new Date().toISOString();
  const baseSpec = HOUSE_SPECS['tropical-villa'];
  return {
    projectId: `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    createdAt: now,
    updatedAt: now,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    houseType: 'tropical-villa',
    dimensions: { ...baseSpec.defaultDimensions },
    materials: { ...baseSpec.defaultMaterials },
    addons: {
      livingRoomFurniture: true,
      kitchenSet: true,
      masterBedroomFurniture: true,
      swimmingPool: false,
      solarPanels: false,
      carport: true,
      landscape: true,
    },
    scene: {
      constructionStage: 5,
      cutaway: false,
      showGrid: true,
      showDimensions: true,
      autoRotate: false,
      cameraPreset: 'perspective',
      sunTime: 9.5,
    },
    rabAssumptions: {
      unitRateOverrides: {},
      contingencyPercent: 10,
      landPricePerM2: 0,
    },
  };
}

export interface DimensionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDimensionsDetailed(
  dims: DimensionsConfig,
  lang: Language = 'id'
): DimensionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Number.isFinite(dims.landWidth) || dims.landWidth < 6 || dims.landWidth > 40) {
    errors.push(
      lang === 'id'
        ? 'Lebar lahan harus bernilai antara 6 m hingga 40 m.'
        : 'Plot width must be between 6 m and 40 m.'
    );
  }
  if (!Number.isFinite(dims.landLength) || dims.landLength < 8 || dims.landLength > 50) {
    errors.push(
      lang === 'id'
        ? 'Panjang lahan harus bernilai antara 8 m hingga 50 m.'
        : 'Plot length must be between 8 m and 50 m.'
    );
  }
  if (!Number.isFinite(dims.buildingWidth) || dims.buildingWidth < 4 || dims.buildingWidth > 36) {
    errors.push(
      lang === 'id'
        ? 'Lebar bangunan harus bernilai antara 4 m hingga 36 m.'
        : 'Building width must be between 4 m and 36 m.'
    );
  }
  if (
    !Number.isFinite(dims.buildingLength) ||
    dims.buildingLength < 5 ||
    dims.buildingLength > 44
  ) {
    errors.push(
      lang === 'id'
        ? 'Panjang bangunan harus bernilai antara 5 m hingga 44 m.'
        : 'Building length must be between 5 m and 44 m.'
    );
  }

  if (dims.buildingWidth > dims.landWidth) {
    errors.push(
      lang === 'id'
        ? `Lebar bangunan (${dims.buildingWidth} m) melebihi lebar lahan (${dims.landWidth} m).`
        : `Building width (${dims.buildingWidth} m) exceeds plot width (${dims.landWidth} m).`
    );
  }
  if (dims.buildingLength > dims.landLength) {
    errors.push(
      lang === 'id'
        ? `Panjang bangunan (${dims.buildingLength} m) melebihi panjang lahan (${dims.landLength} m).`
        : `Building length (${dims.buildingLength} m) exceeds plot length (${dims.landLength} m).`
    );
  }

  if (errors.length === 0) {
    const kdbRatio = (dims.buildingWidth * dims.buildingLength) / (dims.landWidth * dims.landLength);
    if (kdbRatio > 0.75) {
      warnings.push(
        lang === 'id'
          ? `Tutupan tapak mencapai ${Math.round(
              kdbRatio * 100
            )}% lahan. Periksa ketentuan KDB & ruang terbuka hijau daerah setempat (umumnya maks. 60%-70%).`
          : `Building footprint covers ${Math.round(
              kdbRatio * 100
            )}% of the plot. Verify local lot coverage (KDB) & green-space rules (often max 60%-70%).`
      );
    }
    if (dims.landLength - dims.buildingLength < 2.5) {
      warnings.push(
        lang === 'id'
          ? 'Sisa jarak depan/belakang kurang dari 2,5 m. Pastikan mematuhi Garis Sempadan Bangunan (GSB) setempat.'
          : 'Front/rear clearance is under 2.5 m. Ensure compliance with local street setback lines (GSB).'
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export type ImportParseResult =
  | { success: true; project: ProjectConfig; migrated: boolean }
  | { success: false; error: string };

/**
 * Memvalidasi dan memigrasikan data JSON proyek (mendukung migrasi schemaVersion 1 -> 2).
 * Tidak pernah menjalankan kode dari file impor.
 */
export function parseAndMigrateProjectJson(
  rawInput: string | unknown,
  lang: Language = 'id'
): ImportParseResult {
  let parsed: unknown = rawInput;

  if (typeof rawInput === 'string') {
    if (rawInput.length > 1_200_000) {
      return {
        success: false,
        error:
          lang === 'id'
            ? 'Ukuran file JSON melebihi batas aman (maksimal 1,2 MB).'
            : 'JSON file exceeds the 1.2 MB safety limit.',
      };
    }
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return {
        success: false,
        error:
          lang === 'id'
            ? 'File bukan format JSON yang valid atau isinya terpotong.'
            : 'File is not valid JSON or appears truncated.',
      };
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      error:
        lang === 'id'
          ? 'Struktur data proyek tidak dikenali (harus berupa objek konfigurasi ArsiViz Pro).'
          : 'Unrecognized project structure (expected an ArsiViz Pro configuration object).',
    };
  }

  // Unwrap envelope if exported inside { app: 'arsiviz-pro', project: {...} }
  const record = parsed as Record<string, unknown>;
  const candidate =
    record.project && typeof record.project === 'object' && !Array.isArray(record.project)
      ? (record.project as Record<string, unknown>)
      : record;

  let migrated = false;
  const fallback = createDefaultProject();

  // Migrate schemaVersion 1 or missing minor fields safely
  if (candidate.schemaVersion === 1) {
    migrated = true;
    const oldMats =
      candidate.materials && typeof candidate.materials === 'object'
        ? (candidate.materials as Record<string, unknown>)
        : {};
    candidate.schemaVersion = CURRENT_SCHEMA_VERSION;
    candidate.materials = {
      facadeColor:
        typeof oldMats.facadeColor === 'string'
          ? oldMats.facadeColor
          : fallback.materials.facadeColor,
      roofMaterial:
        oldMats.roofMaterial === 'ceramic-tile' ||
        oldMats.roofMaterial === 'bitumen-slate' ||
        oldMats.roofMaterial === 'concrete-membrane'
          ? oldMats.roofMaterial
          : fallback.materials.roofMaterial,
      accentMaterial:
        oldMats.accentMaterial === 'ulin-wood' ||
        oldMats.accentMaterial === 'andesite-stone' ||
        oldMats.accentMaterial === 'exposed-brick' ||
        oldMats.accentMaterial === 'matte-steel'
          ? oldMats.accentMaterial
          : fallback.materials.accentMaterial,
      floorMaterial:
        oldMats.floorMaterial === 'granite-marble' ||
        oldMats.floorMaterial === 'oak-parquet' ||
        oldMats.floorMaterial === 'exposed-cement'
          ? oldMats.floorMaterial
          : fallback.materials.floorMaterial,
    };
    if (!candidate.scene || typeof candidate.scene !== 'object') {
      candidate.scene = { ...fallback.scene };
    }
    if (!candidate.rabAssumptions || typeof candidate.rabAssumptions !== 'object') {
      candidate.rabAssumptions = { ...fallback.rabAssumptions };
    }
  } else if (
    typeof candidate.schemaVersion === 'number' &&
    candidate.schemaVersion > CURRENT_SCHEMA_VERSION
  ) {
    return {
      success: false,
      error:
        lang === 'id'
          ? `Versi skema file (${candidate.schemaVersion}) lebih baru daripada aplikasi ini (v${CURRENT_SCHEMA_VERSION}).`
          : `File schema version (${candidate.schemaVersion}) is newer than this app supports (v${CURRENT_SCHEMA_VERSION}).`,
    };
  }

  const check = ProjectConfigSchema.safeParse(candidate);
  if (!check.success) {
    const firstIssue = check.error.issues[0];
    const fieldPath = firstIssue ? firstIssue.path.join('.') : 'root';
    return {
      success: false,
      error:
        lang === 'id'
          ? `Konfigurasi tidak valid pada "${fieldPath || 'struktur utama'}": ${
              firstIssue?.message ?? 'format tidak sesuai'
            }`
          : `Invalid configuration at "${fieldPath || 'root'}": ${
              firstIssue?.message ?? 'schema mismatch'
            }`,
    };
  }

  return {
    success: true,
    project: check.data,
    migrated,
  };
}

export interface BookingInputDraft {
  name: string;
  email: string;
  phone: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredSlot: ConsultationSlot;
  notes: string;
  consentToContact: boolean;
}

export function validateBookingInput(
  input: BookingInputDraft,
  lang: Language = 'id'
): { valid: boolean; fieldErrors: Partial<Record<keyof BookingInputDraft, string>> } {
  const fieldErrors: Partial<Record<keyof BookingInputDraft, string>> = {};

  if (!input.name || input.name.trim().length < 2) {
    fieldErrors.name =
      lang === 'id' ? 'Nama lengkap minimal 2 karakter.' : 'Full name must be at least 2 characters.';
  }

  const trimmedEmail = input.email.trim();
  const trimmedPhone = input.phone.trim();

  if (!trimmedEmail && !trimmedPhone) {
    const msg =
      lang === 'id'
        ? 'Isi minimal salah satu: alamat email atau nomor WhatsApp/telepon.'
        : 'Provide at least an email address or a phone/WhatsApp number.';
    fieldErrors.email = msg;
    fieldErrors.phone = msg;
  } else {
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      fieldErrors.email =
        lang === 'id' ? 'Format alamat email tidak valid.' : 'Invalid email address format.';
    }
    if (trimmedPhone && !/^[+\d][\d\s-]{7,17}$/.test(trimmedPhone)) {
      fieldErrors.phone =
        lang === 'id'
          ? 'Nomor kontak harus terdiri dari 8-16 digit angka.'
          : 'Phone number must contain 8-16 digits.';
    }
  }

  if (!input.preferredDate) {
    fieldErrors.preferredDate =
      lang === 'id' ? 'Pilih tanggal rencana konsultasi.' : 'Select a preferred consultation date.';
  } else {
    const picked = new Date(`${input.preferredDate}T00:00:00`);
    if (Number.isNaN(picked.getTime())) {
      fieldErrors.preferredDate =
        lang === 'id' ? 'Tanggal tidak valid.' : 'Invalid date value.';
    }
  }

  if (!input.consentToContact) {
    fieldErrors.consentToContact =
      lang === 'id'
        ? 'Centang persetujuan agar tim arsitek dapat menghubungi Anda.'
        : 'Please confirm consent to be contacted regarding this project.';
  }

  return {
    valid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
  };
}

export const BookingRecordSchema: z.ZodType<BookingRecord> = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  consultationType: z.enum([
    'concept-design',
    'rab-review',
    'renovation',
    'initial-consultation',
  ]),
  preferredDate: z.string(),
  preferredSlot: z.enum([
    '09:00 - 10:00',
    '11:00 - 12:00',
    '14:00 - 15:00',
    '16:00 - 17:00',
  ]),
  notes: z.string(),
  consentToContact: z.boolean(),
  deliveryStatus: z.enum(['local-demo-saved', 'backend-delivered']),
  projectSummary: z.object({
    projectId: z.string(),
    projectName: z.string(),
    houseType: z.enum([
      'modern-minimalist',
      'tropical-villa',
      'industrial-loft',
      'japandi-compact',
    ]),
    landAreaM2: z.number(),
    buildingAreaM2: z.number(),
    floors: z.number(),
    estimatedRabIdr: z.number(),
    snapshotDataUrl: z.string().optional(),
  }),
});
