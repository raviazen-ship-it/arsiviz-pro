import { create } from 'zustand';
import { checkAddonCompatibility, HOUSE_SPECS } from '@/lib/catalog';
import {
  loadActiveDraftProject,
  loadSavedProjects,
  persistSavedProjects,
  saveActiveDraftProject,
} from '@/lib/storage';
import {
  createDefaultProject,
  parseAndMigrateProjectJson,
} from '@/lib/validation';
import {
  AddonsConfig,
  ConstructionStage,
  DimensionsConfig,
  EditableRateKey,
  HouseType,
  Language,
  MaterialsConfig,
  ProjectConfig,
  SceneSettings,
} from '@/types/project';

const MAX_HISTORY = 35;

function cloneProject(p: ProjectConfig): ProjectConfig {
  return JSON.parse(JSON.stringify(p)) as ProjectConfig;
}

export interface HouseSwitchNotice {
  adjustedNotesId: string[];
  adjustedNotesEn: string[];
}

interface ProjectStoreState {
  project: ProjectConfig;
  savedProjects: ProjectConfig[];
  past: ProjectConfig[];
  future: ProjectConfig[];
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
  isHydrated: boolean;
  storageWarning: string | null;

  hydrate: (lang?: Language) => void;
  undo: () => boolean;
  redo: () => boolean;

  setProjectName: (name: string) => void;
  setHouseType: (houseType: HouseType) => HouseSwitchNotice;
  updateDimensions: (patch: Partial<DimensionsConfig>) => void;
  fitBuildingToSafePlot: () => void;
  updateMaterials: (patch: Partial<MaterialsConfig>) => void;
  toggleAddon: (key: keyof AddonsConfig, forceValue?: boolean) => {
    changed: boolean;
    reasonId?: string;
    reasonEn?: string;
  };
  updateScene: (patch: Partial<SceneSettings>, recordHistory?: boolean) => void;
  setConstructionStage: (stage: ConstructionStage, recordHistory?: boolean) => void;

  setUnitRateOverride: (key: EditableRateKey, rate: number | undefined) => void;
  setContingencyPercent: (percent: number) => void;
  setLandPricePerM2: (price: number) => void;
  resetRabAssumptions: () => void;

  resetConfiguration: () => void;
  createNewProject: (name?: string) => void;

  saveCurrentProject: (
    lang?: Language,
    thumbnailDataUrl?: string
  ) => { ok: boolean; error?: string };
  loadSavedProject: (projectId: string) => boolean;
  duplicateSavedProject: (
    projectId: string,
    lang?: Language
  ) => { ok: boolean; newProject?: ProjectConfig; error?: string };
  renameSavedProject: (
    projectId: string,
    newName: string,
    lang?: Language
  ) => { ok: boolean; error?: string };
  deleteSavedProject: (
    projectId: string,
    lang?: Language
  ) => { ok: boolean; error?: string };
  importProjectJson: (
    rawJson: string,
    lang?: Language
  ) => { ok: boolean; migrated?: boolean; error?: string; project?: ProjectConfig };
}

