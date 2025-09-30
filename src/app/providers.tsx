"use client"

import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import React from "react";
import {useRouter} from "next/navigation";
import {GlobalSettingsProvider} from "@contexts/GlobalSettingsContext";
import AppInitGate from "@components/InitGate";
import {ModalProvider} from "@contexts/ModalContext";
import GlobalModal from "@components/GlobalModal";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
    }
}

export function Providers({children}: { children: React.ReactNode }) {
    const router = useRouter();


    return (
        <GlobalSettingsProvider>
            <HeroUIProvider navigate={router.push}>
                <ToastProvider/>
                <NextThemesProvider attribute="class" defaultTheme="dark">
                    <ModalProvider>
                        {/* Keep GlobalModal mounted regardless of AppInitGate state */}
                        <GlobalModal/>
                        {/* AppInitGate controls the app content rendering */}
                        <AppInitGate>
                            {children}
                        </AppInitGate>
                    </ModalProvider>
                </NextThemesProvider>
            </HeroUIProvider>
        </GlobalSettingsProvider>
    )
}