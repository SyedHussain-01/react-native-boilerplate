import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage } from './mmkv_config';

// Define your store's state type
interface AppState {
  // Add your state properties here
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? Promise.resolve(JSON.parse(value)) : Promise.resolve(null);
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
          return Promise.resolve();
        },
        removeItem: (name) => {
          storage.remove(name);
          return Promise.resolve();
        },
      })),
    }
  )
);
