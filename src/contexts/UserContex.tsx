import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    ReactNode,
} from "react";
import useOptions from "@hooks/useOptions";
import {debugLog} from "@utilities/devLog";
import {UserProfile} from "@/types/UserProfile";

type UserContextType = {
    user: UserProfile | null;
    loadUser: () => Promise<void>;
    saveUser: (newUser: UserProfile) => Promise<void>;
    loading: boolean;
    loaded: boolean;
    error: string | null;
    success: string | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({children}: { children: ReactNode }) {
    const {
        value,
        load,
        save,
        loading,
        error,
        ...rest
    } = useOptions<UserProfile>("user_profile");

    const contextValue = useMemo<UserContextType>(() => ({
        user: value,
        loadUser: load,
        saveUser: save,
        loading,
        error,
        ...rest
    }), [value, load, save, loading, error, rest]);

    const didLoadRef = useRef(false);

    useEffect(() => {
        if (!didLoadRef.current) {
            load().then(() => {
                didLoadRef.current = true;
            });
        }
    }, [load]);

    debugLog("UserProvider:", contextValue);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within UserProvider");
    return ctx;
}
