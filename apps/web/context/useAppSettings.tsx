'use client';

import { storageOptionsSerializers } from '@/lib/storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AppSettings {
  /**
   * Whether to ignore unknown app warnings for this domain
   */
  ignoreUnknownAppWarning: boolean;
  /**
   * When this domain was last visited
   */
  lastVisited: number;
}

interface AppSettingsState {
  settings: Record<string, AppSettings>;
  hasHydrated: boolean;
}

interface AppSettingsActions {
  getSettingsForUrl: (url: string) => AppSettings;
  updateSettingsForUrl: (url: string, settings: Partial<AppSettings>) => void;
  clearSettingsForUrl: (url: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  clearAllSettings: () => void;
}

const defaultSettings: AppSettings = {
  ignoreUnknownAppWarning: false,
  lastVisited: 0
};

/**
 * Extract domain from URL for consistent storage key
 */
function getDomainKey(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    // If URL is invalid, use the original string as key
    return url.toLowerCase();
  }
}

export const useAppSettings = create<AppSettingsState & AppSettingsActions>()(
  persist(
    (set, get) => ({
      settings: {},
      hasHydrated: false,

      getSettingsForUrl: (url: string) => {
        const domainKey = getDomainKey(url);
        const settings = get().settings[domainKey];
        return settings ? { ...defaultSettings, ...settings } : defaultSettings;
      },

      updateSettingsForUrl: (
        url: string,
        newSettings: Partial<AppSettings>
      ) => {
        const domainKey = getDomainKey(url);
        const currentSettings = get().getSettingsForUrl(url);

        set((state) => ({
          settings: {
            ...state.settings,
            [domainKey]: {
              ...currentSettings,
              ...newSettings,
              lastVisited: Date.now()
            }
          }
        }));
      },

      clearSettingsForUrl: (url: string) => {
        const domainKey = getDomainKey(url);
        set((state) => {
          const newSettings = { ...state.settings };
          delete newSettings[domainKey];
          return { settings: newSettings };
        });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated });
      },

      clearAllSettings: () => {
        set({ settings: {} });
      }
    }),
    {
      name: '@petra-vault/app-settings',
      storage: createJSONStorage(() => localStorage, storageOptionsSerializers),
      partialize: (state) => ({
        settings: state.settings,
        hasHydrated: state.hasHydrated
      }),
      onRehydrateStorage: (state) => () => state.setHasHydrated(true)
    }
  )
);
