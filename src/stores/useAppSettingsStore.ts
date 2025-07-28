import {create} from 'zustand'
import {JobPeriod} from "@/types/JobPeriod";
import {AppSettings} from "@/types/AppSettings";

type OptionsState = {
    appSettings: AppSettings | null
    jobPeriods: JobPeriod[]

    setAppSettings: (settings: AppSettings) => void
    setJobPeriods: (periods: JobPeriod[]) => void
}

export const useAppSettingsStore = create<OptionsState>((set) => ({
    appSettings: null,
    jobPeriods: [],

    setAppSettings: (settings) => set({appSettings: settings}),
    setJobPeriods: (periods) => set({jobPeriods: periods}),
}))