import React, {createContext, useContext} from "react";
import { useUserSettings } from "./modules/useUserSettings";
import { useAppSettings } from "./modules/useAppSettings";
import { useAvatarSettings } from "./modules/useAvatarSettings";

/**
 * Context for managing global application settings and user profile data.
 * Handles loading, saving, and synchronising user profile, app settings, and avatar.
 */
type GlobalSettingsContextType = 
  ReturnType<typeof useUserSettings> & 
  ReturnType<typeof useAppSettings> & 
  ReturnType<typeof useAvatarSettings>;

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

/**
 * Provider component that manages global settings, user profile, and avatar data.
 * Handles data hydration from persistent storage and synchronises state across the application.
 * Provides methods for loading, saving, and resetting user data and application settings.
 */
export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Call each hook directly (no mapping)
  const userSettings = useUserSettings();
  const appSettings = useAppSettings();
  const avatarSettings = useAvatarSettings();
  
  // Combine the settings
  const combinedSettings: GlobalSettingsContextType = {
    ...userSettings,
    ...appSettings,
    ...avatarSettings,
  };
  
  return (
    <GlobalSettingsContext.Provider value={combinedSettings}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

/**
 * Hook to access the global settings context.
 * Provides access to user profile, app settings, avatar management, and related utility functions.
 * Must be used within a GlobalSettingsProvider component.
 * @throws Error if used outside GlobalSettingsProvider
 */
export function useGlobalSettingsContext() {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new Error("useGlobalSettingsContext must be used within a GlobalSettingsProvider");
  }
  return context;
}