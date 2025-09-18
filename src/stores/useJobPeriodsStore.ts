import {create} from 'zustand';
import {JobPeriod} from "@/types/JobPeriod";

type OptionsState = {
    jobPeriodsList: JobPeriod[] | null;
    selectedJobPeriodID: JobPeriod['id'] | null;
    jobPeriodsLoaded: boolean;
};

type OptionsActions = {
    setJobPeriodsList: (periods: JobPeriod[]) => void;
    setSelectedJobPeriodID: (id: JobPeriod['id']) => void;
    setJobPeriodsLoaded: (loaded: boolean) => void;
    getSelectedJobPeriodItem: () => JobPeriod | null;
    getJobPeriodItem: (id: JobPeriod['id']) => JobPeriod | null;
};

type OptionsStore = OptionsState & OptionsActions;

export const useJobPeriodsStore = create<OptionsStore>((set, get) => ({
    jobPeriodsList: null,
    selectedJobPeriodID: null,
    jobPeriodsLoaded: false,

    setJobPeriodsList: (jobPeriodsList) => set((state) => ({
        jobPeriodsList,
        jobPeriodsLoaded: jobPeriodsList != null && (state.selectedJobPeriodID !== null),
    })),
    setSelectedJobPeriodID: (selectedJobPeriodID) => set((state) => ({
        selectedJobPeriodID,
        jobPeriodsLoaded: (state.jobPeriodsList != null) && selectedJobPeriodID !== null,
    })),
    setJobPeriodsLoaded: (jobPeriodsLoaded) => set({ jobPeriodsLoaded }),
    getSelectedJobPeriodItem: () => {
        if (!get().selectedJobPeriodID || !get().jobPeriodsList) return null;

        const {jobPeriodsList, selectedJobPeriodID} = get();
        const jobPeriodItem = jobPeriodsList!.find(item => item.id === selectedJobPeriodID);
        return jobPeriodItem || null;
    },
    getJobPeriodItem: (id: JobPeriod["id"]) => {
        const { jobPeriodsList } = get();
        if (!jobPeriodsList) return null;
        const jobPeriodItem = jobPeriodsList.find(item => item.id === id);
        return jobPeriodItem || null;
    }
}));