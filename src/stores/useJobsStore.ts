import {create} from 'zustand';
import {JobEntry} from "@shared-types/JobEntry";
import {JobStatusKey, jobStatusKeys} from "@config/jobStatusOptions";

type OptionsState = {
    jobsList: JobEntry[] | null;
    filters: {
        search: string;
        status: ReadonlySet<JobStatusKey>;
    };
    paging: {
        currentPage: number;
        totalPages: number;
    };
    currentDetailsId: JobEntry["id"] | null;
};

type OptionsActions = {
    setJobsList: (jobList: JobEntry[]) => void;
    getJob: (id: JobEntry["id"]) => JobEntry | null;
    setFilter: (partial: Partial<OptionsState["filters"]>) => void;
    resetFilters: () => void;
    toggleStatus: (key: JobStatusKey) => void;
    setAllStatuses: () => void;
    setPaging: (partial: Partial<OptionsState["paging"]>) => void;

    setCurrentDetailsId: (id: JobEntry["id"]) => void;
    getCurrentDetailsId: () => JobEntry["id"] | null;
    clearCurrentDetailsId: () => void;
};

type OptionsStore = OptionsState & OptionsActions;

const initialStatusSet: ReadonlySet<JobStatusKey> = new Set(jobStatusKeys);

const initialStateFilters: OptionsState["filters"] = {
    search: '',
    status: initialStatusSet,
};

const initialStatePaging: OptionsState["paging"] = {
    currentPage: 1,
    totalPages: 1,
}
export const useJobsStore = create<OptionsStore>((set, get) => ({
    jobsList: null,
    filters: initialStateFilters,
    paging: initialStatePaging,
    currentDetailsId: null,

    setJobsList: (jobsList) => set({jobsList}),
    getJob: (id: JobEntry["id"]) => {
        if (!id || !get().jobsList || get().jobsList?.length === 0) return null;
        const {jobsList} = get();
        const jobItem = jobsList!.find(item => item.id === id);
        return jobItem || null;
    },
    setFilter: (partial: Partial<OptionsState["filters"]>) =>
        set((state) => ({
            filters: {...state.filters, ...partial},
        })),
    resetFilters: () => set({filters: initialStateFilters}),

    toggleStatus: (key: JobStatusKey) =>
        set((state) => {
            const next = new Set(state.filters.status);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return {filters: {...state.filters, status: next}};
        }),

    setAllStatuses: () =>
        set((state) => ({
            filters: {...state.filters, status: new Set(jobStatusKeys)}
        })),

    setPaging: (partial: Partial<OptionsState["paging"]>) =>
        set((state) => ({
            paging: {...state.paging, ...partial},
        })),

    getCurrentDetailsId: () => {
        return get().currentDetailsId
    },
    setCurrentDetailsId: (id: JobEntry["id"]) => {
        set({currentDetailsId: id.length > 0 ? id : null})
    },
    clearCurrentDetailsId: () => {
        set({currentDetailsId: null})
    }

}));