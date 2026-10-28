import {
  BookingRecordSchema,
  CURRENT_SCHEMA_VERSION,
  parseAndMigrateProjectJson,
  ProjectConfigSchema,
} from '@/lib/validation';
import { BookingRecord, Language, ProjectConfig } from '@/types/project';

const PROJECTS_STORAGE_KEY = 'arsiviz_pro_projects_v2';
const ACTIVE_PROJECT_KEY = 'arsiviz_pro_active_project_v2';
const BOOKINGS_STORAGE_KEY = 'arsiviz_pro_demo_bookings_v2';
const PREFERENCES_KEY = 'arsiviz_pro_prefs_v2';

export interface BackendConnectionStatus {
  isCloudConfigured: boolean;
  modeLabelId: string;
  modeLabelEn: string;
  detailId: string;
  detailEn: string;
}

/**
 * Abstraction layer untuk status penyimpanan & autentikasi.
 * Jujur menampilkan Demo Mode lokal jika backend (mis. Supabase) belum dikonfigurasi.
 */
export function getBackendStatus(): BackendConnectionStatus {
  const hasSupabase =
    typeof process !== 'undefined' &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    process.env.NEXT_PUBLIC_BACKEND_MODE === 'supabase';

  if (hasSupabase) {
    return {
      isCloudConfigured: true,
      modeLabelId: 'Cloud Terhubung',
      modeLabelEn: 'Cloud Connected',
      detailId: 'Sinkronisasi proyek aktif melalui layanan backend terkonfigurasi.',
      detailEn: 'Project sync is active via your configured backend service.',
    };
  }

  return {
    isCloudConfigured: false,
    modeLabelId: 'Demo Mode (Lokal)',
    modeLabelEn: 'Demo Mode (Local)',
    detailId:
      'Autentikasi cloud belum dikonfigurasi. Proyek dan draft booking hanya disimpan di browser perangkat ini.',
    detailEn:
      'Cloud auth is not configured. Projects and booking drafts are saved only in this device browser.',
  };
}

export interface StorageOperationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__arsiviz_storage_probe__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function loadSavedProjects(lang: Language = 'id'): StorageOperationResult<ProjectConfig[]> {
  if (!isLocalStorageAvailable()) {
    return {
      ok: false,
      data: [],
      error:
        lang === 'id'
          ? 'Penyimpanan browser (localStorage) tidak tersedia atau diblokir pada mode privasi ini.'
          : 'Browser localStorage is unavailable or blocked in this privacy mode.',
    };
  }

  try {
    const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return { ok: true, data: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { ok: true, data: [] };

    const validProjects: ProjectConfig[] = [];
    for (const entry of parsed) {
      const result = parseAndMigrateProjectJson(entry, lang);
      if (result.success) {
        validProjects.push(result.project);
      }
    }
    return { ok: true, data: validProjects };
  } catch {
    return {
      ok: false,
      data: [],
      error:
        lang === 'id'
          ? 'Sebagian data proyek lokal rusak dan diabaikan untuk menjaga kestabilan aplikasi.'
          : 'Some local project data was corrupted and skipped to keep the app stable.',
    };
  }
}

export function persistSavedProjects(
  projects: ProjectConfig[],
  lang: Language = 'id'
): StorageOperationResult<ProjectConfig[]> {
  if (!isLocalStorageAvailable()) {
    return {
      ok: false,
      error:
        lang === 'id'
          ? 'Tidak dapat menyimpan: localStorage browser tidak tersedia atau dinonaktifkan.'
          : 'Cannot save: browser localStorage is unavailable or disabled.',
    };
  }

  try {
    const validated = projects.filter((p) => ProjectConfigSchema.safeParse(p).success);
    window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(validated));
    return { ok: true, data: validated };
  } catch {
    return {
      ok: false,
      error:
        lang === 'id'
          ? 'Penyimpanan lokal penuh (kuota browser terlampaui). Hapus proyek lama atau ekspor ke file JSON.'
          : 'Local storage quota exceeded. Delete older saved projects or export as JSON.',
    };
  }
}

export function loadActiveDraftProject(lang: Language = 'id'): ProjectConfig | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (!raw) return null;
    const res = parseAndMigrateProjectJson(raw, lang);
    return res.success ? res.project : null;
  } catch {
    return null;
  }
}

export function saveActiveDraftProject(project: ProjectConfig): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    const check = ProjectConfigSchema.safeParse(project);
    if (!check.success) return false;
    window.localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(check.data));
    return true;
  } catch {
    return false;
  }
}

export function createProjectExportPayload(project: ProjectConfig): string {
  return JSON.stringify(
    {
      app: 'ArsiViz Pro',
      exportedAt: new Date().toISOString(),
      schemaVersion: CURRENT_SCHEMA_VERSION,
      project,
    },
    null,
    2
  );
}

export function loadDemoBookings(): BookingRecord[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is BookingRecord => BookingRecordSchema.safeParse(item).success);
  } catch {
    return [];
  }
}

export function saveDemoBooking(
  record: BookingRecord,
  lang: Language = 'id'
): StorageOperationResult<BookingRecord> {
  if (!isLocalStorageAvailable()) {
    return {
      ok: false,
      error:
        lang === 'id'
          ? 'Penyimpanan lokal tidak tersedia sehingga draf konsultasi tidak dapat dicatat.'
          : 'Local storage is unavailable, so the consultation draft could not be recorded.',
    };
  }
  try {
    const existing = loadDemoBookings();
    const updated = [record, ...existing].slice(0, 20);
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
    return { ok: true, data: record };
  } catch {
    return {
      ok: false,
      error:
        lang === 'id'
          ? 'Kuota penyimpanan browser penuh saat menyimpan draf permintaan konsultasi.'
          : 'Browser storage quota reached while saving consultation request draft.',
    };
  }
}

export interface StoredUIPreferences {
  theme: 'light' | 'dark';
  language: 'id' | 'en';
  onboardingDismissed: boolean;
}

export function loadUIPreferences(): StoredUIPreferences | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      theme: p.theme === 'dark' ? 'dark' : 'light',
      language: p.language === 'en' ? 'en' : 'id',
      onboardingDismissed: Boolean(p.onboardingDismissed),
    };
  } catch {
    return null;
  }
}

export function saveUIPreferences(prefs: StoredUIPreferences): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore quota failure on non-critical UI prefs
  }
}
