"use client";

import {useEffect, useRef, useState} from "react";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {debugLog, errorLog, infoLog} from "@utilities/devLog";
import { invoke } from "@tauri-apps/api/core";
import {RunResult} from "@/types/RunResult";

type AppInitState =
    | "idle"
    | "configuration"
    | "checking-data"
    | "load-data"
    | "ready"
    | "error";

export function useAppInit() {
    const {initialised, initError, jobPeriodsManager, jobsManager} = useGlobalSettingsContext();

    const [state, setState] = useState<AppInitState>("idle");
    const [message, setMessage] = useState<string>("Starting…");
    const [error, setError] = useState<string | null>(null);

    //debug only
    useEffect(() => {
        debugLog("useAppInit() - initialised:", initialised, "initError:", initError);
        debugLog("useAppInit() - state:", state, "message:", message, "error:", error);
    }, [error, initError, initialised, message, state]);

    // Phase 1: configuration — wait for GlobalSettingsProvider hydration
    useEffect(() => {
        if (state !== "idle") return;

        setMessage("Loading configuration…");

        if (initError) {
            setError(initError);
            setState("error");
            return;
        }

        if (initialised) {
            setState("checking-data");
        }
    }, [initialised, initError, state]);

    // Phase 2: checking-data — run backend startup checks once
    const ranRef = useRef(false);
    useEffect(() => {
        if (state !== "checking-data") return;
        if (ranRef.current) return;
        ranRef.current = true;

        (async () => {
            try {
                setMessage("Checking data…");

                const result: RunResult = await invoke("startup_run_checks");
                debugLog("startup_run_checks result:", result);

                setState("load-data");
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                errorLog("startup_run_checks error", msg);
                setError(msg);
                setState("error");
            }
        })();
    }, [state]);

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
                setError(msg);
                setState("error");
            }
        })();
    }, [state, jobPeriodsManager, jobsManager]);

    return {
        state, message, error,
    };
}