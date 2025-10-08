"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Button, Spinner} from "@heroui/react";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import {OrphansFallbackTarget, useOrphansResolver} from "@hooks/useOrphansResolver";
import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import {Form} from "@heroui/form";
import {PeriodSelect} from "@components/Settings/Periods";
import {debugLog, infoLog} from "@utilities/devLog";
import {Skeleton} from "@heroui/skeleton";
import {toastSuccess} from "@utilities/toast";
import {DatePicker} from "@heroui/date-picker";
import {DateValue, getLocalTimeZone, today} from "@internationalized/date";
import {Tabs, Tab} from "@heroui/tabs";

type Mode = OrphansFallbackTarget["kind"]

export default function OrphansResolverContent({
                                                   onResolvedAction,
                                               }: {
    onResolvedAction: () => Promise<void> | void;
}) {
    const {closeModal} = useModal();
    const [mode, setMode] = useState<Mode>("existing_period");
    const {jobPeriodsManager} = useGlobalSettingsContext();
    const {loading, preview, error, fetchPreview, apply} = useOrphansResolver();

    const {
        jobPeriodsList: periods,
        jobPeriodsLoaded
    } = useJobPeriodsStore();

    const [periodId, setPeriodId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<DateValue>(today(getLocalTimeZone()));
    const [endDate, setEndDate] = useState<DateValue | null>(null);

    const toYMD = (d?: DateValue | null) => (d ? d.toString() : "");

    //debug only
    useEffect(() => {
        debugLog("OrphansResolverContent - periodId", periodId);
    }, [periodId]);

    useEffect(() => {
        fetchPreview().then();
    }, [fetchPreview]);

    // Prefetch periods list only (idempotent) when modal opens and a list is empty
    useEffect(() => {
        if (!periods || periods.length === 0) {
            jobPeriodsManager.prefetchList?.().catch(() => {
            });
        }
        infoLog("OrphansResolverContent - periods", periods);
    }, [periods, jobPeriodsManager]);

    // Preselect suggested period when available
    useEffect(() => {
        if (preview?.suggested_period_id) setPeriodId(preview.suggested_period_id);
    }, [preview?.suggested_period_id]);

    const canAssignOrphans = useMemo(() => {
        return !(!preview || preview.orphan_count === 0);
    }, [preview]);

    const assignOrphans = useCallback(async () => {
        debugLog("OrphansResolverContent - assignOrphans {mode, periodId, canAssignOrphans}", mode, periodId, canAssignOrphans);

        if (loading) return; // prevent double submit
        if (!canAssignOrphans) return;

        let outcome;
        if (mode === "existing_period") {
            if (!periodId) return;
            outcome = await apply({kind: "existing_period", period_id: periodId} as OrphansFallbackTarget);
        } else {
            const start = toYMD(startDate);
            const end = toYMD(endDate) || undefined;
            if (!start) return;
            outcome = await apply({kind: "create_new_period", start, end} as OrphansFallbackTarget);
        }

        infoLog("OrphansResolverContent - outcome", outcome);
        toastSuccess(outcome.message);

        const refreshed = await fetchPreview();
        if (refreshed.orphan_count === 0) {
            infoLog("OrphansResolverContent - no more orphans, closing modal");

            await onResolvedAction();
            closeModal();
        }
    }, [mode, periodId, canAssignOrphans, fetchPreview, apply, startDate, endDate, onResolvedAction, closeModal, loading]);

    const tabs: { id: Mode, title: string, content: React.JSX.Element }[] = [
        {
            id: "existing_period",
            title: "Existing period",
            content:
                <>
                    <PeriodSelect
                        data={periods}
                        value={periodId}
                        onChange={setPeriodId}
                        disabled={!jobPeriodsLoaded || loading}
                    />
                    <Button
                        className="mt-3"
                        color="warning"
                        type="button"
                        isDisabled={!periodId || loading}
                        isLoading={loading}
                        onPress={assignOrphans}
                    >Assign</Button>
                </>
        },
        {
            id: "create_new_period",
            title: "Create new",
            content:
                <>
                    <div className="flex flex-col md:flex-row gap-2 items-start md:items-end">
                        <DatePicker
                            isRequired
                            label="Start date"
                            aria-label="Start date"
                            name="start"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <DatePicker
                            label="End date"
                            aria-label="End date"
                            name="end"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </div>
                    <Button
                        className="mt-3"
                        color="warning"
                        type="button"
                        isDisabled={!startDate || loading}
                        isLoading={loading}
                        onPress={assignOrphans}
                    >Create & Assign</Button>
                </>
        }
    ]

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
                    <div className="flex flex-col">
                        <p className="text-tiny text-warning font-semibold">{preview.message}</p>
                        <p className="text-tiny">Please proceed by choosing one of the available options.</p>
                        {typeof preview.would_infer_count === 'number' && typeof preview.would_need_fallback_count === 'number' && (
                            <p className="text-tiny">Auto by date: <b>{preview.would_infer_count}</b> · Need fallback: <b>{preview.would_need_fallback_count}</b></p>
                        )}
                    </div>


                    {preview.orphan_count > 0 && (
                        <Skeleton className="w-full rounded-lg" isLoaded={jobPeriodsLoaded}>
                            <Tabs
                                aria-label="Select mode"
                                variant="bordered"
                                color="warning"
                                selectedKey={mode}
                                onSelectionChange={(k) => setMode(k as Mode)}
                                items={tabs}
                                fullWidth
                                isDisabled={loading}
                            >
                                {(item) => (
                                    <Tab key={item.id} title={item.title} className="">
                                        {item.content}
                                    </Tab>
                                )}
                            </Tabs>

                        </Skeleton>
                    )}

                </Form>
            )}
        </div>
    )
}
