"use client"

import {useTheme} from "next-themes";
import {Switch} from "@heroui/react";

export default function SettingsPage() {

    const {theme, setTheme} = useTheme()

    return (
        <main className="wrapper" suppressHydrationWarning>

            <section className="container">
                <h2>Appearance</h2>
                <ul className="">

                    <li className="inline-flex w-full max-w-full items-center justify-between rounded-lg gap-2 p-4 border-2 border-transparent">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Light or Dark mode</p>
                            <p className="text-tiny text-default-400">
                                Switch to light or dark mode. The current theme is {theme}
                            </p>
                        </div>
                        <Switch
                            isSelected={theme === "light"}
                            onValueChange={(isSelected) => {
                                setTheme(isSelected ? "light" : "dark");
                            }}
                            color="success"
                            thumbIcon={({isSelected}) =>
                                isSelected ? <i className="bx bxs-sun"/> : <i className="bx bxs-moon"/>
                            }
                        />
                    </li>

                </ul>
            </section>

        </main>
    );
}
