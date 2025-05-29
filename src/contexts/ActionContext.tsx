"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the context type
interface ActionContextType {
    activeAction: string | null;
    setActiveAction: (action: string | null) => void;
}

// Create the context
const ActionContext = createContext<ActionContextType | undefined>(undefined);

// Custom hook for easy access
export function useActionContext() {
    const context = useContext(ActionContext);
    if (!context) {
        throw new Error("useActionContext must be used within an ActionProvider");
    }
    return context;
}

// ActionProvider component
export function ActionProvider({ children }: { children: ReactNode }) {
    const [activeAction, setActiveAction] = useState<string | null>(null);

    return (
        <ActionContext.Provider value={{ activeAction, setActiveAction }}>
            {children}
        </ActionContext.Provider>
    );
}
