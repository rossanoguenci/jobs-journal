import {useUserStore} from "@stores/useUserStore";
import useAvatar from "@hooks/useAvatar";
import {debugLog} from "@utilities/devLog";
import {useEffect} from "react";

export function useAvatarSettings() {
    const avatar = useUserStore((s) => s.avatar);
    const setAvatar = useUserStore((s) => s.setAvatar);
    const avatarHook = useAvatar();

    useEffect(() => {
        debugLog("Avatar: loading...", avatar);

        if (!avatar) {
            debugLog("Avatar: undefined, loading...");
            avatarHook.loadAvatar().then(() => {
                debugLog("Avatar: loaded", avatarHook.avatarDataUrl);
                setAvatar(avatarHook.avatarDataUrl);
            });
        }
    }, [avatar, avatarHook, setAvatar])

    return {
        avatarDataUrl: avatarHook.avatarDataUrl,
        avatarLoading: avatarHook.loading,
        avatarError: avatarHook.error,
        avatarReload: avatarHook.loadAvatar,
        avatarReset: () => {
            avatarHook.error = null;
        },
        uploadAvatar: async () => {
            debugLog("Avatar: uploading...");
            await avatarHook.uploadAvatar();
            if (!avatarHook.error) setAvatar(avatarHook.avatarDataUrl);
        },
        deleteAvatar: async () => {
            debugLog("Avatar: deleting...");
            await avatarHook.deleteAvatar();
            if (!avatarHook.error) setAvatar(avatarHook.avatarDataUrl); // will be null
        },
    };
}
