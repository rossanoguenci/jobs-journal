"use client";

import React, {ReactNode, useEffect, useMemo, useRef} from "react";
import { Spinner } from "@heroui/react";
import {useAppInit} from "@hooks/useAppInit";
import {useModal} from "@contexts/ModalContext";
import { RESOLVERS } from "./resolvers";
import {infoLog, errorLog} from "@utilities/devLog";
import { invoke } from "@tauri-apps/api/core";

// Minimal local type to parse split preview
 type OrphansPreviewSplit = {
  orphan_count: number;
  would_infer_count: number;
  would_need_fallback_count: number;
  period_ids: string[];
  suggested_period_id?: string | null;
};

export default function AppInitGate({children}: { children: ReactNode }) {
    const { state, message, error, activeStep, refreshChecks } = useAppInit();
    const { openModal, isOpen } = useModal();

    // Prevent repeated zero-click attempts in a single checking cycle
    const attemptedZeroClickRef = useRef(false);

    // When in checking-data and a blocking interactive step exists, open the global modal with resolver content
    useEffect(() => {
        if (state !== "checking-data") return;
        const key = activeStep?.key;

        infoLog("AppInitGate - activeStep key: ", key)

        if (!key) return;

        // Zero-click fast path for orphan resolution: if all orphans are auto-inferable, apply immediately
        if (!attemptedZeroClickRef.current && key === "ensure_orphans_preview") {
            attemptedZeroClickRef.current = true;
            (async () => {
                try {
                    const split = await invoke<OrphansPreviewSplit>("ensure_orphans_preview_split");
                    infoLog("AppInitGate - split preview:", split);

                    if (split.orphan_count > 0 && split.would_need_fallback_count === 0) {
                        // pick a safe fallback id (will not be used if everything is inferable)
                        const fallbackId = (split.suggested_period_id && split.suggested_period_id.length > 0)
                            ? split.suggested_period_id
                            : split.period_ids[0];

                        if (fallbackId) {
                            infoLog("AppInitGate - zero-click path: applying inference immediately");
                            await invoke("ensure_orphans_apply_infer_by_date", {
                                fallback: { kind: "existing_period", period_id: fallbackId },
                            });
                            await refreshChecks();
                            return; // Skip opening the modal entirely
                        }

                        // No existing periods to even supply a fallback payload -> open modal for user to create one
                        infoLog("AppInitGate - zero-click path blocked (no period ids), opening modal");
                    }
                } catch (e) {
                    errorLog("AppInitGate - split preview failed; falling back to modal", e as any);
                }

                // Fallback to modal flow
                if (!isOpen) {
                    const entry = RESOLVERS[key!];
                    if (entry) {
                        infoLog(`AppInitGate - opening resolver for key='${key}'`)
                        openModal(entry.render({ onResolvedAction: refreshChecks }), entry.modalOptions);
                    } else {
                        infoLog(`AppInitGate - no resolver registered for key='${key}', skipping modal`)
                    }
                }
            })();
            return; // don't continue to the branch below in this effect run
        }

        if (isOpen) return;
        const entry = RESOLVERS[key];
        if (entry) {
            infoLog(`AppInitGate - opening resolver for key='${key}'`)
            openModal(entry.render({ onResolvedAction: refreshChecks }), entry.modalOptions);
        } else {
            infoLog(`AppInitGate - no resolver registered for key='${key}', skipping modal`)
        }
    }, [state, activeStep?.key, isOpen, openModal, refreshChecks]);

    const loading = useMemo(() => state !== "ready" && state !== "error", [state]);

    if (state === "checking-data") {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
                <Spinner size="lg"/>
                <div className="text-default-500">{message}</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
                <Spinner size="lg"/>
                <div className="text-default-500">{message}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
                <div className="text-danger-500 font-medium">Initialization error</div>
                <div className="text-default-500">{error}</div>
                <div className="text-default-400 text-sm">You can try to restart the app.</div>
            </div>
        );
    }

    return <>{children}</>;
}
