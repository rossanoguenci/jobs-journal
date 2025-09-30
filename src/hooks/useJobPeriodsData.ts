import {useState, useCallback} from "react";
import {invoke} from "@tauri-apps/api/core";
import {errorLog, infoLog} from "@utilities/devLog";
import {JobPeriod} from "@shared-types/JobPeriod";
import {PeriodsResponse} from "@shared-types/PeriodsResponse";


export default function useJobPeriodsData() {
    const [value, setValue] = useState<PeriodsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    }

    const reset = () => {
        setValue(null);
        setLoaded(false);
        setSuccess(null);
        setError(null);
    }

    const load = useCallback(async () => {
        infoLog("useJobPeriodsData.load()");

        setLoading(true);
        reset()

        try {
            const result = await invoke<PeriodsResponse>("get_periods");

            if (result) {
                setValue(result as PeriodsResponse);
                setLoaded(true);
            }

            infoLog("Periods loaded:", result);
        } catch (err) {
            errorLog("Load periods error:", err);
            setError("Failed to load periods");
        } finally {
            setLoading(false);
        }
    }, []);

    const upsert = useCallback(async (periodValue: JobPeriod) => {
        infoLog("useJobPeriodsData.upsert()", periodValue);

        setLoading(true);
        clearMessages()

        try {
            const upsert_period_result = await invoke<JobPeriod>("upsert_period", {periodValue});
            const get_periods_result = await invoke<PeriodsResponse>("get_periods");
            setValue(get_periods_result as PeriodsResponse);
            setSuccess("Period saved");

            infoLog("Period saved & value reloaded:", upsert_period_result, get_periods_result);
        } catch (err) {
            errorLog("Save option error:", err);
            setError("Failed to save period.");
        } finally {
            setLoading(false);
        }
    }, []);

    const setPeriod = useCallback(async (periodID: PeriodsResponse["selected"]) => {
        infoLog("useJobPeriodsData.setPeriod()", periodID);

        setLoading(true);
        clearMessages()

        const obj: { key: string, value: PeriodsResponse["selected"] } = {
            key: "job_period_selected",
            value: periodID
        }

        try {
            const result = await invoke<PeriodsResponse["selected"]>("set_option", obj);
            const get_periods_result = await invoke<PeriodsResponse>("get_periods");
            setValue(get_periods_result as PeriodsResponse);
            setSuccess("Period selected successfully");

            infoLog("Period selected, option saved:", obj, result);
        } catch (err) {
            errorLog("Period selected error:", err);
            setError("Failed to select period");
        } finally {
            setLoading(false);
        }
    }, [])

    // list-only fetch, with no local state mutation
    const prefetchList = useCallback(async (): Promise<JobPeriod[]> => {
        try {
            const res = await invoke<PeriodsResponse>("get_periods");
            return res?.periods ?? [];
        } catch (err) {
            errorLog("prefetchList error:", err);
            return [];
        }
    }, []);

    return {
        value,
        load,
        upsert,
        setPeriod,
        loading,
        loaded,
        error,
        success,
        clearMessages,
        reset,
        prefetchList,
    };
}