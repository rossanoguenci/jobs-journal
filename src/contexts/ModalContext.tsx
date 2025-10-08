'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';
import {infoLog} from "@utilities/devLog";

type OpenModalOptions = {
    onClose?: () => void;
    isCloseButtonVisible?: boolean; // default true
};

type ModalContextType = {
    openModal: (content: ReactNode, options?: OpenModalOptions | (() => void)) => void;
    closeModal: () => void;
    content: ReactNode | null;
    isOpen: boolean;
    isCloseButtonVisible: boolean;

};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

type ModalProviderProps = {
    children: ReactNode;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({children}) => {
    const [onCloseCallback, setOnCloseCallback] = useState<(() => void) | null>(null);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCloseButtonVisible, setIsCloseButtonVisible] = useState(true);

    const openModal = (content: ReactNode, options?: OpenModalOptions | (() => void)) => {
        infoLog("openModal()")

        setContent(content);
        setIsOpen(true);

        // Backward compatibility: allow passing a function as the second argument
        if (typeof options === 'function') {
            setOnCloseCallback(() => options);
            setIsCloseButtonVisible(true);
        } else {
            if (options?.onClose) setOnCloseCallback(() => options.onClose!);
            setIsCloseButtonVisible(options?.isCloseButtonVisible ?? true);
        }
    };

    const closeModal = () => {
        infoLog("closeModal()")

        setContent(null);
        setIsOpen(false);
        setIsCloseButtonVisible(true); // reset to default
        if (onCloseCallback) {
            onCloseCallback();
            setOnCloseCallback(null); // clear it
        }
    };

    return (
        <ModalContext.Provider value={{openModal, closeModal, content, isOpen, isCloseButtonVisible}}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};
