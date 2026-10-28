import { create } from 'zustand';
import { loadUIPreferences, saveUIPreferences } from '@/lib/storage';
import { Language, SelectedElementInfo, ThemeMode } from '@/types/project';

export type NavSection = 'studio' | 'construction' | 'catalog' | 'calculator' | 'faq';
export type LeftSidebarTab = 'project' | 'stage' | 'technical';
export type RightSidebarTab = 'type' | 'material' | 'addons' | 'dimensions';
export type ModalType =
  | null
  | 'catalog'
  | 'finance'
  | 'compare'
  | 'booking'
  | 'faq'
  | 'print-rab';

export type MobileSheetType = null | 'left' | 'right' | 'menu';

export interface ToastItem {
  id: string;
  variant: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface ConfirmDialogState {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

interface UIStoreState {
  theme: ThemeMode;
  language: Language;
  activeNav: NavSection;
  leftSidebarOpen: boolean;
  leftTab: LeftSidebarTab;
  rightSidebarOpen: boolean;
  rightTab: RightSidebarTab;
  mobileSheet: MobileSheetType;
  activeModal: ModalType;
  financeTab: 'rab' | 'kpr';
  compareIds: [string | null, string | null];
  selectedElement: SelectedElementInfo | null;
  isPlayingTimeline: boolean;
  performanceMode: 'auto' | 'high' | 'low';
  showOnboarding: boolean;
  webglAvailable: boolean;
  cameraTriggerNonce: number;
  customCameraTarget: {
    position: [number, number, number];
    target: [number, number, number];
  } | null;
  snapshotProvider: (() => string | undefined) | null;
  toasts: ToastItem[];
  confirmDialog: ConfirmDialogState | null;

  hydratePreferences: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (language: Language) => void;
  setActiveNav: (nav: NavSection) => void;
  setLeftSidebar: (open: boolean, tab?: LeftSidebarTab) => void;
  setRightSidebar: (open: boolean, tab?: RightSidebarTab) => void;
  setMobileSheet: (sheet: MobileSheetType) => void;
  openModal: (modal: ModalType, financeTab?: 'rab' | 'kpr') => void;
  closeModal: () => void;
  setFinanceTab: (tab: 'rab' | 'kpr') => void;
  setCompareIds: (ids: [string | null, string | null]) => void;
  setSelectedElement: (el: SelectedElementInfo | null) => void;
  setIsPlayingTimeline: (playing: boolean) => void;
  setPerformanceMode: (mode: 'auto' | 'high' | 'low') => void;
  dismissOnboarding: () => void;
  openOnboarding: () => void;
  setWebglAvailable: (available: boolean) => void;
  triggerCameraResetOrCustom: (custom?: {
    position: [number, number, number];
    target: [number, number, number];
  }) => void;
  setSnapshotProvider: (fn: (() => string | undefined) | null) => void;
  addToast: (variant: ToastItem['variant'], message: string) => void;
  dismissToast: (id: string) => void;
  openConfirm: (dialog: ConfirmDialogState) => void;
  closeConfirm: () => void;
}

function applyDocumentTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  theme: 'light',
  language: 'id',
  activeNav: 'studio',
  leftSidebarOpen: true,
  leftTab: 'stage',
  rightSidebarOpen: true,
  rightTab: 'type',
  mobileSheet: null,
  activeModal: null,
  financeTab: 'rab',
  compareIds: [null, null],
  selectedElement: null,
  isPlayingTimeline: false,
  performanceMode: 'auto',
  showOnboarding: false,
  webglAvailable: true,
  cameraTriggerNonce: 0,
  customCameraTarget: null,
  snapshotProvider: null,
  toasts: [],
  confirmDialog: null,

  hydratePreferences: () => {
    const prefs = loadUIPreferences();
    if (prefs) {
      applyDocumentTheme(prefs.theme);
      set({
        theme: prefs.theme,
        language: prefs.language,
        showOnboarding: !prefs.onboardingDismissed,
      });
    } else {
      applyDocumentTheme('light');
      set({ showOnboarding: true });
    }
  },

  setTheme: (theme) => {
    applyDocumentTheme(theme);
    const curr = get();
    saveUIPreferences({
      theme,
      language: curr.language,
      onboardingDismissed: !curr.showOnboarding,
    });
    set({ theme });
  },

  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  setLanguage: (language) => {
    const curr = get();
    saveUIPreferences({
      theme: curr.theme,
      language,
      onboardingDismissed: !curr.showOnboarding,
    });
    set({ language });
  },

  setActiveNav: (nav) => {
    if (nav === 'studio') {
      set({ activeNav: 'studio', activeModal: null, mobileSheet: null });
    } else if (nav === 'construction') {
      set({
        activeNav: 'construction',
        activeModal: null,
        leftSidebarOpen: true,
        leftTab: 'stage',
      });
    } else if (nav === 'catalog') {
      set({ activeNav: 'catalog', activeModal: 'catalog', mobileSheet: null });
    } else if (nav === 'calculator') {
      set({
        activeNav: 'calculator',
        activeModal: 'finance',
        financeTab: 'rab',
        mobileSheet: null,
      });
    } else if (nav === 'faq') {
      set({ activeNav: 'faq', activeModal: 'faq', mobileSheet: null });
    }
  },

  setLeftSidebar: (open, tab) => {
    set((state) => ({
      leftSidebarOpen: open,
      leftTab: tab ?? state.leftTab,
    }));
  },

  setRightSidebar: (open, tab) => {
    set((state) => ({
      rightSidebarOpen: open,
      rightTab: tab ?? state.rightTab,
    }));
  },

  setMobileSheet: (sheet) => set({ mobileSheet: sheet }),

  openModal: (modal, financeTab) => {
    set((state) => ({
      activeModal: modal,
      financeTab: financeTab ?? state.financeTab,
      activeNav:
        modal === 'catalog'
          ? 'catalog'
          : modal === 'finance' || modal === 'print-rab'
          ? 'calculator'
          : modal === 'faq'
          ? 'faq'
          : state.activeNav,
      mobileSheet: null,
    }));
  },

  closeModal: () => {
    set({ activeModal: null, activeNav: 'studio' });
  },

  setFinanceTab: (tab) => set({ financeTab: tab }),

  setCompareIds: (ids) => set({ compareIds: ids }),

  setSelectedElement: (el) => set({ selectedElement: el }),

  setIsPlayingTimeline: (playing) => set({ isPlayingTimeline: playing }),

  setPerformanceMode: (mode) => set({ performanceMode: mode }),

  dismissOnboarding: () => {
    const curr = get();
    saveUIPreferences({
      theme: curr.theme,
      language: curr.language,
      onboardingDismissed: true,
    });
    set({ showOnboarding: false });
  },

  openOnboarding: () => set({ showOnboarding: true }),

  setWebglAvailable: (available) => set({ webglAvailable: available }),

  triggerCameraResetOrCustom: (custom) => {
    set((state) => ({
      cameraTriggerNonce: state.cameraTriggerNonce + 1,
      customCameraTarget: custom ?? null,
    }));
  },

  setSnapshotProvider: (fn) => set({ snapshotProvider: fn }),

  addToast: (variant, message) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id, variant, message }],
    }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        get().dismissToast(id);
      }, 4200);
    }
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  openConfirm: (dialog) => set({ confirmDialog: dialog }),
  closeConfirm: () => set({ confirmDialog: null }),
}));
