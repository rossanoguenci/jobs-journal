import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import useJobPeriodsData from "@hooks/useJobPeriodsData";
import {debugLog, infoLog, errorLog} from "@utilities/devLog";
import {useEffect} from "react";

export default function useJobPeriodsConfig() {
    const {jobPeriodsList, setJobPeriodsList, selectedJobPeriodId, setSelectedJobPeriodId, setJobPeriodsLoaded, jobPeriodsLoaded} = useJobPeriodsStore();
    const jobPeriodsData = useJobPeriodsData();

    async function init() {
        infoLog("useJobPeriodsConfig.init()")
        debugLog("jobPeriodsList", jobPeriodsList)
        debugLog("selectedJobPeriodId", selectedJobPeriodId)

        if (jobPeriodsList === null || selectedJobPeriodId === null) {

            if (!jobPeriodsData.loaded && !jobPeriodsLoaded) {
                infoLog("useJobPeriodsConfig.init() - loading")
                await jobPeriodsData.load();
            } else if (jobPeriodsData.loaded && jobPeriodsData.value) {
                infoLog("useJobPeriodsConfig.init() - loaded", jobPeriodsData.value)

                setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
                setSelectedJobPeriodId(jobPeriodsData.value?.selected ?? "")
                setJobPeriodsLoaded(true)
            }

        }

    }

    // Lightweight, idempotent prefetch of only the list (no selection, no loaded flag)
    async function prefetchList() {
        try {
            const current = useJobPeriodsStore.getState().jobPeriodsList;
            if (current && current.length > 0) return; // already have a list

            infoLog("useJobPeriodsConfig.prefetchList() — fetching periods list only");
            const list = await jobPeriodsData.prefetchList?.();
            if (list && list.length > 0) setJobPeriodsList(list);
            debugLog("prefetchList hydrated list (no selection)", list);
        } catch (e) {
            errorLog(
                "useJobPeriodsConfig.prefetchList() — failed (non-fatal)",
                e instanceof Error ? e.message : String(e)
            );
        }
    }

    useEffect(() => {
        if (jobPeriodsData.loaded && jobPeriodsData.value) {
            infoLog("useJobPeriodsConfig - useEffect() - loaded", jobPeriodsData.value)

            setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
            setSelectedJobPeriodId(jobPeriodsData.value?.selected ?? "")
            setJobPeriodsLoaded(true)
        }

    }, [jobPeriodsData.loaded, jobPeriodsData.value, setJobPeriodsList, setSelectedJobPeriodId, setJobPeriodsLoaded])

    return {
        init,
        prefetchList,
        jobPeriods: jobPeriodsData.value,
        jobPeriodsLoading: jobPeriodsData.loading,
        jobPeriodsLoaded: jobPeriodsLoaded || jobPeriodsData.loaded,
        jobPeriodsError: jobPeriodsData.error,
        jobPeriodsSuccess: jobPeriodsData.success,
        loadJobPeriods: jobPeriodsData.load,
        upsertJobPeriod: jobPeriodsData.upsert,
        setSelectedJobPeriod: jobPeriodsData.setPeriod,
        clearMessages: jobPeriodsData.clearMessages,
    };
}
