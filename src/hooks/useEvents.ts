import {useCallback, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEvent} from "@shared-types/JobEvent";
import {RequestStatus, RequestSource} from "@shared-types/Requests";
import {debugLog, errorLog, infoLog} from "@utilities/devLog";
import {newRequestId, now} from "@utilities/requestUtils";
import retryWithBackoff from "@utilities/retryWithBackoff";

export type JobEventsRowsType = JobEvent[] | [];
export type ClearWhich = "load" | "upsert" | "all";

export type UseEventsReturnType = {
    data: JobEventsRowsType | null;
    load: (jobId: string, opts?: { source?: RequestSource }) => Promise<void>;
    loadStatus: RequestStatus,
    upsertStatus: RequestStatus,
    upsert: (data: JobEvent, opts?: { source?: RequestSource }) => Promise<void>;
    clearStatus: (which?: ClearWhich) => void;
    reset: () => void;
};

const defaultRequestStatus: RequestStatus = {
    loading: false,
    error: null,
    success: null,
};

export default function useEvents(): UseEventsReturnType {
    const [data, setData] = useState<JobEventsRowsType | null>(null);
    const [loadStatus, setLoadStatus] = useState<RequestStatus>(defaultRequestStatus);
    const [upsertStatus, setUpsertStatus] = useState<RequestStatus>(defaultRequestStatus);

    // Track the most recent request per action to implement a "latest-wins" guard
    const latestLoadId = useRef<string | null>(null);
    const latestUpsertId = useRef<string | null>(null);


    const load = useCallback(async (jobId: string, opts?: { source?: RequestSource; retry?: boolean }) => {
        if (!jobId) return;

        infoLog("useEvents.load(): jobId -> ", jobId);

        const source = opts?.source ?? "system";
        const requestId = newRequestId("load");
        latestLoadId.current = requestId;

        setLoadStatus({
            loading: true,
            error: null,
            success: null,
            meta: {requestId, startedAt: now(), source},
        });

        const doFetch = async () => {
            return await invoke<JobEventsRowsType>("job_events_get", {jobId});
        };


        try {
            infoLog("useEvents.load()");
            const rows = opts?.retry ? await retryWithBackoff(doFetch) : await doFetch();

            // Latest-wins guard
            if (latestLoadId.current !== requestId) return;

            setData(rows);
            setLoadStatus({
                loading: false,
                error: null,
                success: null, // no success message for a load
                meta: {requestId, startedAt: loadStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });

            infoLog("useJobs.load() - Jobs loaded successfully: ", rows.length, "rows")
        } catch (e) {
            if (latestLoadId.current !== requestId) return;
            setLoadStatus({
                loading: false,
                error: "Failed to fetch job events",
                success: null,
                meta: {requestId, startedAt: loadStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });
            errorLog(e);
            errorLog(`Failed to fetch job events #${jobId}:`, e);
        }
    }, [loadStatus.meta?.startedAt]);

    const upsert = useCallback(async (
        event: JobEvent,
        opts?: {
            source?: RequestSource,
        }) => {
        infoLog("useEvents.upsert(): data passed -> ", event, "opts -> ", opts);

        const source = opts?.source ?? "user"; // default mutations to user-initiated
        const requestId = newRequestId("upsert");
        latestUpsertId.current = requestId;

        const jobId = event.job_id;
        if (!jobId || jobId.length === 0) {
            setUpsertStatus({
                loading: false,
                error: `Ref #job_id invalid "${jobId}"`,
                success: null,
                meta: {requestId, startedAt: now(), source},
            });

            errorLog(`useEvents.upsert(): jobId is invalid: ${jobId}`);

            return;
        }

        setUpsertStatus({
            loading: true,
            error: null,
            success: null,
            meta: {requestId, startedAt: now(), source},
        });

        try {
            const result = await invoke<string>("job_events_insert", {data: event}); //todo: to be renamed to job_events_upsert when available

            if (latestUpsertId.current !== requestId) return; // latest-wins guard

            setUpsertStatus({
                loading: false,
                error: null,
                success: result || ("id" in event ? "Event updated" : "Event inserted"),
                meta: {requestId, startedAt: upsertStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });

            // Refresh list as a background system load (no toast)
            await load(jobId, {source: "system"});
        } catch (err: unknown) {
            if (latestUpsertId.current !== requestId) return; // latest-wins guard
            const errorMessage = err instanceof Error ? err.message : String(err);
            setUpsertStatus({
                loading: false,
                error: errorMessage,
                success: null,
                meta: {requestId, startedAt: upsertStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });

            errorLog(`Failed to insert a job events for ${jobId} - ${err}`);
        }
    }, [load, upsertStatus.meta?.startedAt]);

    const clearStatus = useCallback((which?: ClearWhich) => {
        if (!which || which === "all" || which === "load") {
            setLoadStatus(defaultRequestStatus);
        }
        if (!which || which === "all" || which === "upsert") {
            setUpsertStatus(defaultRequestStatus);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setLoadStatus(defaultRequestStatus);
        setUpsertStatus(defaultRequestStatus);
    }, []);

    return {
        data,
        loadStatus,
        upsertStatus,
        load,
        upsert,
        clearStatus,
        reset
    };
}
