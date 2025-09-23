import "@styles/globals.css";
// import "@styles/main.css"

import {Providers} from "./providers";

import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono';
import React from "react";
import NavBar from "@components/NavBar/component";
import {ModalProvider} from "@contexts/ModalContext";
import GlobalModal from "@components/GlobalModal";
import {JobsTB} from "@components/ToastBoundary";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        // suppressHydrationWarning by next-themes
        <html lang="en" suppressHydrationWarning>
        <body className={`${GeistSans.className} ${GeistMono.className}`}>
        {/* Providers by HeroUI */}
        <Providers>
            <ModalProvider>
                <NavBar/>
                {children}
                <GlobalModal/>
                <JobsTB/>
            </ModalProvider>
        </Providers>

        </body>
        </html>
    );
}
