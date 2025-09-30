"use client";

import React, {ReactNode, useEffect, useMemo} from "react";
import { Spinner } from "@heroui/react";
import {useAppInit} from "@hooks/useAppInit";
import {useModal} from "@contexts/ModalContext";
import OrphansResolverContent from "@/components/orphans/OrphansResolverContent";
import {infoLog} from "@utilities/devLog";

export default function AppInitGate({children}: { children: ReactNode }) {
    const { state, message, error, activeStep, refreshChecks } = useAppInit();
    const { openModal, isOpen } = useModal();

    // When in checking-data and a blocking interactive step exists, open the global modal with resolver content
    useEffect(() => {
        if (state !== "checking-data") return;
        const key = activeStep?.key;

        infoLog("AppInitGate - activeStep key: ", key)

        if (!key) return;
        if (!isOpen) {
            if (key === "ensure_orphans_preview") {
                infoLog("AppInitGate - opening modal for orphans resolver")
                openModal(<OrphansResolverContent onResolvedAction={refreshChecks} />);
            }
            // Future: add other key => resolver mappings here
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
