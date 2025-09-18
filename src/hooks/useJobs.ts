import {useCallback, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {JobEntry} from "@shared-types/JobEntry";
import {JobUpdate} from "@shared-types/JobUpdate";
import {JobInsert} from "@shared-types/JobInsert";
import {debugLog, errorLog, infoLog} from "@utilities/devLog";
import {RequestStatus, RequestSource} from "@shared-types/Requests";
import {newRequestId, now} from "@utilities/requestUtils";
import retryWithBackoff from "@utilities/retryWithBackoff";

export type JobsListRowsType = JobEntry[] | [];

export type UseJobsReturnType = {
    data: JobsListRowsType;
    loadStatus: RequestStatus;
    upsertStatus: RequestStatus;
    // Details related
    details: JobEntry | null;
    detailsStatus: RequestStatus;
    requestedDetailsId: string | null;
    detailsVersion: number; // increments on invalidation
    load: (opts?: { source?: RequestSource; retry?: boolean }) => Promise<void>;
    upsert: (job: JobInsert | JobUpdate, opts?: { source?: RequestSource }) => Promise<void>;
    loadDetails: (jobId: string, opts?: {
        source?: RequestSource;
        retry?: boolean;
        keepPreviousData?: boolean
    }) => Promise<JobEntry | null>;
    invalidateDetails: (jobId?: string) => void;
    resetDetails: () => void;
    clearStatus: (which?: "load" | "upsert" | "details" | "all") => void;
};

const defaultRequestStatus: RequestStatus = {
    loading: false,
    error: null,
    success: null,
};

export default function useJobs(): UseJobsReturnType {
    const [data, setData] = useState<JobsListRowsType>([]);
    const [loadStatus, setLoadStatus] = useState<RequestStatus>(defaultRequestStatus);
    const [upsertStatus, setUpsertStatus] = useState<RequestStatus>(defaultRequestStatus);

    // Details state and status
    const [details, setDetails] = useState<JobEntry | null>(null);
    const [detailsStatus, setDetailsStatus] = useState<RequestStatus>(defaultRequestStatus);
    const [requestedDetailsId, setRequestedDetailsId] = useState<string | null>(null);
    const [detailsVersion, setDetailsVersion] = useState<number>(0);

    // Track the most recent request per action to implement a "latest-wins" guard
    const latestLoadId = useRef<string | null>(null);
    const latestUpsertId = useRef<string | null>(null);
    const latestDetailsId = useRef<string | null>(null);

    /*async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 350): Promise<T> {
        let lastErr: unknown;
        for (let i = 0; i < attempts; i++) {
            try {
                return await fn();
            } catch (e) {
                lastErr = e;
                if (i < attempts - 1) {
                    const delay = baseDelay * Math.pow(2, i); // 350, 700, 1400...
                    await new Promise((r) => setTimeout(r, delay));
                }
            }
        }
        throw lastErr;
    }*/

    const load = useCallback(async (opts?: { source?: RequestSource; retry?: boolean }) => {
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
            return await invoke<JobsListRowsType>("jobs_get_list");
        };

        try {
            infoLog("useJobs.load()");
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
                error: "Failed to fetch jobs",
                success: null,
                meta: {requestId, startedAt: loadStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });
            errorLog(e);
        }
    }, [loadStatus.meta?.startedAt]);

    const loadDetails = useCallback(async (jobId: string, opts?: {
        source?: RequestSource;
        retry?: boolean;
        keepPreviousData?: boolean
    }): Promise<JobEntry | null> => {
        infoLog(`useJobs.loadDetails() - jobId: ${jobId}, keepPreviousData: ${opts?.keepPreviousData ?? false}, retry: ${opts?.retry ?? false}`);

        const source = opts?.source ?? "system";
        setRequestedDetailsId(jobId || null);

        if (!jobId) {
            // Invalid/falsy ID: clear details and set error
            setDetails(null);
            setDetailsStatus({loading: false, error: "Job id is required", success: null});

            errorLog("useJobs.loadDetails() - Invalid job id: ", jobId);

            return null;
        }

        const requestId = newRequestId("details");
        latestDetailsId.current = requestId;

        if (!opts?.keepPreviousData) {
            setDetails(null);
            infoLog("useJobs.loadDetails() - Clearing details - keepPreviousData was false");
        }

        setDetailsStatus({
            loading: true,
            error: null,
            success: null,
            meta: {requestId, startedAt: now(), source},
        });

        const doFetch = async () => await invoke<JobEntry>("jobs_get_details", {jobId});

        try {
            const job = opts?.retry ? await retryWithBackoff(doFetch) : await doFetch();
            if (latestDetailsId.current !== requestId) {
                infoLog(`useJobs.loadDetails() - Latest details request was invalidated`, `latestDetailsId: ${latestDetailsId.current}`, `requestId: ${requestId}`);
                return null; // latest-wins
            }

            setDetails(job);
            setDetailsStatus({
                loading: false,
                error: null,
                success: null,
                meta: {requestId, startedAt: detailsStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });

            debugLog("useJobs.loadDetails() - job ->", job)

            return job;
        } catch (e) {
            if (latestDetailsId.current !== requestId) return null; // latest-wins
            setDetailsStatus({
                loading: false,
                error: `Failed to fetch job details #${jobId}`,
                success: null,
                meta: {requestId, startedAt: detailsStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });
            errorLog(e);
            return null;
        }
    }, [detailsStatus.meta?.startedAt]);

    const upsert = useCallback(async (job: JobInsert | JobUpdate, opts?: { source?: RequestSource }) => {
        const source = opts?.source ?? "user"; // default mutations to user-initiated
        const requestId = newRequestId("upsert");
        latestUpsertId.current = requestId;

        setUpsertStatus({
            loading: true,
            error: null,
            success: null,
            meta: {requestId, startedAt: now(), source},
        });

        try {
            const result = await invoke<string>("jobs_upsert", {data: job});

            infoLog("useJobs.upsert() - Job upsert result: ", result);

            if (latestUpsertId.current !== requestId) return; // latest-wins guard

            setUpsertStatus({
                loading: false,
                error: null,
                success: result || ("id" in job ? "Job updated" : "Job inserted"),
                meta: {requestId, startedAt: upsertStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });

            // Refresh list as a background system load (no toast)
            await load({source: "system"});
        } catch (err: unknown) {
            if (latestUpsertId.current !== requestId) return; // latest-wins guard
            const errorMessage = err instanceof Error ? err.message : String(err);
            setUpsertStatus({
                loading: false,
                error: errorMessage,
                success: null,
                meta: {requestId, startedAt: upsertStatus.meta?.startedAt ?? now(), finishedAt: now(), source},
            });
        }
    }, [load, upsertStatus.meta?.startedAt]);

    const clearStatus = useCallback((which?: "load" | "upsert" | "details" | "all") => {
        if (!which || which === "all" || which === "load") {
            setLoadStatus((s) => ({...s, error: null, success: null}));
        }
        if (!which || which === "all" || which === "upsert") {
            setUpsertStatus((s) => ({...s, error: null, success: null}));
        }
        if (!which || which === "all" || which === "details") {
            setDetailsStatus((s) => ({...s, error: null, success: null}));
        }
    }, []);

    const resetDetails = useCallback(() => {
        setDetails(null);
        setRequestedDetailsId(null);
        setDetailsStatus((s) => ({...s, error: null, success: null}));
    }, []);

    const invalidateDetails = useCallback((jobId?: string) => {
        // Clear the requested flag so the next effect can refetch and bump the version
        setRequestedDetailsId(null);
        setDetailsVersion((v) => v + 1);
        // Optionally keep current details to avoid flicker; consumers can pass keepPreviousData when refetching
        if (jobId && details?.id !== jobId) {
            // If invalidating a different job than currently shown, drop details
            setDetails(null);
        }
    }, [details?.id]);

    return {
        data,
        loadStatus,
        upsertStatus,
        details,
        detailsStatus,
        requestedDetailsId,
        detailsVersion,
        load,
        upsert,
        loadDetails,
        invalidateDetails,
        resetDetails,
        clearStatus
    };
}
