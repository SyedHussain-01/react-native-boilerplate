import {
  getMessaging,
  getToken,
} from "@react-native-firebase/messaging";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { storage } from "./mmkv_config";

interface DeviceTokenState {
  deviceToken: string | null;
  setDeviceToken: (token: string | null) => void;
  clearDeviceToken: () => void;
}

const mmkvStorage = createJSONStorage<{ deviceToken: string | null }>(() => ({
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
}));

export const useDeviceTokenStore = create<DeviceTokenState>()(
  persist(
    (set) => ({
      deviceToken: null,
      setDeviceToken: (deviceToken) => set({ deviceToken }),
      clearDeviceToken: () => set({ deviceToken: null }),
    }),
    {
      name: "device-token-storage",
      partialize: (state) => ({ deviceToken: state.deviceToken }),
      storage: mmkvStorage,
    },
  ),
);

/** Persist FCM/APNs token (MMKV-backed zustand). */
export const setDeviceToken = (token: string): void => {
  useDeviceTokenStore.getState().setDeviceToken(token);
};

export const getDeviceToken = (): string | null => {
  return useDeviceTokenStore.getState().deviceToken;
};

export const clearDeviceToken = (): void => {
  useDeviceTokenStore.getState().clearDeviceToken();
};

/** Returns persisted FCM token, or fetches and stores it when missing. */
export const resolveDeviceToken = async (): Promise<string> => {
  const stored = getDeviceToken();
  if (stored) {
    return stored;
  }

  try {
    const token = await getToken(getMessaging());
    if (token) {
      setDeviceToken(token);
      return token;
    }
  } catch {
    // Permission or registration may not be ready yet
  }

  return "";
};
