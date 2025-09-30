import {create} from 'zustand';
import {JobPeriod} from "@shared-types/JobPeriod";

type OptionsState = {
    jobPeriodsList: JobPeriod[] | null;
    selectedJobPeriodId: JobPeriod['id'] | null;
    jobPeriodsLoaded: boolean;
};

type OptionsActions = {
    setJobPeriodsList: (periods: JobPeriod[] | null) => void;
    setSelectedJobPeriodId: (id: JobPeriod['id']) => void;
    setJobPeriodsLoaded: (loaded: boolean) => void;
    getSelectedJobPeriodItem: () => JobPeriod | null;
    getJobPeriodItem: (id: JobPeriod['id']) => JobPeriod | null;
};

type OptionsStore = OptionsState & OptionsActions;

export const useJobPeriodsStore = create<OptionsStore>((set, get) => ({
    jobPeriodsList: null,
    selectedJobPeriodId: null,
    jobPeriodsLoaded: false,

    setJobPeriodsList: (jobPeriodsList) => set(() => ({
        jobPeriodsList,
        jobPeriodsLoaded: jobPeriodsList != null,
    })),
    setSelectedJobPeriodId: (selectedJobPeriodId) => set(() => ({
        selectedJobPeriodId,
    })),
    setJobPeriodsLoaded: (jobPeriodsLoaded) => set({ jobPeriodsLoaded }),
    getSelectedJobPeriodItem: () => {
        if (!get().selectedJobPeriodId || !get().jobPeriodsList) return null;

        const {jobPeriodsList, selectedJobPeriodId} = get();
        const jobPeriodItem = jobPeriodsList!.find(item => item.id === selectedJobPeriodId);
        return jobPeriodItem || null;
    },
    getJobPeriodItem: (id: JobPeriod["id"]) => {
        const { jobPeriodsList } = get();
        if (!jobPeriodsList) return null;
        const jobPeriodItem = jobPeriodsList.find(item => item.id === id);
        return jobPeriodItem || null;
    }
}));