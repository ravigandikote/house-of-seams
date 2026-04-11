import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  isModalOpen: boolean;
  toggleModal: () => void;
}

const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  isModalOpen: false,
  toggleModal: () => set((state) => ({ isModalOpen: !state.isModalOpen })),
}));

export default useUIStore;
