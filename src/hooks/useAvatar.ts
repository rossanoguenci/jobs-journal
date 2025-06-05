import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";
import {readFile} from "@tauri-apps/plugin-fs";
import {debugLog, errorLog} from "@utilities/devLog";

export default function useAvatar() {
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAvatar = useCallback(async () => {
        debugLog("loadAvatar()");

        setLoading(true);
        setError(null);
        try {
            const dataUrl = await invoke<string>("load_avatar");
            setAvatarDataUrl(dataUrl);
        } catch (err) {
            errorLog("loadAvatar() error:", err);

            setError((err as Error).message);
            setAvatarDataUrl(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveAvatar = useCallback(async (base64Png: string) => {
        debugLog("saveAvatar()");

        setLoading(true);
        setError(null);
        try {
            await invoke("save_avatar", {base64Png});
            setAvatarDataUrl(base64Png);
        } catch (err) {
            errorLog("saveAvatar() error:", err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadAvatar = useCallback(async () => {
        debugLog("uploadAvatar()");
        setLoading(true);
        setError(null);
        try {
            const selectedPath = await open({
                filters: [{name: "Images", extensions: ["png", "jpg", "jpeg"]}],
                multiple: false,
            });

            if (!selectedPath) return;

            const fileBuffer = await readFile(selectedPath); // Uint8Array
            const base64 = btoa(
                new Uint8Array(fileBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            const base64Png = `data:image/png;base64,${base64}`;

            await saveAvatar(base64Png);
        } catch (err) {
            errorLog("uploadAvatar() error:", err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [saveAvatar]);

    const deleteAvatar = useCallback(async () => {
        debugLog("deleteAvatar()");
        setLoading(true);
        setError(null);
        try {
            await invoke("delete_avatar");
            setAvatarDataUrl(null);
        } catch (err) {
            errorLog("deleteAvatar() error:", err);
            setError((err as Error).message);
        }finally{
            setLoading(false);
        }
    }, [])

    return {
        avatarDataUrl,
        loadAvatar,
        uploadAvatar,
        deleteAvatar,
        loading,
        error,
    };
}
