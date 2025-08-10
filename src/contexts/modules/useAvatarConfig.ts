import {useUserStore} from "@stores/useUserStore";
import useAvatar from "@hooks/useAvatar";
import {debugLog} from "@utilities/devLog";

export function useAvatarConfig() {
    const avatar = useUserStore((s) => s.avatar);
    const setAvatar = useUserStore((s) => s.setAvatar);
    const avatarHook = useAvatar();

    async function init(){
        if(avatar) return;

        await avatarHook.loadAvatar();
        setAvatar(avatarHook.avatarDataUrl);
    }

    return {
        init,
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
