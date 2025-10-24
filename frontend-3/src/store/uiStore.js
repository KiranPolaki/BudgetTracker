import { create } from "zustand";

export const useUiStore = create((set) => ({
  isModalOpen: false,
  editingTransaction: null,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, editingTransaction: null }),
  setEditingTransaction: (transaction) =>
    set({ editingTransaction: transaction }),
}));
