"use client";

// Core React and Types
import React, {useCallback, useEffect, useMemo} from "react";
import type {Key} from "@react-types/shared";
import Link from "next/link";

// Styles
import style from "./style.module.scss"

// UI Components
import {Button} from "@heroui/button";
import {Input} from "@heroui/input";
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem} from "@heroui/dropdown";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/table";
import {Pagination} from "@heroui/pagination";
import StatusChip from "@components/StatusChip";
import JobActionsDropdown from "@components/JobActionsDropdown";

// Icons
import Icon from "@components/Icons";

// Forms
import UpdateStatus from "@components/Applications/Forms/UpdateStatus/component";
import UpsertJob from "@components/Applications/Forms/UpsertJob";
import InsertEvent from "@components/Applications/Forms/InsertEvent";

// Hooks and Utilities
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import daysFromDate from "@utilities/daysFromDate";
import {debugLog} from "@utilities/devLog";

// Config
import jobStatusOptions, {JobStatusKey} from "@config/jobStatusOptions";
import columns from "./columns";

// Types
import type {Action} from "@components/JobActionsDropdown/props.types";
import {JobEntry} from "@shared-types/JobEntry";
import {JobUpdate} from "@shared-types//JobUpdate";

//Stores
import {useJobsStore} from "@stores/useJobsStore";

import {useRouter} from "next/navigation";

