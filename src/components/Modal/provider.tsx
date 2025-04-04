import React, {createContext, useContext, ReactNode} from "react";

const ModalContext = createContext<{ onClose?: () => void }>({});

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({children, onClose}: { children: ReactNode; onClose?: () => void }) {
    return <ModalContext.Provider value={{onClose}}>{children}</ModalContext.Provider>;
}
