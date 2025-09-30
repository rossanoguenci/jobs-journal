"use client";

import {useCallback, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export type OrphansPreview = {
  orphan_count: number;
  total_jobs: number;
  period_ids: string[];
  suggested_period_id?: string | null;
  message: string;
};

export type OrphansFallbackTarget =
  | { kind: "use_selected" }
  | { kind: "existing_period"; period_id: string }
  | { kind: "create_new_period"; start: string; end?: string };

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
      const data = await invoke<OrphansPreview>("ensure_orphans_preview");
      setPreview(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const apply = useCallback(
    async (fallback: OrphansFallbackTarget) => {
      setLoading(true);
      setError(null);
      try {
        const outcome = await invoke<ApplyOutcome>(
          "ensure_orphans_apply_infer_by_date",
          { fallback }
        );
        try { await fetchPreview(); } catch {}
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

  return { loading, preview, error, fetchPreview, apply };
}
