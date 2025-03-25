import "@styles/globals.scss";

import {Providers} from "./providers";

import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono';
import React from "react";
import {ActionProvider} from "@components/ActionProvider";
import NavBar from "@components/NavBar/component";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="dark">
        <body className={`${GeistSans.className} ${GeistMono.className}`}>
        <ActionProvider>
            <Providers>
                <NavBar/>
                {children}
            </Providers>
        </ActionProvider>
        </body>
        </html>
    );
}
