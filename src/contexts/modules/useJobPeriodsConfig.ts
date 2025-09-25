import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import useJobPeriodsData from "@hooks/useJobPeriodsData";
import {debugLog, infoLog} from "@utilities/devLog";
import {useEffect} from "react";

export default function useJobPeriodsConfig() {
    const {jobPeriodsList, setJobPeriodsList, selectedJobPeriodID, setSelectedJobPeriodID, setJobPeriodsLoaded, jobPeriodsLoaded} = useJobPeriodsStore();
    const jobPeriodsData = useJobPeriodsData();

    async function init() {
        infoLog("useJobPeriodsConfig.init()")
        debugLog("jobPeriodsList", jobPeriodsList)
        debugLog("selectedJobPeriodID", selectedJobPeriodID)

        if (jobPeriodsList === null || selectedJobPeriodID === null) {

            if (!jobPeriodsData.loaded && !jobPeriodsLoaded) {
                infoLog("useJobPeriodsConfig.init() - loading")
                await jobPeriodsData.load();
            } else if (jobPeriodsData.loaded && jobPeriodsData.value) {
                infoLog("useJobPeriodsConfig.init() - loaded", jobPeriodsData.value)

                setJobPeriodsList(jobPeriodsData.value?.periods ?? [])
                setSelectedJobPeriodID(jobPeriodsData.value?.selected ?? "")
                setJobPeriodsLoaded(true)
            }

        }

    }

    useEffect(() => {
        if (jobPeriodsData.loaded && jobPeriodsData.value) {
            infoLog("useJobPeriodsConfig - useEffect() - loaded", jobPeriodsData.value)

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
