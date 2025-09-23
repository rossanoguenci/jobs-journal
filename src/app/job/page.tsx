"use client"

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";

import {Avatar} from "@heroui/avatar";
import {Button} from "@heroui/button";
import {Skeleton} from "@heroui/skeleton";

import JobEventsList from "@components/Applications/Tables/JobEventsList";
import InsertEvent from "@components/Applications/Forms/InsertEvent";
import {useModal} from "@contexts/ModalContext";
import InsertEditJob from "@components/Applications/Forms/UpsertJob";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus";
import jobStatusOptions from "@config/jobStatusOptions";
import daysFromDate from "@utilities/daysFromDate";
import dateFormat from "@utilities/dateFormat";
import ExternalLink from "@components/ExternalLink";
import JobActionsDropdown from "@components/JobActionsDropdown";
import {Action} from "@components/JobActionsDropdown/props.types";
import StatusChip from "@components/StatusChip";
import Note from "@components/Applications/Note";
import InsertEditNote from "@components/Applications/Forms/InsertEditNote";
import Icon from "@components/Icons";
import BackButton from "@components/BackButton";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {debugLog, infoLog} from "@utilities/devLog";
import {JobUpdate} from "@shared-types/JobUpdate";
import {useJobsStore} from "@stores/useJobsStore";

