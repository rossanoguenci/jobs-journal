"use client";

import React, {useCallback, useState} from "react";
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
    // Tooltip,
    Chip,
    Button, Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@heroui/react";

import useFetchJobs, {JobsListRowsType} from "@hooks/useFetchJobs";
import Link from "next/link";
import useToggleJobArchive from "@hooks/useToggleJobArchive";
import jobStatusOptions from "@config/jobStatusOptions";
import columns from "./columns";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus/component";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import {useModal} from "@components/GlobalModal/ModalContext";
import daysFromDate from "@lib/daysFromDate";
import {Pagination} from "@heroui/pagination";
import {ChevronDownIcon} from "@heroui/shared-icons";

type JobsListRowType = JobsListRowsType[number];

export default function Component() {
    const [filterValue, setFilterValue] = useState("");
    const [statusFilter, setStatusFilter] = useState<Set<Key>>(
        () => new Set(jobStatusOptions.map((status) => status.key))
    );

    const {data, loading, error, refresh} = useFetchJobs();
    const {openModal} = useModal();

    /* Paging */
    const [page, setPage] = useState(1);
    const rowsPerPage = 13;

    const pages = Math.ceil(data.length / rowsPerPage);

    /* Archive action */
    const {/*message: messageArch,*/ /*error: errorArch,*/ insertStatusJob} = useToggleJobArchive();

    const handleArchiveClick = useCallback(async (id: bigint) => {
        console.log("handleArchiveClick() clicked -> ", id);
        await insertStatusJob({id, statusTo: "archive"});
        await refresh();
    }, [insertStatusJob, refresh]);

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
                return (
                    <div className="relative flex items-center gap-2">
                        <Button isIconOnly aria-label="Update status" color="default" variant="solid"
                                onPress={() => openModal(<UpdateStatus data={item}/>, refresh)}>
                            <i className="bx bxs-info-circle"/>
                        </Button>

                        <Link href={`/job#${item.id}`} className="job-link">
                            <Button isIconOnly aria-label="View" color="default" variant="solid">
                                <i className="bx bx-show"/>
                            </Button>
                        </Link>

                        <Button isIconOnly aria-label="Archive (hide)" color="danger" variant="flat"
                                onPress={() => handleArchiveClick(item.id)}>
                            <i className="bx bxs-archive-in"/>
                        </Button>

                    </div>
                );
            default:
                return cellValue;
        }
    }, [handleArchiveClick, openModal, refresh]);

    /*Top content - dev*/
    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = React.useMemo(() => {
        let filteredJobEntries = [...data];

        if (hasSearchFilter) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                jobEntry.title.toLowerCase().includes(filterValue.toLowerCase()),
            );
        }
        if (statusFilter.size > 0 && statusFilter.size !== jobStatusOptions.length) {
            filteredJobEntries = filteredJobEntries.filter((jobEntry) =>
                statusFilter.has(jobEntry.status)
            );
        }

        return filteredJobEntries;
    }, [data, filterValue, statusFilter, hasSearchFilter]);

    const onSearchChange = React.useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onSearchClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const handleSelectionChange = (keys: Iterable<Key>) => {
        setStatusFilter(new Set(keys));
    };



    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Search by name..."
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

    return (
        <div className={style.container}>
            <Table isStriped isHeaderSticky aria-label="Table"
                   topContent={topContent}
                   bottomContent={
                       <div className="flex w-full justify-center">
                           <Pagination
                               isCompact
                               showControls
                               showShadow
                               color="secondary"
                               page={page}
                               total={pages}
                               onChange={(page) => setPage(page)}
                           />
                       </div>
                   }
            >
                <TableHeader columns={columns ?? []}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
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
