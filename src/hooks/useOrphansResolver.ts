"use client";

import {useCallback, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {debugLog, infoLog} from "@utilities/devLog";

export type OrphansPreview = {
    orphan_count: number;
    total_jobs: number;
    period_ids: string[];
    suggested_period_id?: string | null;
    message: string;
    would_infer_count?: number;
    would_need_fallback_count?: number;
};

export type OrphansFallbackTarget =
    | { kind: "existing_period"; period_id: string }
    | { kind: "create_new_period"; start: string; end?: string | null };

export type ApplyOutcome = {
    updated_by_infer: number;
    updated_by_fallback: number;
    total_updated: number;
    message: string;
};

export function useOrphansResolver() {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<OrphansPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPreview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            try {
                const split = await invoke<OrphansPreview>("ensure_orphans_preview_split");
                setPreview(split);
                return split;
            } catch (e) {
                // Fallback to original preview if split command is unavailable
                const data = await invoke<OrphansPreview>("ensure_orphans_preview");
                setPreview(data);
                return data;
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const apply = useCallback(async (fallback: OrphansFallbackTarget) => {
            infoLog("useOrphansResolver.apply", fallback);

            // Normalize payload for create_new_period: empty/whitespace end -> null
            const normalized: OrphansFallbackTarget =
                fallback.kind === "create_new_period"
                    ? {
                        kind: "create_new_period",
                        start: fallback.start,
                        end: (fallback.end ?? undefined)
                            ? (fallback.end!.trim().length > 0 ? fallback.end!.trim() : null)
                            : null,
                    }
                    : fallback;

            setLoading(true);
            setError(null);
            try {
                const outcome = await invoke<ApplyOutcome>(
                    "ensure_orphans_apply_infer_by_date",
                    {fallback: normalized}
                );

                debugLog("useOrphansResolver.apply outcome:", outcome);

                try {
                    await fetchPreview();
                } catch {
                }
                return outcome;
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [fetchPreview]
    );

    return {loading, preview, error, fetchPreview, apply};
}
