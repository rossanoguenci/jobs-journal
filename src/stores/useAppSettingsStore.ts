import {create} from 'zustand'
import {JobPeriod} from "@/types/JobPeriod";
import {AppSettings} from "@/types/AppSettings";

type OptionsState = {
    appSettings: AppSettings | null
    jobPeriods: JobPeriod[]
}

type OptionsActions = {
    setAppSettings: (settings: AppSettings | null) => void
    setJobPeriods: (periods: JobPeriod[]) => void
}

type OptionsStore = OptionsState & OptionsActions

export const useAppSettingsStore = create<OptionsStore>((set) => ({
    appSettings: null,
    jobPeriods: [],

    setAppSettings: (settings) => set({appSettings: settings}),
    setJobPeriods: (periods) => set({jobPeriods: periods}),
}))