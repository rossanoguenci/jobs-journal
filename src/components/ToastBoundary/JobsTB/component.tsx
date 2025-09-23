"use client"

import React, {useEffect, useRef} from "react";
// import Props from './props.types';
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {toastError, toastSuccess} from "@utilities/toast";

export default function Component() {
    const {jobsManager, eventsManager, i18nManager} = useGlobalSettingsContext();
    const {t} = i18nManager;

    const {upsertStatus, clearStatus} = jobsManager;
    const {upsertStatus: eventsUpsertStatus, clearStatus: clearEventsStatus} = eventsManager;

    const lastHandledJobIdRef = useRef<string | null>(null);
    const lastHandledEventIdRef = useRef<string | null>(null);

    // Reusable handler to avoid duplicate logic between jobs/events
    const handleToastForStatus = (
        status: { error?: string | null; success?: string | null; meta?: { requestId?: string; source?: string } | undefined },
        clear: (which?: "load" | "upsert" | "all") => void,
        lastHandledRef: React.RefObject<string | null>
    ) => {
        const meta = status.meta;
        if (!meta) return;
        if (lastHandledRef.current === meta.requestId) return; // Only handle each request once
        if (meta.source !== "user") return; // Only toast user-initiated actions

        if (status.error) {
            toastError(status.error, t("generic.error"));
            lastHandledRef.current = meta.requestId ?? null;
            clear("upsert");
        } else if (status.success) {
            toastSuccess(status.success, t("generic.success"));
            lastHandledRef.current = meta.requestId ?? null;
            clear("upsert");
        }
    };

    useEffect(() => {
        handleToastForStatus(upsertStatus, clearStatus, lastHandledJobIdRef);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upsertStatus.error, upsertStatus.success, upsertStatus.meta, clearStatus, t]);

    useEffect(() => {
        handleToastForStatus(eventsUpsertStatus, clearEventsStatus, lastHandledEventIdRef);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventsUpsertStatus.error, eventsUpsertStatus.success, eventsUpsertStatus.meta, clearEventsStatus, t]);

    return null;
}