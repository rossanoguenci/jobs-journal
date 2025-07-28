import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {open} from "@tauri-apps/plugin-dialog";
import {readFile} from "@tauri-apps/plugin-fs";
import {debugLog, errorLog} from "@utilities/devLog";

export type UseAvatarResult = {
    avatarDataUrl: string | null;
    loadAvatar: () => Promise<void>;
    uploadAvatar: () => Promise<void>;
    deleteAvatar: () => Promise<void>;
    loading: boolean;
    error: string | null;
};

/**
 * A hook for managing user avatar operations in the application.
 *
 * This hook provides functionality to load, save, upload, and delete user avatars.
 * It handles all the state management related to avatars, including the avatar data,
 * loading states, and error handling.
 *
 * The hook communicates with the Tauri backend to perform file operations and
 * persistent storage of the avatar.
 *
 * @returns {UseAvatarResult} Object with avatar data and control functions
 */
export default function useAvatar(): UseAvatarResult {
    const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Loads the user's avatar from the backend storage.
     *
     * This function calls the Tauri backend's "load_avatar" command to retrieve
     * the stored avatar as a base64 data URL. It updates the avatarDataUrl state
     * with the retrieved data or sets it to null if an error occurs.
     *
     * @returns {Promise<void>}
     */
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

    /**
     * Saves the provided avatar image to the backend storage.
     *
     * This function calls the Tauri backend's "save_avatar" command to store
     * the provided base64 PNG data. In success, it updates the avatarDataUrl state
     * with the new image data.
     *
     * @param {string} base64Png - The avatar image as a base64-encoded PNG data URL
     * @returns {Promise<void>}
     */
    const saveAvatar = useCallback(async (base64Png: string) => {
        debugLog("saveAvatar()");

        setLoading(true);
        setError(null);
        try {
            await invoke("save_avatar", {base64Png});
            setAvatarDataUrl(base64Png);
            debugLog("Avatar saved successfully (false is good): ", base64Png, avatarDataUrl, avatarDataUrl === base64Png);
        } catch (err) {
            errorLog("saveAvatar() error:", err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Opens a file dialogue for the user to select and upload an image as their avatar.
     *
     * This function opens a file selection dialogue filtered to show only image files
     * (png, jpg, jpeg). Once an image is selected, it reads the file, converts it to
     * a base64-encoded data URL, and saves it using the saveAvatar function.
     *
     * If the user cancels the file selection, the function returns without making changes.
     *
     * @returns {Promise<void>}
     */
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

    /**
     * Deletes the user's avatar from the backend storage.
     *
     * This function calls the Tauri backend's "delete_avatar" command to remove
     * the stored avatar. In success, it sets the avatarDataUrl state to null
     * to reflect that no avatar is available.
     *
     * @returns {Promise<void>}
     */
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
        } finally {
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
