"use client";

import {useEffect, useState} from "react";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {debugLog, errorLog, infoLog} from "@utilities/devLog";
import {JobPeriod} from "@/types/JobPeriod";

type AppInitState =
    | "idle"
    | "hydrating"
    | "ensuring-periods"
    | "checking-orphans"
    | "fixing-orphans"
    | "ready"
    | "error";

export function useAppInit() {
    const {initialised, initError, jobPeriodsManager} = useGlobalSettingsContext();
    const {jobPeriods, jobPeriodsLoaded} = jobPeriodsManager;

    const [state, setState] = useState<AppInitState>("idle");
    const [message, setMessage] = useState<string>("Starting…");
    const [error, setError] = useState<string | null>(null);
    // const [orphans, setOrphans] = useState<JobEntry[]>([]);

    // const periodIds = useMemo(() => new Set((jobPeriods?.periods ?? []).map(p => p.id)), [jobPeriods]);

    //debug only
    useEffect(() => {
        debugLog("useAppInit() - initialised:", initialised, "initError:", initError);
        debugLog("useAppInit() - state:", state, "message:", message, "error:", error);
        debugLog("useAppInit() - jobPeriods:", jobPeriods, "loaded:", jobPeriodsLoaded);
    }, [error, initError, initialised, jobPeriods, jobPeriodsLoaded, message, state]);

    // Step 1: wait for GlobalSettingsProvider hydration
    useEffect(() => {
        if (state !== "idle") return;

        // setState("hydrating"); //this may cause a stuck state if the hydration takes too long
        setMessage("Loading configuration…");

        if (initError) {
            setError(initError);
            setState("error");
            return;
        }

        if (initialised) {
            setState("ensuring-periods");
        }
    }, [initialised, initError, state]);

    // Step 2: Ensure we have at least one period and a selected period
    useEffect(() => {
        if (state !== "ensuring-periods") return;

        infoLog("useAppInit() - step 2 - ensuring-periods")

        if (!jobPeriodsLoaded) return; // wait until periods are loaded

        infoLog("useAppInit() - step 2 - jobPeriodsLoaded")

        async function ensurePeriods() {
            try {
                const periods = jobPeriods?.periods ?? [];
                const selected = jobPeriods?.selected ?? "";

                if (periods.length === 0) {
                    setMessage("Creating default period…");

                    // Create a default current-month period (adjust fields to your JobPeriod type)
                    const now = new Date();
                    const first = new Date(now.getFullYear(), now.getMonth(), 1);
                    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    const defaultPeriod: JobPeriod = {
                        id: "", // empty triggers "add" in upsert_period
                        start: first.toISOString().slice(0, 10),
                        end: last.toISOString().slice(0, 10),
                    };

                    // Tauri will generate ID and set selected to new id (per your Rust command)
                    // await invoke("upsert_period", {periodValue: defaultPeriod});
                    await jobPeriodsManager.upsertJobPeriod(defaultPeriod);

                    // Refresh local periods data
                    await jobPeriodsManager.loadJobPeriods();
                } else if (!selected) {
                    // Select the first existing period if none selected
                    setMessage("Selecting default period…");
                    await jobPeriodsManager.setSelectedJobPeriod(periods[0].id);
                }

                // setState("checking-orphans"); //todo: restore when orphans are implemented
                setState("ready");
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                errorLog("ensurePeriods error", msg);
                setError(msg);
                setState("error");
            }
        }

        ensurePeriods().then();
    }, [state, jobPeriodsLoaded, jobPeriods, jobPeriodsManager]);

    // todo: Step 3: Detect orphans
    /*useEffect(() => {
        if (state !== "checking-orphans") return;

        async function detect() {
            try {
                setMessage("Checking jobs consistency…");

                if (!jobsLoading && jobs.length === 0) {
                    // If nothing loaded yet, ensure we have data
                    await refreshJobs();
                }

                const effectiveJobs = jobsLoading ? (await invoke<JobEntry[]>("jobs_get_list")) : jobs;

                const orphanList = (effectiveJobs ?? []).filter(j => {
                    const pid = j.meta?.period_id ?? "";
                    return !pid || !periodIds.has(pid);
                });

                setOrphans(orphanList);

                setState("ready");
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                errorLog("detect orphans error", msg);
                setError(msg);
                setState("error");
            }
        }

        detect().then();
    }, [state, jobsLoading, jobs, periodIds, refreshJobs]);

    const hasOrphans = orphans.length > 0;

    // Action: fix orphans by assigning to a given period
    const fixOrphansTo = useCallback(async (periodId: string) => {
        setState("fixing-orphans");
        setMessage("Fixing orphan jobs…");

        try {
            // Option A (no new Rust code): call jobs_update for each job
            // For large sets, consider a bulk Rust command (see Optional section below).
            for (const job of orphans) {
                const update: JobUpdate = {
                    id: job.id,
                    meta: {
                        ...(job.meta ?? {}),
                        period_id: periodId,
                    }
                } as JobUpdate;
                await invoke("jobs_update", {data: update});
            }

            await refreshJobs();
            setOrphans([]);

            setState("ready");
            setMessage("Ready");
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errorLog("fix orphans error", msg);
            setError(msg);
            setState("error");
        }
    }, [orphans, refreshJobs]);

    const skipFix = useCallback(() => {
        setState("ready");
    }, []);*/

    return {
        state, message, error,
        // hasOrphans, orphans,
        periods: jobPeriods?.periods ?? [],
        selectedPeriodId: jobPeriods?.selected ?? "",
        /*actions: {
            fixOrphansTo,
            skipFix,
        }*/
    };
}