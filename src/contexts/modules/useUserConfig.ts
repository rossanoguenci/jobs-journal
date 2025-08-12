import {useUserStore} from "@stores/useUserStore";
import useOptions from "@hooks/useOptions";
import {UserProfile} from "@/types/UserProfile";
import {debugLog} from "@utilities/devLog";
import {useEffect} from "react";

export function useUserConfig() {
    const {user, setUser} = useUserStore();
    const options = useOptions<UserProfile>("user_profile");

    async function init() {
        debugLog("useUserSettings.init() called", `user ${user}`)

        if (user) return;

        await options.load();
        setUser(options.value);

        debugLog("useUserSettings.init() - loaded", options.value)
    }

    useEffect(() => {
        if (options.loaded && options.value) {
            debugLog("useUserSettings.useEffect() - loaded", options.value)
            setUser(options.value);
        }
    }, [options.loaded, options.value, setUser]);

    return {
        init,
        user,
        saveUserProfile: async (newUserData: UserProfile) => {
            debugLog("saveUserProfile() called", newUserData)

            await options.save(newUserData);

            if (!options.error) {
                setUser(options.value);
                debugLog("saveUserProfile() - no errors, saving...", newUserData, user, options.value)
            }
        },
        userLoading: options.loading,
        userError: options.error,
        userSuccess: options.success,
        userReload: async () => {
            await options.load();
            if (!options.error) {
                debugLog("userReload()", options.value)
                setUser(options.value);
            }
        },
        userReset: () => {
            options.error = null;
            options.success = null;
        },
    };
}
