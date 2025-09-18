import {useJobsStore} from "@stores/useJobsStore";
import useEvents from "@hooks/useEvents";

export default function useEventsConfig() {
    const {currentDetailsId} = useJobsStore()
    const options = useEvents()

    return{
        currentDetailsId,
        data: options.data, //todo: store?
        load: options.load,
        upsert: options.upsert,
        upsertStatus: options.upsertStatus,
        loadStatus: options.loadStatus,
        clearStatus: options.clearStatus,
        reset: options.reset,
    }
}