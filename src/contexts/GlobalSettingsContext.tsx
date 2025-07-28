import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {useUserStore} from "@stores/useUserStore";
import {useAppSettingsStore} from "@stores/useAppSettingsStore";
import useOptions from "@hooks/useOptions";
import useAvatar from "@hooks/useAvatar";
import {UserProfile} from "@/types/UserProfile";
import {AppSettings} from "@/types/AppSettings";
import {debugLog} from "@utilities/devLog";

/**
 * Context for managing global application settings and user profile data.
 * Handles loading, saving, and synchronising user profile, app settings, and avatar.
 */
type GlobalSettingsContextType = {
    loading: boolean;
    error: string | null;
    success: string | null;
    user: UserProfile | null;
    appSettings: AppSettings | null;
    reload: () => void;
    reset: () => void;
    avatarDataUrl: string | null;
    loadAvatar: () => Promise<void>;
    uploadAvatar: () => Promise<void>;
    deleteAvatar: () => Promise<void>;
    saveUserProfile: (newValue: UserProfile) => Promise<void>;
};

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

/**
 * Provider component that manages global settings, user profile, and avatar data.
 * Handles data hydration from persistent storage and synchronises state across the application.
 * Provides methods for loading, saving, and resetting user data and application settings.
 */
export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // User logic
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const userOptions = useOptions<UserProfile>("user_profile");

    // AppSettings logic
    const appSettings = useAppSettingsStore((s) => s.appSettings);
    const setAppSettings = useAppSettingsStore((s) => s.setAppSettings);
    const appSettingsOptions = useOptions<AppSettings>("app_settings");

    // Avatar logic
    const avatar = useUserStore((s) => s.avatar);
    const setAvatar = useUserStore((s) => s.setAvatar);
    const avatarHook = useAvatar();

    // Init flags
    const [internalLoading, setInternalLoading] = useState(false);

    // --- User hydration
    useEffect(() => {
        if (user === null && !userOptions.loaded && !userOptions.loading) {
            setInternalLoading(true);
            userOptions.load().finally(() => setInternalLoading(false));
        }

        if (avatar === null && !avatarHook.avatarDataUrl && !avatarHook.loading) {
            setInternalLoading(true);
            avatarHook.loadAvatar().finally(() => setInternalLoading(false));
        }

    }, [avatar, avatarHook, user, userOptions, userOptions.loaded, userOptions.loading]);

    useEffect(() => {
        debugLog("GlobalSettingsProvider: user data loaded (hydration)", user, userOptions.value, user === userOptions.value);
        debugLog("GlobalSettingsProvider: avatar data loaded (hydration)", avatar, avatarHook.avatarDataUrl, avatarHook.avatarDataUrl === avatar);

        if (user === null && userOptions.loaded && userOptions.value) {
            setUser(userOptions.value);

            debugLog("GlobalSettingsProvider: user data loaded (true is good)", userOptions.value, user, userOptions.value === user,);
        }

        if (avatarHook.avatarDataUrl && !avatarHook.loading) {
            setAvatar(avatarHook.avatarDataUrl);

            debugLog("GlobalSettingsProvider: avatar data loaded (true is good)", avatarHook.avatarDataUrl, avatar, avatarHook.avatarDataUrl === avatar);
        }

    }, [user, userOptions.loaded, userOptions.value, setUser, avatar, avatarHook.avatarDataUrl, avatarHook.loading, setAvatar]);

    // --- AppSettings hydration
    useEffect(() => {
        if (appSettings === null && !appSettingsOptions.loaded && !appSettingsOptions.loading) {
            setInternalLoading(true);
            appSettingsOptions.load().finally(() => setInternalLoading(false));
        }
    }, [appSettings, appSettingsOptions, appSettingsOptions.loaded, appSettingsOptions.loading]);

    useEffect(() => {
        if (appSettings === null && appSettingsOptions.loaded && appSettingsOptions.value) {
            setAppSettings(appSettingsOptions.value);
        }
    }, [appSettings, appSettingsOptions.loaded, appSettingsOptions.value, setAppSettings]);

    // --- Unified context value
    const value = useMemo(() => ({
        loading: internalLoading || userOptions.loading || appSettingsOptions.loading || avatarHook.loading,
        error: userOptions.error || appSettingsOptions.error || avatarHook.error || null,
        success: userOptions.success || appSettingsOptions.success || null,
        user,
        appSettings,
        avatarDataUrl: avatarHook.avatarDataUrl,
        loadAvatar: avatarHook.loadAvatar,
        uploadAvatar: async () => {
            debugLog("GlobalSettingsProvider: uploading avatar");

            await avatarHook.uploadAvatar();

            if (!avatarHook.error) {
                setAvatar(avatarHook.avatarDataUrl);

                debugLog("GlobalSettingsProvider: avatar uploaded (false is good)", avatarHook.avatarDataUrl, avatar, avatar === avatarHook.avatarDataUrl);
            }
        },
        deleteAvatar: async () => {
            debugLog("GlobalSettingsProvider: deleting avatar");

            await avatarHook.deleteAvatar();

            if (!avatarHook.error) {
                setAvatar(avatarHook.avatarDataUrl); //null

                debugLog("GlobalSettingsProvider: avatar deleted (false is good)", avatarHook.avatarDataUrl, avatar, avatar === avatarHook.avatarDataUrl);
            }
        },
        saveUserProfile: async (newValue: UserProfile) => {
            await userOptions.save(newValue);
            // Reload user data after successful save
            if (!userOptions.error) {
                setUser(newValue);
            }
        },
        reload: () => {
            debugLog("GlobalSettingsProvider: reloading");

            userOptions.load().then();
            appSettingsOptions.load().then();
            avatarHook.loadAvatar().then();
        },
        reset: () => {
            debugLog("GlobalSettingsProvider: resetting");

            userOptions.error = null;
            userOptions.success = null;
            appSettingsOptions.error = null;
            appSettingsOptions.success = null;
            avatarHook.error = null;
        },
    }), [internalLoading, userOptions, appSettingsOptions, avatarHook, user, appSettings, setAvatar, avatar, setUser]);

    return (
        <GlobalSettingsContext.Provider value={value}>
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
    const ctx = useContext(GlobalSettingsContext);
    if (!ctx) throw new Error("useGlobalSettingsContext must be used within GlobalSettingsProvider");
    return ctx;
}