export const useProjectStore = create<ProjectStoreState>((set, get) => {
  const commitChange = (
    updater: (current: ProjectConfig) => ProjectConfig,
    recordHistory = true
  ) => {
    set((state) => {
      const previous = cloneProject(state.project);
      const updated = updater(cloneProject(state.project));
      updated.updatedAt = new Date().toISOString();
      saveActiveDraftProject(updated);

      if (!recordHistory) {
        return {
          project: updated,
          hasUnsavedChanges: true,
        };
      }

      const nextPast = [...state.past, previous].slice(-MAX_HISTORY);
      return {
        project: updated,
        past: nextPast,
        future: [],
        hasUnsavedChanges: true,
      };
    });
  };

  return {
    project: createDefaultProject(),
    savedProjects: [],
    past: [],
    future: [],
    hasUnsavedChanges: false,
    lastSavedAt: null,
    isHydrated: false,
    storageWarning: null,

    hydrate: (lang = 'id') => {
      const savedRes = loadSavedProjects(lang);
      const activeDraft = loadActiveDraftProject(lang);
      const savedList = savedRes.data ?? [];

      const initialProject =
        activeDraft ?? (savedList.length > 0 ? cloneProject(savedList[0]) : createDefaultProject());

      const matchingSaved = savedList.find((s) => s.projectId === initialProject.projectId);

      set({
        project: initialProject,
        savedProjects: savedList,
        isHydrated: true,
        lastSavedAt: matchingSaved ? matchingSaved.updatedAt : null,
        hasUnsavedChanges: matchingSaved
          ? matchingSaved.updatedAt !== initialProject.updatedAt
          : false,
        storageWarning: savedRes.ok ? null : savedRes.error ?? null,
      });
    },

    undo: () => {
      const { past, project, future } = get();
      if (past.length === 0) return false;
      const previous = past[past.length - 1];
      const remainingPast = past.slice(0, -1);
      saveActiveDraftProject(previous);
      set({
        project: cloneProject(previous),
        past: remainingPast,
        future: [cloneProject(project), ...future].slice(0, MAX_HISTORY),
        hasUnsavedChanges: true,
      });
      return true;
    },

    redo: () => {
      const { past, project, future } = get();
      if (future.length === 0) return false;
      const next = future[0];
      const remainingFuture = future.slice(1);
      saveActiveDraftProject(next);
      set({
        project: cloneProject(next),
        past: [...past, cloneProject(project)].slice(-MAX_HISTORY),
        future: remainingFuture,
        hasUnsavedChanges: true,
      });
      return true;
    },

    setProjectName: (name: string) => {
      const cleaned = name.slice(0, 80);
      commitChange((curr) => ({
        ...curr,
        name: cleaned || curr.name,
      }));
    },

    setHouseType: (houseType: HouseType) => {
      const adjustedNotesId: string[] = [];
      const adjustedNotesEn: string[] = [];
      const spec = HOUSE_SPECS[houseType];

      commitChange((curr) => {
        if (curr.houseType === houseType) return curr;
        const nextMaterials = { ...curr.materials };

        // Adapt incompatible roof covering between flat parapet vs pitched roofs without resetting compatible choices
        if (houseType === 'modern-minimalist' && nextMaterials.roofMaterial === 'ceramic-tile') {
          nextMaterials.roofMaterial = 'concrete-membrane';
          adjustedNotesId.push(
            'Penutup atap disesuaikan ke Dak Beton Waterproof mengikuti atap datar Modern Minimalist.'
          );
          adjustedNotesEn.push(
            'Roof material adjusted to Waterproof Concrete Deck to match the flat parapet design.'
          );
        } else if (
          houseType !== 'modern-minimalist' &&
          nextMaterials.roofMaterial === 'concrete-membrane'
        ) {
          nextMaterials.roofMaterial = spec.defaultMaterials.roofMaterial;
          adjustedNotesId.push(
            'Penutup atap disesuaikan ke atap miring yang kompatibel dengan geometri rumah ini.'
          );
          adjustedNotesEn.push(
            'Roof covering adjusted from flat deck to a pitched-roof material suited to this house.'
          );
        }

        // Re-verify outdoor add-ons against current plot & footprint
        const nextAddons = { ...curr.addons };
        (Object.keys(nextAddons) as Array<keyof AddonsConfig>).forEach((addonKey) => {
          if (nextAddons[addonKey]) {
            const check = checkAddonCompatibility(addonKey, houseType, curr.dimensions);
            if (!check.supported) {
              nextAddons[addonKey] = false;
              if (check.reasonId) adjustedNotesId.push(check.reasonId);
              if (check.reasonEn) adjustedNotesEn.push(check.reasonEn);
            }
          }
        });

        return {
          ...curr,
          houseType,
          materials: nextMaterials,
          addons: nextAddons,
        };
      });

      return { adjustedNotesId, adjustedNotesEn };
    },

    updateDimensions: (patch: Partial<DimensionsConfig>) => {
      commitChange((curr) => {
        const merged: DimensionsConfig = {
          ...curr.dimensions,
          ...patch,
        };

        // Clamp numeric bounds safely while allowing user edits
        merged.landWidth = clampNumber(merged.landWidth, 6, 40);
        merged.landLength = clampNumber(merged.landLength, 8, 50);
        merged.buildingWidth = clampNumber(merged.buildingWidth, 4, merged.landWidth);
        merged.buildingLength = clampNumber(merged.buildingLength, 5, merged.landLength);

        // Disable incompatible outdoor addons if plot shrunk too far
        const nextAddons = { ...curr.addons };
        (Object.keys(nextAddons) as Array<keyof AddonsConfig>).forEach((key) => {
          if (nextAddons[key]) {
            const compat = checkAddonCompatibility(key, curr.houseType, merged);
            if (!compat.supported) {
              nextAddons[key] = false;
            }
          }
        });

        return {
          ...curr,
          dimensions: merged,
          addons: nextAddons,
        };
      });
    },

    fitBuildingToSafePlot: () => {
      commitChange((curr) => {
        const safeWidth = Math.max(4, round1(curr.dimensions.landWidth - 2.0));
        const safeLength = Math.max(5, round1(curr.dimensions.landLength - 3.5));
        return {
          ...curr,
          dimensions: {
            ...curr.dimensions,
            buildingWidth: Math.min(curr.dimensions.buildingWidth, safeWidth),
            buildingLength: Math.min(curr.dimensions.buildingLength, safeLength),
          },
        };
      });
    },

    updateMaterials: (patch: Partial<MaterialsConfig>) => {
      commitChange((curr) => ({
        ...curr,
        materials: {
          ...curr.materials,
          ...patch,
        },
      }));
    },

    toggleAddon: (key: keyof AddonsConfig, forceValue?: boolean) => {
      const current = get().project;
      const targetValue = typeof forceValue === 'boolean' ? forceValue : !current.addons[key];

      if (targetValue) {
        const compat = checkAddonCompatibility(key, current.houseType, current.dimensions);
        if (!compat.supported) {
          return {
            changed: false,
            reasonId: compat.reasonId,
            reasonEn: compat.reasonEn,
          };
        }
      }

      commitChange((curr) => ({
        ...curr,
        addons: {
          ...curr.addons,
          [key]: targetValue,
        },
      }));

      return { changed: true };
    },

    updateScene: (patch: Partial<SceneSettings>, recordHistory = false) => {
      commitChange(
        (curr) => ({
          ...curr,
          scene: {
            ...curr.scene,
            ...patch,
          },
        }),
        recordHistory
      );
    },

    setConstructionStage: (stage: ConstructionStage, recordHistory = false) => {
      commitChange(
        (curr) => ({
          ...curr,
          scene: {
            ...curr.scene,
            constructionStage: stage,
          },
        }),
        recordHistory
      );
    },

    setUnitRateOverride: (key: EditableRateKey, rate: number | undefined) => {
      commitChange((curr) => {
        const nextOverrides = { ...curr.rabAssumptions.unitRateOverrides };
        if (rate === undefined || !Number.isFinite(rate)) {
          delete nextOverrides[key];
        } else {
          nextOverrides[key] = Math.max(0, Math.round(rate));
        }
        return {
          ...curr,
          rabAssumptions: {
            ...curr.rabAssumptions,
            unitRateOverrides: nextOverrides,
          },
        };
      });
    },

    setContingencyPercent: (percent: number) => {
      commitChange((curr) => ({
        ...curr,
        rabAssumptions: {
          ...curr.rabAssumptions,
          contingencyPercent: clampNumber(percent, 0, 30),
        },
      }));
    },

    setLandPricePerM2: (price: number) => {
      commitChange((curr) => ({
        ...curr,
        rabAssumptions: {
          ...curr.rabAssumptions,
          landPricePerM2: Math.max(0, Math.round(price || 0)),
        },
      }));
    },

    resetRabAssumptions: () => {
      commitChange((curr) => ({
        ...curr,
        rabAssumptions: {
          unitRateOverrides: {},
          contingencyPercent: 10,
          landPricePerM2: 0,
        },
      }));
    },

    resetConfiguration: () => {
      const current = get().project;
      const fresh = createDefaultProject(current.name);
      fresh.projectId = current.projectId;
      fresh.createdAt = current.createdAt;
      commitChange(() => fresh, true);
    },

    createNewProject: (name?: string) => {
      const fresh = createDefaultProject(name || 'Konsep Rumah Baru');
      saveActiveDraftProject(fresh);
      set({
        project: fresh,
        past: [],
        future: [],
        hasUnsavedChanges: true,
        lastSavedAt: null,
      });
    },

    saveCurrentProject: (lang = 'id', thumbnailDataUrl?: string) => {
      const state = get();
      const now = new Date().toISOString();
      const toSave: ProjectConfig = {
        ...cloneProject(state.project),
        updatedAt: now,
        thumbnailDataUrl: thumbnailDataUrl ?? state.project.thumbnailDataUrl,
      };

      const existingIdx = state.savedProjects.findIndex((p) => p.projectId === toSave.projectId);
      const nextList =
        existingIdx >= 0
          ? state.savedProjects.map((p, idx) => (idx === existingIdx ? toSave : p))
          : [toSave, ...state.savedProjects];

      const res = persistSavedProjects(nextList, lang);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }

      saveActiveDraftProject(toSave);
      set({
        project: toSave,
        savedProjects: res.data ?? nextList,
        hasUnsavedChanges: false,
        lastSavedAt: now,
        storageWarning: null,
      });
      return { ok: true };
    },

    loadSavedProject: (projectId: string) => {
      const target = get().savedProjects.find((p) => p.projectId === projectId);
      if (!target) return false;
      const cloned = cloneProject(target);
      saveActiveDraftProject(cloned);
      set({
        project: cloned,
        past: [],
        future: [],
        hasUnsavedChanges: false,
        lastSavedAt: cloned.updatedAt,
      });
      return true;
    },

    duplicateSavedProject: (projectId: string, lang = 'id') => {
      const source =
        get().savedProjects.find((p) => p.projectId === projectId) ??
        (get().project.projectId === projectId ? get().project : null);
      if (!source) {
        return {
          ok: false,
          error: lang === 'id' ? 'Proyek sumber tidak ditemukan.' : 'Source project not found.',
        };
      }

      const now = new Date().toISOString();
      const copySuffix = lang === 'id' ? '(Salinan)' : '(Copy)';
      const duplicated: ProjectConfig = {
        ...cloneProject(source),
        projectId: `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${source.name.slice(0, 65)} ${copySuffix}`,
        createdAt: now,
        updatedAt: now,
      };

      const nextList = [duplicated, ...get().savedProjects];
      const res = persistSavedProjects(nextList, lang);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }

      saveActiveDraftProject(duplicated);
      set({
        project: duplicated,
        savedProjects: res.data ?? nextList,
        past: [],
        future: [],
        hasUnsavedChanges: false,
        lastSavedAt: now,
      });

      return { ok: true, newProject: duplicated };
    },

    renameSavedProject: (projectId: string, newName: string, lang = 'id') => {
      const trimmed = newName.trim().slice(0, 80);
      if (!trimmed) {
        return {
          ok: false,
          error: lang === 'id' ? 'Nama proyek tidak boleh kosong.' : 'Project name cannot be empty.',
        };
      }

      const now = new Date().toISOString();
      const nextList = get().savedProjects.map((p) =>
        p.projectId === projectId ? { ...p, name: trimmed, updatedAt: now } : p
      );

      const res = persistSavedProjects(nextList, lang);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }

      set((state) => ({
        savedProjects: res.data ?? nextList,
        project:
          state.project.projectId === projectId
            ? { ...state.project, name: trimmed, updatedAt: now }
            : state.project,
      }));
      return { ok: true };
    },

    deleteSavedProject: (projectId: string, lang = 'id') => {
      const nextList = get().savedProjects.filter((p) => p.projectId !== projectId);
      const res = persistSavedProjects(nextList, lang);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      set((state) => ({
        savedProjects: res.data ?? nextList,
        hasUnsavedChanges:
          state.project.projectId === projectId ? true : state.hasUnsavedChanges,
      }));
      return { ok: true };
    },

    importProjectJson: (rawJson: string, lang = 'id') => {
      const parsed = parseAndMigrateProjectJson(rawJson, lang);
      if (!parsed.success) {
        return { ok: false, error: parsed.error };
      }

      const now = new Date().toISOString();
      const imported: ProjectConfig = {
        ...parsed.project,
        projectId: `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        updatedAt: now,
      };

      const nextList = [imported, ...get().savedProjects];
      const persistRes = persistSavedProjects(nextList, lang);
      saveActiveDraftProject(imported);

      set((state) => ({
        project: imported,
        savedProjects: persistRes.ok ? persistRes.data ?? nextList : state.savedProjects,
        past: [...state.past, cloneProject(state.project)].slice(-MAX_HISTORY),
        future: [],
        hasUnsavedChanges: !persistRes.ok,
        lastSavedAt: persistRes.ok ? now : state.lastSavedAt,
      }));

      return {
        ok: true,
        migrated: parsed.migrated,
        project: imported,
      };
    },
  };
});

function clampNumber(val: number, min: number, max: number): number {
  if (!Number.isFinite(val)) return min;
  return Math.min(max, Math.max(min, val));
}

function round1(val: number): number {
  return Math.round(val * 10) / 10;
}
