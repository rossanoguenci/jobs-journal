import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    ReactNode,
} from "react";
import useOptions from "@hooks/useOptions";
import useAvatar from "@hooks/useAvatar";
import {debugLog} from "@utilities/devLog";
import {UserProfile} from "@/types/UserProfile";

/**
 * The shape of the user context, providing state and operations
 * related to the current user and their avatar.
 */
export interface UserContextType {
    /** User profile data or null if not loaded */
    user: UserProfile | null;
    /** Base64 Data URL for the user's avatar or null if not set */
    avatarDataUrl: string | null;
    /** Loads user profile asynchronously from persistence or remote source */
    loadUser: () => Promise<void>;
    /** Saves a new user profile */
    saveUser: (newUser: UserProfile) => Promise<void>;
    /** Loads avatar image data */
    loadAvatar: () => Promise<void>;
    /** Saves user's avatar as base64 PNG */
    uploadAvatar: () => Promise<void>;
    /** Delete avatar from persistence */
    deleteAvatar: () => Promise<void>;
    /** True if user profile is being loaded or saved */
    loading: boolean;
    /** True if avatar is being loaded or saved */
    avatarLoading: boolean;
    /** True if the user profile has been loaded at least once */
    loaded: boolean;
    /** Error occurred with user profile operations, or null if none */
    error: string | null;
    /** Error occurred with avatar operations, or null if none */
    avatarError: string | null;
    /** Success message, or null if none */
    success: string | null;
}

/**
 * React context providing user and avatar state and actions.
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Helper to build the user context value object for the provider.
 * @param userSection - Section with user profile-related fields and functions
 * @param avatarSection - Section with avatar-related fields and functions
 * @returns A complete UserContextType object
 */
function buildUserContextValue(
    {
        user,
        loadUser,
        saveUser,
        loading,
        loaded,
        error,
        success,
    }: {
        user: UserProfile | null;
        loadUser: () => Promise<void>;
        saveUser: (newUser: UserProfile) => Promise<void>;
        loading: boolean;
        loaded: boolean;
        error: string | null;
        success: string | null;
    },
    {
        avatarDataUrl,
        loadAvatar,
        uploadAvatar,
        deleteAvatar,
        avatarLoading,
        avatarError,
    }: {
        avatarDataUrl: string | null;
        loadAvatar: () => Promise<void>;
        uploadAvatar: () => Promise<void>;
        deleteAvatar: () => Promise<void>;
        avatarLoading: boolean;
        avatarError: string | null;
    }
): UserContextType {
    return {
        user,
        avatarDataUrl,
        loadUser,
        saveUser,
        loadAvatar,
        uploadAvatar,
        deleteAvatar,
        loading,
        avatarLoading,
        loaded,
        error,
        avatarError,
        success,
    };
}

/**
 * Custom hook to load both user profile and avatar on mount.
 * Ensures initial state is fetched once when provider mounts.
 * @param loadUser - Function to load the user profile
 * @param loadAvatar - Function to load the avatar data
 */
function useInitialLoad(loadUser: () => Promise<void>, loadAvatar: () => Promise<void>) {
    const didLoadRef = useRef(false);
    useEffect(() => {
        if (!didLoadRef.current) {
            Promise.all([loadUser(), loadAvatar()]).then(() => {
                didLoadRef.current = true;
            });
        }
    }, [loadUser, loadAvatar]);
}

/**
 * The provider component that supplies user and avatar context to its children.
 * Wrap your app (or required subtree) with this to provide access to user state and actions.
 */
export function UserProvider({children}: { children: ReactNode }) {
    // User profile state and actions from custom useOptions hook
    const {
        value: user,
        load: loadUser,
        save: saveUser,
        loading,
        error,
        loaded,
        success,
    } = useOptions<UserProfile>("user_profile");
    // Avatar state and actions from custom useAvatar hook
    const {
        avatarDataUrl,
        loadAvatar,
        uploadAvatar,
        deleteAvatar,
        loading: avatarLoading,
        error: avatarError,
    } = useAvatar();

    // On initial mount, load user and avatar once
    useInitialLoad(loadUser, loadAvatar);

    // Memoize context value object to avoid unnecessary rerenders
    const contextValue = useMemo(
        () =>
            buildUserContextValue(
                {user, loadUser, saveUser, loading, loaded, error, success},
                {avatarDataUrl, loadAvatar, uploadAvatar, deleteAvatar, avatarLoading, avatarError}
            ),
        [
            user,
            loadUser,
            saveUser,
            loading,
            loaded,
            error,
            success,
            avatarDataUrl,
            loadAvatar,
            uploadAvatar,
            deleteAvatar,
            avatarLoading,
            avatarError,
        ]
    );

    debugLog("UserProvider:", contextValue);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

/**
 * React hook to access the user context. Must be used inside a UserProvider.
 * @returns {UserContextType} The current user context value
 * @throws Error if used outside of <UserProvider>
 */
export function useUserContext(): UserContextType {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within UserProvider");
    return ctx;
}