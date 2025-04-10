'use client';
import {createContext, useContext, useState, ReactNode} from 'react';

type ModalContextType = {
    openModal: (content: ReactNode, onCloseCallback?: () => void) => void;
    closeModal: () => void;
    content: ReactNode | null;
    isOpen: boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

type ModalProviderProps = {
    children: ReactNode;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({children}) => {
    const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | null>(null);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = (content: ReactNode, onCloseCallback?: () => void) => {
        setContent(content);
        setIsOpen(true);
        if (onCloseCallback) setOnCloseCallback(() => onCloseCallback);
    };

    const closeModal = () => {
        setContent(null);
        setIsOpen(false);
        if (onCloseCallback) {
            onCloseCallback();
            setOnCloseCallback(null); // clear it
        }
    };

    return (
        <ModalContext.Provider value={{openModal, closeModal, content, isOpen}}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};
