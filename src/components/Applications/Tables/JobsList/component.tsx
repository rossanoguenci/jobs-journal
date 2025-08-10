"use client";

// Core React and Types
import React, {useCallback, useEffect, useMemo, useState} from "react";
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
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import InsertEvent from "@components/Applications/Forms/InsertEvent";

// Hooks and Utilities
import useFetchJobs, {JobsListRowsType} from "@hooks/useFetchJobs";
import {useModal} from "@contexts/ModalContext";
import useToggleJobArchive from "@hooks/useToggleJobArchive";
import daysFromDate from "@utilities/daysFromDate";

// Config
import jobStatusOptions from "@config/jobStatusOptions";
import columns from "./columns";
import {addToast} from "@heroui/toast";

// Types
import type {Action} from "@components/JobActionsDropdown/props.types";

type JobsListRowType = JobsListRowsType[number];

export default function Component() {
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<Key>>(
        () => new Set(jobStatusOptions.map((status) => status.key))
    );

    const {error: errorToggleJobArchive, success: successToggleJobArchive, toggleJobArchive} = useToggleJobArchive();
    const {data, loading, error, refresh} = useFetchJobs();
    const {openModal} = useModal();

    /* Paging */
    const rowsPerPage = 9;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* Handler for archiving job entry */
    const handleJobArchive = useCallback(async (jobId: string) => {
        if (!jobId || jobId.length === 0) return;

        const statusTo = "archive";
        const verb = "archived";

        await toggleJobArchive({id: jobId, statusTo});

        if (errorToggleJobArchive) {
            addToast({
                title: "Error",
                description: `Error ${verb} job: ${errorToggleJobArchive}`,
                color: "danger",
            });
        } else if (successToggleJobArchive) {
            addToast({
                title: "Success",
                description: successToggleJobArchive,
                color: "success",
            });
        } else {
            addToast({
                title: "Warning",
                description: `Something went wrong`,
                color: "warning",
            });
        }

        refresh().then();

    }, [toggleJobArchive, successToggleJobArchive, errorToggleJobArchive, refresh]);


    /* Render cell */
    const renderCell = useCallback((item: JobsListRowType, columnKey: React.Key) => {
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
                    onClick: () => openModal(<InsertEvent jobId={item.id}/>, refresh),
                    section: "main",
                },
                {
                    key: "update_status",
                    label: "Update status",
                    icon: <Icon name="updateStatus"/>,
                    onClick: () => openModal(<UpdateStatus data={item}/>, refresh),
                    section: "main",
                },
                {
                    key: "edit_job",
                    label: "Edit job info",
                    icon: <Icon name="edit"/>,
                    onClick: () => openModal(<InsertEditJob data={item}/>, refresh),
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
                    <Link href={`/job#${item.id}`} className="job-link">
                        <Button isIconOnly title="View job details" aria-label="View job details" color="default"
                                variant="faded" size="sm">
                            <Icon name="seeMore"/>
                        </Button>
                    </Link>

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
    }, [handleJobArchive, openModal, refresh]);


    /* Top content */
    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = useMemo(() => {
        let filteredJobEntries = [...data];

        if (hasSearchFilter) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                jobEntry.title.toLowerCase().includes(filterValue.toLowerCase()) ||
                jobEntry.company.toLowerCase().includes(filterValue.toLowerCase())
            );
        }
        if (statusFilter.size > 0 && statusFilter.size !== jobStatusOptions.length) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                statusFilter.has(jobEntry.status)
            );
        }

        return filteredJobEntries;
    }, [data, filterValue, statusFilter, hasSearchFilter]);

    const onSearchChange = useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setCurrentPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onSearchClear = useCallback(() => {
        setFilterValue("");
        setCurrentPage(1);
    }, []);

    const handleSelectionChange = (keys: Iterable<Key>) => {
        setStatusFilter(new Set(keys));
    };

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by title or company..."
                        startContent={<Icon name="search" className="size-4"/>}
                        value={filterValue}
                        onClear={() => onSearchClear()}
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
                                selectedKeys={statusFilter}
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

                        <Button size="sm" color="default" onPress={refresh} isLoading={loading}>
                            {loading ? "Refreshing..." : "Refresh list"}
                        </Button>

                        <Button size="sm" color="primary" onPress={() => {
                            openModal(<InsertEditJob/>, refresh)
                        }}>
                            Add new
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {data.length} entries</span>
                </div>
            </div>
        );
    }, [
        loading,
        openModal,
        refresh,
        filterValue,
        statusFilter,
        data.length,
        onSearchChange,
        onSearchClear
    ]);

    /* The items (shown) */
    const items = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [currentPage, filteredItems, rowsPerPage]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredItems.length / rowsPerPage));

    }, [filteredItems, refresh]);

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
                               page={currentPage}
                               total={totalPages}
                               onChange={(page) => setCurrentPage(page)}
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
                    isLoading={loading}
                    loadingContent={"Loading..."}
                    emptyContent={error ? <p className="text-danger">{error}</p> : "No rows to display."}
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

            <pre>{errorToggleJobArchive}{successToggleJobArchive}</pre>

        </div>
    );
}
