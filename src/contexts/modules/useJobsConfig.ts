import {useJobsStore} from "@stores/useJobsStore";
import useJobs from "@hooks/useJobs";
import {useEffect} from "react";
import {infoLog} from "@utilities/devLog";

export default function useJobsConfig() {
    const {jobsList, setJobsList} = useJobsStore()
    const options = useJobs()

    async function init() {
        infoLog("useJobsListConfig.init() called", jobsList)
        if (jobsList) return

        await options.load()
        setJobsList(options.data)
    }

    useEffect(() => {
        if (!options.loadStatus.error && options.data) {
            infoLog("useJobsListConfig.useEffect() - loaded", options.data)
            setJobsList(options.data);
        }
    }, [options.data, options.loadStatus.error, setJobsList]);

    return {
        init,
        jobsList,
        upsert: options.upsert,
        reload: options.load,
        loadStatus: options.loadStatus,
        upsertStatus: options.upsertStatus,
        clearStatus: options.clearStatus,
        // Details API routed through jobsManager
        loadDetails: options.loadDetails,
        details: options.details,
        detailsStatus: options.detailsStatus,
        requestedDetailsId: options.requestedDetailsId,
        detailsVersion: options.detailsVersion,
        invalidateDetails: options.invalidateDetails,
        resetDetails: options.resetDetails,
    };

}