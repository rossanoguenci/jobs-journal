import {useUserStore} from "@stores/useUserStore";
import useAvatar from "@hooks/useAvatar";
import {debugLog} from "@utilities/devLog";
import {useEffect} from "react";

export function useAvatarConfig() {
    const {avatar, setAvatar} = useUserStore();
    const options = useAvatar();

    async function init() {
        if (avatar) return;

        await options.loadAvatar();
        setAvatar(options.avatarDataUrl);
    }

    useEffect(() => {
        if (options.loaded){
            debugLog("useAvatarConfig.useEffect() - loaded", options.avatarDataUrl)
            setAvatar(options.avatarDataUrl);
        }
    }, [options.avatarDataUrl, options.loaded, setAvatar]);

    return {
        init,
        avatarDataUrl: options.avatarDataUrl,
        avatarLoading: options.loading,
        avatarError: options.error,
        avatarReload: options.loadAvatar,
        avatarReset: () => {
            options.error = null;
        },
        uploadAvatar: async () => {
            debugLog("Avatar: uploading...");
            await options.uploadAvatar();
            if (!options.error) setAvatar(options.avatarDataUrl);
        },
        deleteAvatar: async () => {
            debugLog("Avatar: deleting...");
            await options.deleteAvatar();
            if (!options.error) setAvatar(options.avatarDataUrl); // will be null
        },
    };
}
