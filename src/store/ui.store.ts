import { create } from 'zustand';

// Named modals used across the app
export type ModalName =
  | 'confirm-delete-listing'
  | 'confirm-suspend-agent'
  | 'reject-listing'
  | 'reject-kyc'
  | 'fraud-report'
  | 'enquiry-form'
  | null;

interface UIState {
  // Sidebar (agent/admin dashboard)
  isSidebarOpen: boolean;
  // Which modal is currently open
  activeModal: ModalName;
  // Generic payload passed to the open modal (e.g. the listing ID being deleted)
  modalPayload: Record<string, unknown> | null;

  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  openModal: (name: ModalName, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  activeModal: null,
  modalPayload: null,

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openSidebar: () => set({ isSidebarOpen: true }),

  closeSidebar: () => set({ isSidebarOpen: false }),

  openModal: (name, payload) =>
    set({ activeModal: name, modalPayload: payload ?? null }),

  closeModal: () =>
    set({ activeModal: null, modalPayload: null }),
}));

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectModalPayload = (state: UIState) => state.modalPayload;
