"use client";

import React, {useEffect, useMemo, useState} from "react";
import {Select, SelectItem, Button, Spinner} from "@heroui/react";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import {useOrphansResolver} from "@hooks/useOrphansResolver";
import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import {Form} from "@heroui/form";
import {PeriodSelect} from "@components/Settings/Periods";
import {infoLog} from "@utilities/devLog";
import {Skeleton} from "@heroui/skeleton";
import {toastSuccess} from "@utilities/toast";

export default function OrphansResolverContent({
                                                   onResolvedAction,
                                               }: {
    onResolvedAction: () => Promise<void> | void;
}) {
    const {closeModal} = useModal();
    const {jobPeriodsManager} = useGlobalSettingsContext();
    const {loading, preview, error, fetchPreview, apply} = useOrphansResolver();

    const {
        jobPeriodsList: periods,
        selectedJobPeriodId: selectedId,
        // setSelectedJobPeriodId,
        jobPeriodsLoaded
    } = useJobPeriodsStore();

    /*const [strategy, setStrategy] = useState<
        "use_selected" | "existing_period" | "create_new_period"
    >("use_selected");*/

    const [periodId, setPeriodId] = useState<string | null>(null);

    // const [start, setStart] = useState("");
    // const [end, setEnd] = useState("");

    useEffect(() => {
        fetchPreview().then();
    }, [fetchPreview]);

    // Prefetch periods list only (idempotent) when modal opens and list is empty
    useEffect(() => {
        if (!periods || periods.length === 0) {
            jobPeriodsManager.prefetchList?.().catch(() => {
            });
        }
        infoLog("OrphansResolverContent - periods", periods);
    }, [periods, jobPeriodsManager]);

    useEffect(() => {
        if (preview?.suggested_period_id) setPeriodId(preview.suggested_period_id);
        else if (selectedId) setPeriodId(selectedId);
    }, [preview?.suggested_period_id, selectedId]);

    const canAssignOrphans = useMemo(() => {
        if (!preview || preview.orphan_count === 0) return false;
        // if (strategy === "existing_period") return !!periodId;
        // if (strategy === "create_new_period") return !!start; // end optional
        return true; // use_selected
    }, [preview]);

    const assignOrphans = async () => {
        if (periodId === null || !canAssignOrphans) return;

        /*const fallback =
            strategy === "existing_period"
                ? {kind: "existing_period", period_id: periodId}
                : strategy === "create_new_period"
                    ? {kind: "create_new_period", start, end: end || undefined}
                    : {kind: "use_selected"};
*/

        const outcome = await apply({kind: "existing_period", period_id: periodId});

        infoLog("OrphansResolverContent - outcome", outcome);

        toastSuccess(outcome.message);

        const refreshed = await fetchPreview();
        if (refreshed.orphan_count === 0) {
            await onResolvedAction();
            closeModal();
        }
    };

    return (
        <div className="p-10 flex w-full gap-4 flex-wrap">
            {error && <div className="text-danger-500">{error}</div>}

            {!preview && loading && (
                <div className="flex items-center gap-2 text-default-500">
                    <Spinner size="sm"/> Checking…
                </div>
            )}

            {preview && (
                <Form className="flex w-full flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl">
                    <p className="text-tiny text-warning font-semibold">{preview.message}</p>

                    {preview.orphan_count > 0 && (
                        <Skeleton className="w-full rounded-lg" isLoaded={jobPeriodsLoaded}>
                            <PeriodSelect
                                data={periods}
                                value={periodId}
                                onChange={setPeriodId}
                                disabled={!jobPeriodsLoaded}
                            />

                            <Button
                                className="mt-4"
                                color="warning"
                                type="submit"
                                isDisabled={!periodId}
                                onPress={assignOrphans}
                            >Select</Button>

                        </Skeleton>
                    )}

                </Form>
            )}
        </div>
    )
}
