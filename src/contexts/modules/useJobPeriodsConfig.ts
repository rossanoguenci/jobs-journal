import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import useJobPeriodsData from "@hooks/useJobPeriodsData";
import {debugLog} from "@utilities/devLog";
import {useEffect} from "react";

export default function useJobPeriodsConfig() {
    const {jobPeriodsList, setJobPeriodsList, selectedJobPeriodID, setSelectedJobPeriodID, setJobPeriodsLoaded, jobPeriodsLoaded} = useJobPeriodsStore();
    const jobPeriodsData = useJobPeriodsData();

    async function init() {
        debugLog("useJobPeriodsSettings.init() called", jobPeriodsList, selectedJobPeriodID)

        if (jobPeriodsList === null || selectedJobPeriodID === null) {

            if (!jobPeriodsData.loaded && !jobPeriodsLoaded) {
                await jobPeriodsData.load();
            } else if (jobPeriodsData.loaded && jobPeriodsData.value) {
                debugLog("useJobPeriodsSettings.init() - loaded", jobPeriodsData.value)

                setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
                setSelectedJobPeriodID(jobPeriodsData.value?.selected ?? "")
                setJobPeriodsLoaded(true)
            }

        }

    }

    useEffect(() => {
        if (jobPeriodsData.loaded && jobPeriodsData.value) {
            debugLog("useJobPeriodsSettings.useEffect() - loaded", jobPeriodsData.value)
            setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
            setSelectedJobPeriodID(jobPeriodsData.value?.selected ?? "")
            setJobPeriodsLoaded(true)
        }

    }, [jobPeriodsData.loaded, jobPeriodsData.value, setJobPeriodsList, setSelectedJobPeriodID, setJobPeriodsLoaded])

    return {
        init,
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
