import {create} from 'zustand';
import {JobPeriod} from "@/types/JobPeriod";

type OptionsState = {
    jobPeriodsList: JobPeriod[] | null;
    selectedJobPeriodID: JobPeriod['id'] | null;
};

type OptionsActions = {
    setJobPeriodsList: (periods: JobPeriod[]) => void;
    setSelectedJobPeriodID: (id: JobPeriod['id']) => void;
    getSelectedJobPeriodItem: () => JobPeriod | null;
    getJobPeriodItem: (id: JobPeriod['id']) => JobPeriod | null;
};

type OptionsStore = OptionsState & OptionsActions;

export const useJobPeriodsStore = create<OptionsStore>((set, get) => ({
    jobPeriodsList: null,
    selectedJobPeriodID: null,

    setJobPeriodsList: (jobPeriodsList) => set({jobPeriodsList}),
    setSelectedJobPeriodID: (selectedJobPeriodID) => set({selectedJobPeriodID}),
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