"use client"

import React, {useCallback, useEffect, useState} from "react";
import {notFound, useRouter} from "next/navigation";

import {Avatar} from "@heroui/avatar";
import {Button} from "@heroui/button";
import {Skeleton} from "@heroui/skeleton";
import {addToast} from "@heroui/toast";

import JobEventsList from "@components/Applications/Tables/JobEventsList";
import InsertEvent from "@components/Applications/Forms/InsertEvent";
import useJobDetails from "@hooks/useJobDetails";
import {useModal} from "@components/GlobalModal/ModalContext";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus";
import useToggleJobArchive from "@hooks/useToggleJobArchive";
import jobStatusOptions from "@config/jobStatusOptions";
import daysFromDate from "@utilities/daysFromDate";
import dateFormat from "@utilities/dateFormat";
import ExternalLink from "@components/ExternalLink";
import JobActionsDropdown from "@components/JobActionsDropdown";
import {Action} from "@components/JobActionsDropdown/props.types";
import StatusChip from "@components/StatusChip";
// import {User} from "@heroui/shared-icons";
import Note from "@components/Applications/Note";
import InsertEditNote from "@components/Applications/Forms/InsertEditNote";
import Icon from "@components/Icons";
import BackButton from "@components/BackButton";


export default function JobDetailsPage() {
    const router = useRouter();
    const [jobId, setJobId] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const {openModal} = useModal();
    const {data, loading, error, refresh} = useJobDetails({jobId});
    const {error: errorToggleJobArchive, success: successToggleJobArchive, toggleJobArchive} = useToggleJobArchive();

    //todo: manage links dynamically, company's and linkedin's from Companies table - To be developed
    const links: Array<{ label: string, url: string }> = [
        // {label: "Job posting", url: data?.link ?? ""},
        // {label: "Company's website", url: "#"},
        // {label: "LinkedIn profile", url: "#"},
    ];

    if (data?.meta.link_to_job_posting) {
        links.push({label: "Job posting", url: data?.meta.link_to_job_posting ?? ""});
    }

    const isArchived = data?.insert_status === "archived";

    const statusColor = typeof data?.status === "string" ? jobStatusOptions.find(o => o.key === data.status)?.color : "default";
    const statusLabel = typeof data?.status === "string" ? jobStatusOptions.find(o => o.key === data.status)?.label : "Unknown";

    useEffect(() => {
        const id = window.location.hash.substring(1);
        console.log("id: ", id);

        if (id && id.length > 0) {
            setJobId(id);
        } else {
            notFound();
        }
    }, []);


    const actions: Array<Action> = [
        {
            key: "add_event",
            label: "Add event",
            icon: <Icon name="addEvent"/>,
            onClick: () => openModal(<InsertEvent jobId={jobId}/>, () => setRefreshKey(prev => prev + 1)),
            section: "main"
        }, {
            key: "update_status",
            label: "Update status",
            icon: <Icon name="updateStatus"/>,
            onClick: () => openModal(<UpdateStatus data={data}/>, () => {
                void refresh();
                setRefreshKey(prev => prev + 1);
            }),
            section: "main"
        }, {
            key: "edit_job",
            label: "Edit job info",
            icon: <Icon name="edit"/>,
            onClick: () => openModal(<InsertEditJob data={data}/>, refresh),
            section: "main"
        }, {
            key: "note_field",
            label: data?.meta.note && "Edit note" || "Add note field",
            icon: <Icon name="noteField"/>,
            onClick: () => openModal(<InsertEditNote data={data!}/>, refresh),
            section: "main"
        }, {
            key: "archive",
            label: "Archive",
            icon: <Icon name="archive"/>,
            color: "warning",
            onClick: () => handleToggleJobArchive(),
            section: "danger"
        },
    ];


    /* Handlers for Job Actions Dropdown */

    const handleToggleJobArchive = useCallback(async () => {
        if (isArchived === undefined) return;

        const statusTo = isArchived ? "restore" : "archive";
        const verb = statusTo === "archive" ? "archived" : "restored";

        await toggleJobArchive({id: jobId, statusTo});

        if (errorToggleJobArchive) {
            addToast({
                title: "Error",
                description: `Error ${verb} job: ${errorToggleJobArchive}`,
                color: "danger",
            });
        }

        if (successToggleJobArchive) {
            addToast({
                title: "Success",
                description: successToggleJobArchive,
                color: "success",
            });
            router.push(`/`);
            return;
        }

        addToast({
            title: "Warning",
            description: `Something went wrong`,
            color: "warning",
        });

    }, [isArchived, toggleJobArchive, successToggleJobArchive, errorToggleJobArchive, jobId, router]);


    return (
        <main className="wrapper">

            <BackButton title="Back to the list" />

            {error ? (<div className="error">{error}</div>) : (
                <div className="container">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                        {/* Job Title */}
                        <div className="col-span-1 sm:col-span-2 flex items-center">
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
                                <h1 className="text-xl flex items-center gap-2">{data?.insert_status === "archived" ? <><Icon
                                    name="archive" /> Archived - </> : ''}{data?.title ?? "N/A"}</h1>
                            </Skeleton>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex justify-end">
                            <JobActionsDropdown actions={actions} icon={<Icon name="menu" className="size-5"/>}/>
                        </div>

                        {/* Company Info */}
                        <div className="col-span-1 sm:col-span-2 flex items-center">
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
                                <div className="flex items-center gap-3 align-middle">
                                    {/* There's an open issue (#5058) where users have reported that Avatar images lose quality or appear distorted when they're not perfectly square. Additionally, another issue (#3813) mentions problems with the Image component stretching beyond parent elements. */}
                                    <Avatar
                                        isDisabled
                                        radius="full"
                                        size="sm"
                                        color="default"
                                        showFallback
                                        fallback={<Icon name="company" />}
                                        src=""
                                    />
                                    <span>{data?.company ?? "N/A"}</span>
                                </div>
                            </Skeleton>
                        </div>

                        {/* Links */}
                        <div className="col-span-1">
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
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
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
                                {data?.meta.location && (
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <span>Location</span>
                                        <StatusChip
                                            color="warning"
                                            label={data.meta.location}
                                            icon={<Icon name="location"/>}
                                            variant="bordered"
                                        />
                                    </div>
                                )}
                            </Skeleton>
                        </div>

                        {/* Applied Date */}
                        <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
                                <div className="flex flex-col items-center justify-center gap-2">
                                <span>
                                    <i className="bx bx-calendar"></i> {dateFormat(data?.application_date ?? '')}
                                </span>
                                    <span>({daysFromDate(data?.application_date ?? '')} days ago)</span>
                                </div>
                            </Skeleton>
                        </div>

                        {/* Status */}
                        <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                            <Skeleton className="rounded-lg" isLoaded={!loading}>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <span>Current status</span>
                                    <StatusChip
                                        color={statusColor}
                                        label={statusLabel ?? "Unknown"}
                                        icon={jobStatusOptions.find(option => option.key === data?.status)?.icon}
                                    />
                                </div>
                            </Skeleton>
                        </div>

                    </div>

                    {/* Notes */}
                    {data?.meta.note && <Note>{data.meta.note}</Note>}


                    {/* Job Events list */}
                    <Skeleton className="rounded-lg" isLoaded={!loading}>
                        <JobEventsList key={refreshKey} jobId={jobId}/>
                    </Skeleton>

                </div>
            )}
        </main>
    );
}
