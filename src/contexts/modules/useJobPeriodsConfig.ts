import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import useJobPeriodsData from "@hooks/useJobPeriodsData";
import {debugLog} from "@utilities/devLog";
import {useEffect} from "react";

export default function useJobPeriodsConfig() {
    const {jobPeriodsList, setJobPeriodsList, selectedJobPeriodID, setSelectedJobPeriodID} = useJobPeriodsStore();
    const jobPeriodsData = useJobPeriodsData();

    async function init() {
        debugLog("useJobPeriodsSettings.init() called", jobPeriodsList, selectedJobPeriodID)

        if (jobPeriodsList === null || selectedJobPeriodID === null) {

            if (!jobPeriodsData.loaded) {
                await jobPeriodsData.load();
            } else {
                debugLog("useJobPeriodsSettings.init() - loaded", jobPeriodsData.value)

                setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
                setSelectedJobPeriodID(jobPeriodsData.value?.selected ?? "")
            }

        }

    }

    useEffect(() => {
        if (jobPeriodsData.loaded) {
            debugLog("useJobPeriodsSettings.useEffect() - loaded", jobPeriodsData.value)
            setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
            setSelectedJobPeriodID(jobPeriodsData.value?.selected ?? "")
        }

    }, [jobPeriodsData.loaded, jobPeriodsData.value, setJobPeriodsList, setSelectedJobPeriodID])

    return {
        init,
        jobPeriods: jobPeriodsData.value,
        jobPeriodsLoading: jobPeriodsData.loading,
        jobPeriodsLoaded: jobPeriodsData.loaded,
        jobPeriodsError: jobPeriodsData.error,
        jobPeriodsSuccess: jobPeriodsData.success,
        loadJobPeriods: jobPeriodsData.load,
        upsertJobPeriod: jobPeriodsData.upsert,
        setSelectedJobPeriod: jobPeriodsData.setPeriod,
        clearMessages: jobPeriodsData.clearMessages,
    };
}
