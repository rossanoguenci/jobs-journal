"use client";

import React, {useCallback, useEffect, useMemo, useState} from "react";
import type {Key} from "@react-types/shared";
import style from "./style.module.scss"
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    // ChipProps,
    Chip,
    Button, Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";

import useFetchJobs, {JobsListRowsType} from "@hooks/useFetchJobs";
import jobStatusOptions from "@config/jobStatusOptions";
import columns from "./columns";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus/component";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import InsertEvent from "@components/Applications/Forms/InsertEvent";
import {useModal} from "@components/GlobalModal/ModalContext";
import daysFromDate from "@utilities/daysFromDate";
import {Pagination} from "@heroui/pagination";
import {ChevronDownIcon} from "@heroui/shared-icons";
import JobActionsDropdown from "@components/JobActionsDropdown";
import type {Action} from "@components/JobActionsDropdown/props.types";
import Link from "next/link";

type JobsListRowType = JobsListRowsType[number];

export default function Component() {
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<Key>>(
        () => new Set(jobStatusOptions.map((status) => status.key))
    );

    const {data, loading, error, refresh} = useFetchJobs();
    const {openModal} = useModal();

    /* Paging */
    const rowsPerPage = 9;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    /* Render cell */
    const renderCell = useCallback((item: JobsListRowType, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof JobsListRowType];

        switch (columnKey) {
            case "job_entry":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{item.title}</p>
                        <p className="text-bold text-sm text-default-400">{item.company}</p>
                    </div>
                );

            case "application_date":
                if (typeof cellValue !== "string" || cellValue.length < 10) {
                    return null;
                }
                const [year, month, day] = cellValue.split("-");
                const daysFrom = daysFromDate(cellValue);
                return (<><p>{`${day}-${month}-${year}`}</p><p className="text-xs text-default-400">{daysFrom} days
                    ago</p></>);
            case "status":
                const statusColor = typeof cellValue === "string" ? jobStatusOptions.find(option => option.key === cellValue)?.color : "default";
                const statusLabel = typeof cellValue === "string" ? jobStatusOptions.find(option => option.key === cellValue)?.label : "Unknown";

                return (
                    <Chip
                        className="capitalize"
                        color={statusColor}
                        size="sm"
                        variant="solid"
                    >{statusLabel}
                    </Chip>
                );
            case "actions":
                const actions: Action[] = [
                    {
                        key: "add_event",
                        label: "Add event",
                        icon: "bx bxs-calendar-plus",
                        onClick: () => openModal(<InsertEvent jobId={item.id}/>, refresh),
                        section: "main"
                    }, {
                        key: "update_status",
                        label: "Update status",
                        icon: "bx bxs-info-circle",
                        onClick: () => openModal(<UpdateStatus data={item}/>, refresh),
                        section: "main"
                    }, {
                        key: "edit_job",
                        label: "Edit job info",
                        icon: "bx bxs-edit-alt",
                        onClick: () => openModal(<InsertEditJob data={item}/>, refresh),
                        section: "main"
                    }, {
                        key: "archive",
                        label: "Archive",
                        icon: "bx bxs-archive-in",
                        color: "warning",
                        onClick: () => (0),
                        section: "danger"
                    },
                ];

                return (
                    <div className="relative flex items-center gap-2">
                        <Link href={`/job#${item.id}`} className="job-link">
                            <Button isIconOnly title="View job details" aria-label="View job details" color="default"
                                    variant="faded" size="sm">
                                <i className="bx bx-show text-lg"/>
                            </Button>
                        </Link>

                        <JobActionsDropdown
                            actions={actions}
                            icon={<i className="bx bx-menu text-lg"/>}
                            triggerSize="sm"
                            variant="faded"
                        />
                    </div>
                );

            default:
                return cellValue;
        }
    }, [openModal, refresh]);

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
                        startContent={<i className="bx bx-search"/>}
                        value={filterValue}
                        onClear={() => onSearchClear()}
                        onValueChange={onSearchChange}
                        size="sm"
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button size="sm" endContent={<ChevronDownIcon className="text-small"/>}>
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

        </div>
    );
}