export default function JobDetailsPage() {
    const {currentDetailsId: jobId, clearCurrentDetailsId} = useJobsStore();

    const router = useRouter();

    const {openModal} = useModal();
    const {jobsManager} = useGlobalSettingsContext();

    const details = jobsManager.details;
    const [refreshKey, setRefreshKey] = useState(0);
    const [pendingArchiveToggle, setPendingArchiveToggle] = useState(false);

    //todo: manage links dynamically, company's and linkedin's from Companies table - To be developed
    const links: Array<{ label: string, url: string }> = useMemo(() => {
        const list: Array<{ label: string, url: string }> = [];
        if (details?.meta.link_to_job_posting) {
            list.push({label: "Job posting", url: details.meta.link_to_job_posting});
        }
        return list;
    }, [details?.meta.link_to_job_posting]);

    const isArchived = details?.insert_status === "archived";

    const statusOption = useMemo(() => {
        const key = typeof details?.status === "string" ? details.status : undefined;
        return jobStatusOptions.find(o => o.key === key);
    }, [details?.status]);
    const statusColor = statusOption?.color ?? "default";
    const statusLabel = statusOption?.label ?? "Unknown";

    // Load details when jobId is present
    useEffect(() => {
        debugLog(
            "details page - useEffect",
            `jobId: ${jobId}`,
            `requestedDetailsId: ${jobsManager.requestedDetailsId}`
        );

        if (!jobId) return;

        const sameRequested = jobsManager.requestedDetailsId === jobId;
        const isLoading = jobsManager.detailsStatus.loading;
        const upsertJustSucceeded = !!jobsManager.upsertStatus?.success;

        debugLog(
            "details page - useEffect",
            `sameRequested: ${sameRequested}`,
            `isLoading: ${isLoading}`,
            `upsertJustSucceeded: ${upsertJustSucceeded}`
        );

        // 1) If a request for this job is already in-flight, don't start another.
        if (sameRequested && isLoading) return;

        // 2) If we already have details for this job, and we're not loading, skip,
        //    UNLESS an upsert just succeeded (we need a refresh).
        const sameJobId = jobsManager.details?.id === jobId;

        debugLog(
            "details page - useEffect",
            `sameJobId: ${sameJobId}`,
            `isLoading: ${isLoading}`
        );

        if (sameJobId && !isLoading && !upsertJustSucceeded) return;

        // Otherwise, fetch (either first load or a refresh after upsert).
        jobsManager
            .loadDetails(jobId, {source: "user"})
            .finally(() => {
                if (upsertJustSucceeded) {
                    jobsManager.clearStatus?.("upsert");
                }
            });

    }, [jobId, jobsManager]);

    /* Handlers for Job Actions Dropdown */
    const handleAddEvent = useCallback(() => {
        if (!details?.id) return;
        openModal(<InsertEvent jobId={details.id}/>, () => setRefreshKey(prev => prev + 1));
    }, [details?.id, openModal]);

    const handleUpdateStatus = useCallback(() => {
        if (!details) return;
        openModal(<UpdateStatus data={details}/>, () => setRefreshKey(prev => prev + 1));
    }, [details, openModal]);

    const handleEditJob = useCallback(() => {
        if (!details) return;
        openModal(<InsertEditJob data={details}/>);
    }, [details, openModal]);

    const handleEditNote = useCallback(() => {
        if (!details) return;
        openModal(<InsertEditNote data={details}/>);
    }, [details, openModal]);

    const handleToggleJobArchive = useCallback(async () => {
        infoLog("handleToggleJobArchive", "isArchived: ", isArchived);
        if (!jobId || isArchived === undefined) return;
        setPendingArchiveToggle(true);
        const statusTo = isArchived ? "restored" : "archived";
        await jobsManager.upsert({id: jobId, insert_status: statusTo} as JobUpdate, {source: "user"});
    }, [isArchived, jobsManager, jobId]);

    useEffect(() => {
        if (!pendingArchiveToggle) return;
        if (jobsManager.upsertStatus.success) {
            router.push("/");
            setPendingArchiveToggle(false);
            jobsManager.clearStatus("upsert");
        }
    }, [pendingArchiveToggle, jobsManager.upsertStatus.success, router, jobsManager]);

    const actions: Array<Action> = useMemo(() => ([
        {
            key: "add_event",
            label: "Add event",
            icon: <Icon name="addEvent"/>,
            onClick: handleAddEvent,
            section: "main"
        }, {
            key: "update_status",
            label: "Update status",
            icon: <Icon name="updateStatus"/>,
            onClick: handleUpdateStatus,
            section: "main"
        }, {
            key: "edit_job",
            label: "Edit job info",
            icon: <Icon name="edit"/>,
            onClick: handleEditJob,
            section: "main"
        }, {
            key: "note_field",
            label: details?.meta.note ? "Edit note" : "Add note field",
            icon: <Icon name="noteField"/>,
            onClick: handleEditNote,
            section: "main"
        }, {
            key: "archive",
            label: "Archive",
            icon: <Icon name="archive"/>,
            color: "warning",
            onClick: handleToggleJobArchive,
            section: "danger"
        },
    ]), [details?.meta.note, handleAddEvent, handleUpdateStatus, handleEditJob, handleEditNote, handleToggleJobArchive]);


    return (
        <main className="wrapper">

            <BackButton
                title="Back to the list"
                onPress={() => {
                    clearCurrentDetailsId()
                    jobsManager.resetDetails()
                    router.back()
                }}
            />

            {!details && !jobsManager.detailsStatus.loading &&
                <div className="flex items-center justify-center">Data not loaded</div>}

            {details && (
                <div className="container">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                        {/* Job Title */}
                        <div className="col-span-1 sm:col-span-2 flex items-center">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                <h1 className="text-xl font-semibold flex items-center gap-2">{details.insert_status === "archived" ? <>
                                    <Icon
                                        name="archive"/> Archived - </> : ''}{details.title ?? "N/A"}</h1>
                            </Skeleton>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                            <JobActionsDropdown
                                variant="flat"
                                actions={actions}
                                icon={<Icon name="menu" className="size-5"/>}
                            />
                        </div>

                        {/* Company Info */}
                        <div className="col-span-1 sm:col-span-2 flex items-center">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                <div className="flex items-center gap-3 align-middle">
                                    {/* There's an open issue (#5058) where users have reported that Avatar images lose quality or appear distorted when they're not perfectly square. Additionally, another issue (#3813) mentions problems with the Image component stretching beyond parent elements. */}
                                    <Avatar
                                        isDisabled
                                        radius="full"
                                        size="sm"
                                        color="default"
                                        showFallback
                                        fallback={<Icon name="company"/>}
                                        src=""
                                    />
                                    <span>{details.company ?? "N/A"}</span>
                                </div>
                            </Skeleton>
                        </div>

                        {/* Links */}
                        <div className="col-span-1">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                    {links.map((link, index) => (
                                        <Button
                                            key={index}
                                            className="text-xs"
                                            as={ExternalLink}
                                            color="default"
                                            href={link.url}
                                            variant="flat"
                                            startContent={<Icon name="externalLink"/>}
                                        >
                                            {link.label}
                                        </Button>
                                    ))}
                                </div>
                            </Skeleton>
                        </div>

                        {/* Location */}
                        <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                {/*{details?.meta.location && (*/}
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <span>Location</span>
                                    <StatusChip
                                        color="warning"
                                        label={details.meta.location ?? "N/A"}
                                        icon={<Icon name="location"/>}
                                        variant="bordered"
                                    />
                                </div>
                                {/*)}*/}
                            </Skeleton>
                        </div>

                        {/* Applied Date */}
                        <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                <div className="flex flex-col items-center justify-center gap-2">
                                <span>
                                    <i className="bx bx-calendar"></i> {dateFormat(details.application_date ?? '')}
                                </span>
                                    <span>({daysFromDate(details.application_date ?? '')} days ago)</span>
                                </div>
                            </Skeleton>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                            <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <span>Current status</span>
                                    <StatusChip
                                        color={statusColor}
                                        label={statusLabel ?? "Unknown"}
                                        icon={statusOption?.icon}
                                    />
                                </div>
                            </Skeleton>
                        </div>

                    </div>

                    {/* Notes */}
                    {details.meta.note && <Note>{details.meta.note}</Note>}


                    {/* Job Events list */}
                    <Skeleton className="rounded-lg" isLoaded={!jobsManager.detailsStatus.loading}>
                        <JobEventsList key={refreshKey} jobId={details.id}/>
                    </Skeleton>

                </div>
            )}
        </main>
    );
}
