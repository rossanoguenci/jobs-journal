"use client";

import React from "react";
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
    Button,
} from "@heroui/react";

import useFetchJobs, {JobsListType} from "@hooks/useFetchJobs";
import Link from "next/link";
import useToggleJobArchive from "@hooks/useToggleJobArchive";
import jobStatus from "@config/jobStatus";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus/component";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import {useModal} from "@components/GlobalModal/ModalContext";

type JobsListRow = JobsListType["rows"][number];
export default function Component() {
    const {data, loading, error, refresh} = useFetchJobs();
    const {openModal} = useModal();

    const {/*message: messageArch,*/ /*error: errorArch,*/ insertStatusJob} = useToggleJobArchive();

    const handleArchiveClick = React.useCallback(async (id: bigint) => {
        console.log("handleArchiveClick() clicked -> ", id);
        await insertStatusJob({id, statusTo: "archive"});
        await refresh();
    }, [insertStatusJob, refresh]);

    const renderCell = React.useCallback((item: JobsListRow, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof JobsListRow];

        switch (columnKey) {
            case "application_date":
                if (typeof cellValue !== "string" || cellValue.length < 10) {
                    return null;
                }
                const [year, month, day] = cellValue.split("-");
                return (<>{`${day}-${month}-${year}`}</>);
            case "status":
                const statusColor = typeof cellValue === "string" ? jobStatus[cellValue].color : "default";
                const statusLabel = typeof cellValue === "string" ? jobStatus[cellValue].label : "Unknown";

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

    return (
        <div className={style.container}>

            <div className="flex justify-end mb-5 gap-3">

                <Button size="sm" color="default" onPress={refresh} isLoading={loading}>
                    {loading ? "Refreshing..." : "Refresh list"}
                </Button>

                <Button size="sm" color="primary" onPress={() => {
                    openModal(<InsertEditJob/>, refresh)
                }}>
                    Add new
                </Button>

            </div>

            <Table isStriped isHeaderSticky aria-label="Table">
                <TableHeader columns={data?.columns ?? []}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={loading}
                    loadingContent={"Loading..."}
                    emptyContent={error ? <p className="text-danger">{error}</p> : "No rows to display."}
                    items={data?.rows ?? []}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

        </div>
    );
}
