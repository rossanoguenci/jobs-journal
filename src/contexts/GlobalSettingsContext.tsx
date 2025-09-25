import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {useUserConfig} from "./modules/useUserConfig";
import {useSettingsConfig} from "./modules/useSettingsConfig";
import {useAvatarConfig} from "./modules/useAvatarConfig";
import useJobPeriodsConfig from "./modules/useJobPeriodsConfig";
import useJobsConfig from "./modules/useJobsConfig";
import useI18nConfig from "./modules/useI18nConfig";
import useEventsConfig from "./modules/useEventsConfig";

/**
 * Global settings context contract for the application.
 * Aggregates managers responsible for user profile, application settings, avatar data,
 * and job periods. Also carries initialisation status and a potential init error.
 *
 * Fields:
 * - userManager: Provides methods and state for user profile management (init, load/save, reset, etc.).
 * - settingsManager: Provides methods and state for application settings.
 * - avatarManager: Provides methods and state for avatar handling.
 * - jobPeriodsManager: Provides methods and state for job periods configuration.
 * - initialised: Indicates whether all managers completed their initialisation cycle.
 * - initError: Present if initialisation failed for any manager; UI may decide how to display it.
 */
type GlobalSettingsContextType = {
    userManager: ReturnType<typeof useUserConfig>;
    settingsManager: ReturnType<typeof useSettingsConfig>;
    avatarManager: ReturnType<typeof useAvatarConfig>;
    jobPeriodsManager: ReturnType<typeof useJobPeriodsConfig>;
    jobsManager: ReturnType<typeof useJobsConfig>;
    eventsManager: ReturnType<typeof useEventsConfig>;
    i18nManager: ReturnType<typeof useI18nConfig>;
    initialised: boolean;
    initError: string | null;
};

/**
 * React Context instance that holds the global settings state and managers.
 *
 * Note: The value can be undefined outside the provider; consumers should use
 * the provided `useGlobalSettingsContext` hook which enforces usage within the provider.
 */
const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

/**
 * Provider component that manages global settings, user profile, avatar data, and job periods.
 * Performs initial bootstrapping (hydration) from persistent storage and exposes
 * the managers and initialisation state to the component tree.
 *
 * @param children React nodes that will have access to the global settings context.
 * @returns A provider element that must wrap parts of the app needing access to global settings.
 */
export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [initialised, setInitialised] = useState(false);
    const [initError, setInitError] = useState<string | null>(null);

    const userConfig = useUserConfig();
    const settingsConfig = useSettingsConfig();
    const avatarConfig = useAvatarConfig();
    const jobPeriodsConfig = useJobPeriodsConfig();
    const jobsManager = useJobsConfig();
    const eventsManager = useEventsConfig();
    const i18nManager = useI18nConfig();

    // Combine the settings
    const combinedSettings: GlobalSettingsContextType = useMemo(() => ({
        userManager: {...userConfig},
        settingsManager: {...settingsConfig},
        avatarManager: {...avatarConfig},
        jobPeriodsManager: {...jobPeriodsConfig},
        jobsManager: {...jobsManager},
        eventsManager: {...eventsManager},
        i18nManager: { ...i18nManager },
        initialised: initialised,
        initError,
    }), [userConfig, settingsConfig, avatarConfig, jobPeriodsConfig, jobsManager, eventsManager, i18nManager, initialised, initError]);

    const initRan = useRef(false);

    useEffect(() => {
        if (initRan.current) return;
        initRan.current = true;

        // Essential bootstrapping logic
        async function bootstrap() {
            try {
                await Promise.all([
                    userConfig.init(),
                    avatarConfig.init(),
                    settingsConfig.init(),
                    i18nManager.init(),

                    // jobPeriodsConfig.init(),
                    // jobsManager.init(),
                ]);
                setInitialised(true);
            } catch (e) {
                setInitError(e instanceof Error ? e.message : String(e));
                setInitialised(true); // Proceed; UI can show the error state
            }
        }

        bootstrap().then();
    }, [avatarConfig, i18nManager, jobPeriodsConfig, jobsManager, settingsConfig, userConfig]);

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
 *
 * @returns {GlobalSettingsContextType} The aggregated managers and initialisation state.
 * @throws {Error} If used outside a GlobalSettingsProvider.
 */
export function useGlobalSettingsContext(): GlobalSettingsContextType {
    const context = useContext(GlobalSettingsContext);
    if (!context) {
        throw new Error("useGlobalSettingsContext must be used within a GlobalSettingsProvider");
    }
    return context;
}