"use client"

import {useTheme} from "next-themes";
import {Switch} from "@heroui/switch";
import {Button} from "@heroui/button";
import useExportData from "@hooks/useExportData";
import useImportData from "@hooks/useImportData";
import useClearDatabase from "@hooks/useClearDatabase";
import {useAppSettingsContext} from "@contexts/AppSettingsContext";
import {useUserContext} from "@contexts/UserContext";
import {AppSettings} from "@/types/AppSettings";
import {debugLog} from "@utilities/devLog";
import User from "@components/UserProfile/User";
import Icon from "@components/Icons";
import {Section, SectionItemList, SectionList} from "@components/Sections";
import InsertEditUserDetails from "@components/UserProfile/InsertEditUserDetails";
import {useModal} from "@components/GlobalModal/ModalContext";

export default function SettingsPage() {

    const {theme, setTheme} = useTheme();
    const {exportJobs, loading: exportLoading, error: exportError, success: exportSuccess} = useExportData();
    const {importJobs, loading: importLoading, error: importError, success: importSuccess} = useImportData();
    const {clearDatabase, loading: clearDBLoading, error: clearDBError, success: clearDBSuccess} = useClearDatabase();

    const {settings, saveSettings, loading: settingsLoading} = useAppSettingsContext();
    const {loaded: userLoaded} = useUserContext();

    const {openModal} = useModal();

    const handleThemeChange = (newTheme: AppSettings["theme"]) => {
        debugLog("handleThemeChange", "theme: ", theme, "to", newTheme, "settings: ", settings);

        setTheme(newTheme); // Updates the actual theme
        if (settings) {
            debugLog("handleThemeChange", "settings: ", settings);
            saveSettings({...settings, theme: newTheme}).then();  // Persist
        }
    };


    return (
        <main className="wrapper" suppressHydrationWarning>


            <Section title="Profile">
                <SectionList>
                    <SectionItemList>
                        {userLoaded ? <User size="lg" variant="compact"/> :
                            <p>No user data available. Please click here to complete onboarding</p>}

                        <Button
                            color="primary"
                            onPress={() => {openModal(<InsertEditUserDetails/>)}}
                        ><Icon name="user"/>Edit profile</Button>
                    </SectionItemList>
                </SectionList>
            </Section>

            <Section title="Appearance">
                <SectionList>
                    <SectionItemList>
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Light or Dark mode</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Switch to light or dark mode. The current theme is {theme}
                            </p>
                        </div>
                            <Switch
                                isSelected={theme === "light"}
                                onValueChange={(isSelected) => {
                                    handleThemeChange(isSelected ? "light" : "dark");
                                }}
                                color="success"
                                thumbIcon={({isSelected}) =>
                                    isSelected ? <Icon name="sun" className="text-yellow-600"/> :
                                        <Icon name="moon" className="text-blue-600"/>
                                }
                                isDisabled={settingsLoading}
                            />
                    </SectionItemList>
                </SectionList>
            </Section>

            <Section title="Database">
                <SectionList>
                    <SectionItemList>
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Import</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Import data from a local file. Use with caution — invalid or altered files may cause
                                issues. Proceed at your own risk.
                            </p>
                            <p className="text-success">{importSuccess}</p>
                            <p className="text-danger">{importError}</p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={importLoading}
                            isDisabled={importLoading}
                            onPress={importJobs}

                        ><Icon name="import"/><span
                            className="hidden md:block"> {importLoading ? "Importing..." : "Import data"}</span></Button>
                    </SectionItemList>

                    <SectionItemList>
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Export</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Export your current data to a file. Make sure to store it safely. We’re not responsible
                                for lost or corrupted files.
                            </p>
                            <p className="text-success">{exportSuccess}</p>
                            <p className="text-danger">{exportError}</p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={exportLoading}
                            onPress={exportJobs}
                        ><Icon name="export"/><span className="hidden md:block"> Export data</span></Button>
                    </SectionItemList>

                    <SectionItemList>
                        {/*todo: add a prompt to confirm the choice*/}
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Reset Database</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                This will permanently remove all entries and events. This action cannot be undone.
                            </p>
                            <p className="text-success">{clearDBSuccess}</p>
                            <p className="text-danger">{clearDBError}</p>
                        </div>
                        <Button
                            color="danger"
                            isLoading={clearDBLoading}
                            onPress={clearDatabase}
                        ><Icon name="clear"/><span className="hidden md:block"> Clear entries</span></Button>
                    </SectionItemList>

                </SectionList>
            </Section>

        </main>
    );
}
