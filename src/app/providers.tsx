"use client"

import {HeroUIProvider} from '@heroui/react'
import {ToastProvider} from "@heroui/toast";
import {ThemeProvider as NextThemesProvider} from "next-themes";
import React from "react";
import {useRouter} from "next/navigation";
import {AppSettingsProvider} from "@/contexts/AppSettingsContext";

declare module "@react-types/shared" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
    }
}

export function Providers({children}: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <HeroUIProvider navigate={router.push}>
            <AppSettingsProvider>
                <ToastProvider/>
                <NextThemesProvider attribute="class" defaultTheme="dark">
                    {children}
                </NextThemesProvider>
            </AppSettingsProvider>
        </HeroUIProvider>
    )
}