import React, {createContext, useContext, useEffect} from "react";
import {useUserConfig} from "./modules/useUserConfig";
import {useSettingsConfig} from "./modules/useSettingsConfig";
import {useAvatarConfig} from "./modules/useAvatarConfig";
import {debugLog} from "@utilities/devLog";
import useJobPeriodsConfig from "@contexts/modules/useJobPeriodsConfig";

/**
 * Context for managing global application settings and user profile data.
 * Handles loading, saving, and synchronising user profile, app settings, and avatar.
 */
type GlobalSettingsContextType = {
    userManager: ReturnType<typeof useUserConfig>;
    settingsManager: ReturnType<typeof useSettingsConfig> ;
    avatarManager: ReturnType<typeof useAvatarConfig> ;
    jobPeriodsManager: ReturnType<typeof useJobPeriodsConfig>;
};

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

/**
 * Provider component that manages global settings, user profile, and avatar data.
 * Handles data hydration from persistent storage and synchronises state across the application.
 * Provides methods for loading, saving, and resetting user data and application settings.
 */
export const GlobalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    // const [initialized, setInitialized] = useState(false);

    const userConfig = useUserConfig();
    const settingsConfig = useSettingsConfig();
    const avatarConfig = useAvatarConfig();
    const jobPeriodsConfig = useJobPeriodsConfig();

    // Combine the settings
    const combinedSettings: GlobalSettingsContextType = {
        userManager: {...userConfig},
        settingsManager: {...settingsConfig},
        avatarManager: {...avatarConfig},
        jobPeriodsManager: {...jobPeriodsConfig},
    };

    useEffect(() => {
        debugLog("GlobalSettingsProvider: init");

        userConfig.init().then()
        avatarConfig.init().then()
        settingsConfig.init().then()
        jobPeriodsConfig.init().then()


        //TODO: Testing a better performance of the init function

        // if (initialized) return;
        // debugLog("GlobalSettingsProvider: initial mount");

        /*Promise.all([
            userSettings.init(),
            avatarSettings.init(),
            appSettings.init(),
        ]).then(() => {
            debugLog("GlobalSettingsProvider: init complete");
            setInitialized(true);
        });*/

    }, [avatarConfig, jobPeriodsConfig, settingsConfig, userConfig]);

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