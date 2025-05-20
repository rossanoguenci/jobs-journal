"use client"

import {useTheme} from "next-themes";
import {Switch} from "@heroui/switch";
import {Button} from "@heroui/button";
import useExportData from "@hooks/useExportData";
import useImportData from "@hooks/useImportData";
import useClearDatabase from "@hooks/useClearDatabase";

export default function SettingsPage() {

    const {theme, setTheme} = useTheme();
    const {exportJobs, loading: exportLoading, error: exportError, success: exportSuccess} = useExportData();
    const { importJobs, loading: importLoading, error: importError, success: importSuccess } = useImportData();
    const { clearDatabase, loading: clearDBLoading, error: clearDBError, success: clearDBSuccess } = useClearDatabase();

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

            <section className="container">
                <h2>Database</h2>
                <ul className="">

                    <li className="inline-flex w-full max-w-full items-center justify-between rounded-lg gap-2 p-4 border-2 border-transparent">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Import</p>
                            <p className="text-tiny text-default-400">
                                ###Description here###
                            </p>
                            <p className="text-success">{importSuccess}</p>
                            <p className="text-danger">{importError}</p>
                        </div>
                            <Button
                                color="primary"
                                isLoading={importLoading}
                                isDisabled={importLoading}
                                onPress={importJobs}
                            >{importLoading ? "Importing..." : "Import data"}</Button>
                    </li>

                    <li className="inline-flex w-full max-w-full items-center justify-between rounded-lg gap-2 p-4 border-2 border-transparent">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Export</p>
                            <p className="text-tiny text-default-400">
                                ##Description here##
                            </p>
                            <p className="text-success">{exportSuccess}</p>
                            <p className="text-danger">{exportError}</p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={exportLoading}
                            onPress={exportJobs}
                        >Export data</Button>
                    </li>

                    {/*todo: add a prompt to confirm the choice*/}
                    <li className="inline-flex w-full max-w-full items-center justify-between rounded-lg gap-2 p-4 border-2 border-transparent text-danger">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Reset Database</p>
                            <p className="text-tiny text-default-400">
                                This will permanently remove all entries and events. This action cannot be undone.
                            </p>
                            <p className="text-success">{clearDBSuccess}</p>
                            <p className="text-danger">{clearDBError}</p>
                        </div>
                        <Button
                            color="danger"
                            isLoading={clearDBLoading}
                            onPress={clearDatabase}
                        >Clear all data</Button>
                    </li>

                </ul>
            </section>

        </main>
    );
}