export default function Component() {
    const router = useRouter();
    const {jobsList: data, setCurrentDetailsId} = useJobsStore();
    const {filters, setFilter, setAllStatuses} = useJobsStore();

    const {jobsManager} = useGlobalSettingsContext();
    const {openModal} = useModal();

    /* Paging */
    //todo: check when moving to job page and back
    const rowsPerPage = 9;
    const {paging, setPaging} = useJobsStore();

    /* Handlers */
    const handleJobArchive = useCallback(async (jobId: JobUpdate["id"]) => {
        if (!jobId || jobId.length === 0) return;

        await jobsManager.upsert({id: jobId, insert_status: "archived"} as JobUpdate, {source: "user"});

    }, [jobsManager]);

    const handleDetailsPage = useCallback((jobId: JobEntry["id"]) => {
        debugLog("handleDetailsPage - jobId: ", jobId);
        setCurrentDetailsId(jobId);
        router.push(`/job/`);
    }, [router, setCurrentDetailsId])


    /* Render cell */
    const renderCell = useCallback((item: JobEntry, columnKey: React.Key) => {
        if (columnKey === "job_entry") {
            return (
                <div className="flex flex-col">
                    <p className="text-bold text-sm">{item.title}</p>
                    <p className="text-bold text-sm text-default-400">{item.company}</p>
                </div>
            );
        }

        if (columnKey === "application_date") {
            const value = item.application_date;
            if (value.length < 10) {
                return null;
            }
            const [year, month, day] = value.split("-");
            const daysFrom = daysFromDate(value);
            return (
                <>
                    <p>{`${day}-${month}-${year}`}</p>
                    <p className="text-xs text-default-400">{daysFrom} days ago</p>
                </>
            );
        }

        if (columnKey === "status") {
            const value = item.status;
            const statusColor = jobStatusOptions.find(option => option.key === value)?.color ?? "default";
            const statusLabel = jobStatusOptions.find(option => option.key === value)?.label ?? "Unknown";
            const statusIcon = jobStatusOptions.find(option => option.key === value)?.icon ?? null;

            return (
                <StatusChip
                    color={statusColor}
                    label={statusLabel}
                    icon={statusIcon}
                />
            );
        }

        if (columnKey === "actions") {
            const actions: Action[] = [
                {
                    key: "add_event",
                    label: "Add event",
                    icon: <Icon name="addEvent"/>,
                    onClick: () => openModal(<InsertEvent jobId={item.id}/>, jobsManager.reload),
                    section: "main",
                },
                {
                    key: "update_status",
                    label: "Update status",
                    icon: <Icon name="updateStatus"/>,
                    onClick: () => openModal(<UpdateStatus data={item}/>, jobsManager.reload),
                    section: "main",
                },
                {
                    key: "edit_job",
                    label: "Edit job info",
                    icon: <Icon name="edit"/>,
                    onClick: () => openModal(<UpsertJob data={item}/>, jobsManager.reload),
                    section: "main",
                },
                {
                    key: "archive",
                    label: "Archive",
                    icon: <Icon name="archive"/>,
                    color: "warning",
                    onClick: () => handleJobArchive(item.id),
                    section: "danger",
                },
            ];

            return (
                <div className="relative flex items-center gap-2">
                    {/*<Link href={`/job#${item.id}`} className="job-link">*/}
                    {/*<Link href={{pathname: "/job/", query: {id: item.id} }} className="job-link">*/}
                    <Button
                        isIconOnly
                        title="View job details"
                        aria-label="View job details"
                        color="default"
                        variant="faded"
                        size="sm"
                        onPress={() => handleDetailsPage(item.id)}
                    >
                        <Icon name="seeMore"/>
                    </Button>

                    <JobActionsDropdown
                        actions={actions}
                        icon={<Icon name="menu"/>}
                        triggerSize="sm"
                        variant="faded"
                    />
                </div>
            );
        }

        return null; // default fallback, avoids returning something unsafe
    }, [handleJobArchive, jobsManager.reload, openModal]);


    /* Top content */
    const hasSearchFilter = Boolean(filters.search);

    const filteredItems = useMemo(() => {
        let filteredJobEntries = data ?? [] as JobEntry[];

        if (hasSearchFilter) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                jobEntry.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                jobEntry.company.toLowerCase().includes(filters.search.toLowerCase())
            );
        }
        if (filters.status.size > 0 && filters.status.size !== jobStatusOptions.length) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                filters.status.has(jobEntry.status as JobStatusKey)
            );
        }

        return filteredJobEntries;
    }, [data, hasSearchFilter, filters.status, filters.search]);

    const onSearchChange = useCallback((search: string) => {
        setFilter({search});
        setPaging({currentPage: 1});
    }, [setFilter, setPaging]);


    const handleSelectionChange = useCallback((keys: Iterable<Key>) => {
        if (keys === "all") {
            setAllStatuses();
            return;
        }

        const next = new Set(keys as Set<JobStatusKey>);
        setFilter({status: next});
    }, [setAllStatuses, setFilter]);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by title or company..."
                        startContent={<Icon name="search" className="size-4"/>}
                        value={filters.search}
                        onClear={() => onSearchChange("")}
                        onValueChange={onSearchChange}
                        size="sm"
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button size="sm" endContent={<Icon name="chevronDown" className="text-small"/>}>
                                    Status
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Status selection"
                                closeOnSelect={false}
                                selectedKeys={filters.status}
                                selectionMode="multiple"
                                onSelectionChange={handleSelectionChange}
                            >
                                {jobStatusOptions.map((status) => (
                                    <DropdownItem key={status.key} className="capitalize">
                                        {status.label}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                        <Button size="sm" color="default"
                                onPress={() => jobsManager.reload({source: "user", retry: true})}
                                isLoading={jobsManager.loadStatus.loading}>
                            {jobsManager.loadStatus.loading ? "Refreshing..." : "Refresh list"}
                        </Button>

                        <Button size="sm" color="primary" onPress={() => {
                            openModal(<UpsertJob/>, jobsManager.reload)
                        }}>
                            Add new
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {data ? data.length : "0"} entries</span>
                </div>
            </div>
        );
    }, [filters.search, filters.status, onSearchChange, handleSelectionChange, jobsManager, data, openModal]);

    /* The items (shown) */
    const items = useMemo(() => {
        const start = (paging.currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [filteredItems, paging.currentPage]);

    //todo: this is ok when loaded and jobsManager.reload has called, but when the table just need to be refreshed without resetting the paging (we can remove this frustration...). Check and fix.
    useEffect(() => {
        setPaging({totalPages: Math.ceil(filteredItems.length / rowsPerPage), currentPage: 1});

    }, [filteredItems, jobsManager.reload, setPaging]);

    return (
        <div className={style.container}>
            <Table isStriped isHeaderSticky aria-label="Table"
                   topContent={topContent}
                   bottomContent={
                       <div className="flex w-full justify-center">
                           <Pagination
                               isCompact
                               showControls
                               color="default"
                               page={paging.currentPage}
                               total={paging.totalPages}
                               onChange={(page) => setPaging({currentPage: page})}
                           />
                       </div>
                   }
            >
                <TableHeader columns={columns ?? []}>
                    {(column) =>
                        <TableColumn
                            key={column.key}
                            width={column.width}
                        >{column.label}
                        </TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={jobsManager.loadStatus.loading}
                    loadingContent={"Loading..."}
                    emptyContent={jobsManager.loadStatus.error ?
                        <p className="text-danger">{jobsManager.loadStatus.error}</p> : "No rows to display."}
                    items={items ?? []}
                >
                    {(item) => (
                        <TableRow key={String(item.id)}>
                            {(columnKey) =>
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
