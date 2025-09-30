"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {debugLog, errorLog} from "@utilities/devLog";
import {invoke} from "@tauri-apps/api/core";
import {RunResult} from "@shared-types/RunResult";
import {StepResult} from "@shared-types/StepResult";

type AppInitState =
    | "configuration"
    | "checking-data"
    | "load-data"
    | "ready"
    | "error";

export function useAppInit() {
    const {initialised, initError, jobPeriodsManager, jobsManager} = useGlobalSettingsContext();

    const [state, setState] = useState<AppInitState>("configuration");
    const [message, setMessage] = useState<string>("Starting…");
    const [error, setError] = useState<string | null>(null);

    // Startup steps (from backend) and active blocking step
    const [steps, setSteps] = useState<StepResult[]>([]);

    // Determine if a step requires user action (authoritative from backend)
    const requiresUserAction = (s: StepResult): boolean => s.requires_action;

    //debug only
    useEffect(() => {
        debugLog("useAppInit() - initialised:", initialised, "initError:", initError);
        debugLog("useAppInit() - state:", state, "message:", message, "error:", error);
    }, [error, initError, initialised, message, state]);

    // Phase 1: configuration — wait for GlobalSettingsProvider hydration
    useEffect(() => {
        if (state !== "configuration") return;

        setMessage("Loading configuration…");

        if (initError) {
            setError(initError);
            setState("error");
            return;
        }

        if (initialised) {
            setState("checking-data");
        }
    }, [state, initialised, initError]);

    // Shared runner for backend startup checks
    const didRunChecksRef = useRef(false);
    const runChecksAndMaybeAdvance = useCallback(async () => {
        setMessage("Checking data…");
        const result: RunResult = await invoke("startup_run_checks");
        const newSteps: StepResult[] = result?.steps || [];
        setSteps(newSteps);
        if (newSteps.filter(requiresUserAction).length === 0) {
            setState("load-data");
        }
    },[]);

    // Phase 2: checking-data — run backend startup checks
    useEffect(() => {
        if (state !== "checking-data") return;
        if (didRunChecksRef.current) return;
        didRunChecksRef.current = true;

        (async () => {
            try {
                await runChecksAndMaybeAdvance();
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                errorLog("startup_run_checks error", msg);
                setError(msg);
                setState("error");
            }
        })();
    }, [runChecksAndMaybeAdvance, state]);

    // Refresh checks after a resolver finishes
    const refreshChecks = async () => {
        try {
            await runChecksAndMaybeAdvance();
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errorLog("refreshChecks error", msg);
            setError(msg);
            setState("error");
        }
    };

    // Phase 3: load-data — refresh client caches
    useEffect(() => {
        if (state !== "load-data") return;

        (async () => {
            try {
                setMessage("Loading data…");

                await Promise.all([
                    jobPeriodsManager.init(),
                    jobsManager.init(),
                ])

                setState("ready");
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                errorLog("load-data error", msg);
                setError(msg);
                setState("error");
            }
        })();
    }, [state, jobPeriodsManager, jobsManager]);

    // Derive active blocking step (first in queue)
    const blockingQueue = useMemo(() => steps.filter(requiresUserAction), [steps]);
    const activeStep: StepResult | null = blockingQueue[0] ?? null;

    return {
        state, message, error,
        activeStep,
        refreshChecks,
    };
}