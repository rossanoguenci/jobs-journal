import {useUserStore} from "@stores/useUserStore";
import useOptions from "@hooks/useOptions";
import {UserProfile} from "@/types/UserProfile";
import {useEffect} from "react";
import {debugLog} from "@utilities/devLog";

export function useUserSettings() {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore((s) => s.setUser);
    const options = useOptions<UserProfile>("user_profile");

    useEffect(() => {
        debugLog("user ->", user)
        debugLog("options ->", options)

        if (!user) {
            debugLog("user is undefined, loading...");

            options.load().then(() => {
                if (!options.error) setUser(options.value);
            });
        }
    }, [options, setUser, user]);

    return {
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
