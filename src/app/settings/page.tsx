"use client"

import {useTheme} from "next-themes";
import {Switch} from "@heroui/switch";
import {Button} from "@heroui/button";
import useExportData from "@hooks/useExportData";
import useImportData from "@hooks/useImportData";
import useClearDatabase from "@hooks/useClearDatabase";
import {AppSettings} from "@/types/AppSettings";
import {debugLog} from "@utilities/devLog";
import User from "@components/Settings/UserProfile/User";
import Icon from "@components/Icons";
import {Section, SectionItemList, SectionList} from "@components/Sections";
import InsertEditUserDetails from "@components/Settings/UserProfile/InsertEditUserDetails";
import {useModal} from "@contexts/ModalContext";
import {ManagePeriod, UpsertPeriod} from "@components/Settings/Periods";
import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import {useUserStore} from "@stores/useUserStore";
import {useSettingsStore} from "@stores/useSettingsStore";
import dateFormat from "@utilities/dateFormat";

export default function SettingsPage() {
    const {theme, setTheme} = useTheme(); //todo: to be included in GlobalSettings

    const exportData = useExportData();
    const importData = useImportData();
    const clearDatabase = useClearDatabase();

    const settings = useSettingsStore(s => s.appSettings);
    const user = useUserStore(s => s.user);

    const {jobPeriodsList, selectedJobPeriodID, getSelectedJobPeriodItem} = useJobPeriodsStore()

    const {openModal} = useModal();

    const handleThemeChange = (newTheme: AppSettings["theme"]) => {
        debugLog("handleThemeChange", "theme: ", theme, "to", newTheme, "settings: ", settings);

        setTheme(newTheme); // Updates the actual theme
        /*if (settings) {
            debugLog("handleThemeChange", "settings: ", settings);
            saveSettings({...settings, theme: newTheme}).then();  // Persist
        }*/
    };

    const periodRangeText = () => {
        const item = getSelectedJobPeriodItem()!
        if (!selectedJobPeriodID || !item) return "No period selected or available."

        const start = item.start ? dateFormat(item.start) : "N/A"
        const end = item.end ? dateFormat(item.end) : "present"

        return `Current period selected: ${start} - ${end}`
    }


    return (
        <main className="wrapper" suppressHydrationWarning>


            <Section title="Profile">
                <SectionList>
                    <SectionItemList variant="actions">
                        {user ? <User size="lg" variant="compact"/> :
                            <p>No user data available. Please click here to complete onboarding</p>}

                        <Button
                            color="primary"
                            onPress={() => {
                                openModal(<InsertEditUserDetails/>)
                            }}
                        ><Icon name="user"/>Edit profile</Button>
                    </SectionItemList>
                </SectionList>
            </Section>

            <Section title="Job hunting">
                <SectionList>

                    <SectionItemList variant="actions">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Periods</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Manage the list of periods saved.<br/>{periodRangeText()}
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={() => {
                                openModal(<ManagePeriod/>)
                            }}
                            isDisabled={jobPeriodsList ? jobPeriodsList.length === 0 : true}
                        ><Icon name="calendarRange"/> Manage periods</Button>
                    </SectionItemList>

                    <SectionItemList variant="actions">
                        <div className="flex flex-col gap-1">
                            <p className="text-tiny text-default-400 max-w-md">
                                Create a new period
                            </p>
                        </div>
                        <Button
                            color="primary"
                            onPress={() => {
                                openModal(<UpsertPeriod/>)
                            }}
                        ><Icon name="addNew"/> Add new period</Button>
                    </SectionItemList>
                </SectionList>
            </Section>

            <Section title="Appearance">
                <SectionList>
                    <SectionItemList variant="actions">
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
                            // isDisabled={settingsLoading}
                        />
                    </SectionItemList>
                </SectionList>
            </Section>

            <Section title="Database">
                <SectionList>
                    <SectionItemList variant="actions">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Import</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Import data from a local file. Use with caution — invalid or altered files may cause
                                issues. Proceed at your own risk.
                            </p>
                            <p className="text-success">{importData.success}</p>
                            <p className="text-danger">{importData.error}</p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={importData.loading}
                            isDisabled={importData.loading}
                            onPress={importData.importJobs}

                        ><Icon name="import"/><span
                            className="hidden md:block"> {importData.loading ? "Importing..." : "Import data"}</span></Button>
                    </SectionItemList>

                    <SectionItemList variant="actions">
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Export</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                Export your current data to a file. Make sure to store it safely. We’re not responsible
                                for lost or corrupted files.
                            </p>
                            <p className="text-success">{exportData.success}</p>
                            <p className="text-danger">{exportData.error}</p>
                        </div>
                        <Button
                            color="primary"
                            isLoading={exportData.loading}
                            onPress={exportData.exportJobs}
                        ><Icon name="export"/><span className="hidden md:block"> Export data</span></Button>
                    </SectionItemList>

                    <SectionItemList variant="actions">
                        {/*todo: add a prompt to confirm the choice*/}
                        <div className="flex flex-col gap-1">
                            <p className="text-medium">Reset Database</p>
                            <p className="text-tiny text-default-400 max-w-md">
                                This will permanently remove all entries and events. This action cannot be undone.
                            </p>
                            <p className="text-success">{clearDatabase.success}</p>
                            <p className="text-danger">{clearDatabase.error}</p>
                        </div>
                        <Button
                            color="danger"
                            isLoading={clearDatabase.loading}
                            onPress={clearDatabase.clearDatabase}
                        ><Icon name="clear"/><span className="hidden md:block"> Clear entries</span></Button>
                    </SectionItemList>

                </SectionList>
            </Section>

        </main>
    );
}
