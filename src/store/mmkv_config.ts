import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: "app-storage",
  encryptionKey: "app-storage-key",
  mode: 'multi-process',
  readOnly: false
})

/**
 * Helper functions to handle JSON storage/retrieval
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  storage.set(key, JSON.stringify(value));
};

export const getStorageItem = <T>(key: string): T | null => {
  const value = storage.getString(key);
  return value ? JSON.parse(value) as T : null;
};

export const removeStorageItem = (key: string): void => {
  storage.remove(key);
};

export const clearStorage = (): void => {
  storage.clearAll();
};
