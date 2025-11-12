import { create } from "zustand";

export const useCategoryUiStore = create((set) => ({
  isModalOpen: false,
  editingCategory: null,
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, editingCategory: null }),
  setEditingCategory: (category) => set({ editingCategory: category }),
}));

