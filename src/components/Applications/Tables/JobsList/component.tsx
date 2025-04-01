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
    ChipProps,
    // Tooltip,
    Chip,
    Button,
} from "@heroui/react";

import useJobsList, {JobsListType} from "@/queries/useJobsList";
import {invoke} from "@tauri-apps/api/core";
import Link from "next/link";

const statusColorMap: Record<string, ChipProps["color"]> = {
    sent: "primary",
    in_progress: "secondary",
    got_offer: "success",
    rejected: "danger",
};

const statusLabelMap: Record<string, string> = {
    sent: "Sent",
    in_progress: "In progress",
    got_offer: "Successful",
    rejected: "Unsuccessful",
}

type JobsListRow = JobsListType["rows"][number];
export default function Component() {
    const {data, loading, error, refresh} = useJobsList();

    const handleArchiveClick = React.useCallback(async (id: bigint) => {
        console.log('handleArchiveClick() clicked -> ', id);
        try {
            const response: string = await invoke("jobs_archive_entry", {id});
            console.log(response);
            refresh();
        } catch (error) {
            console.error("Failed to delete job:", error);
        }
    }, [refresh]);


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
                const statusColor = typeof cellValue === "string" ? statusColorMap[cellValue] : "default";
                const statusLabel = typeof cellValue === "string" ? statusLabelMap[cellValue] : "Unknown";

                return (
                    <Chip className="capitalize" color={statusColor} size="sm"
                          variant="solid">
                        {statusLabel}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Link href={`/jobs/${item.id}`} className="job-link">
                            <Button isIconOnly aria-label="View" color="default" variant="solid">
                                <i className="bx bx-show"/>
                            </Button>
                        </Link>

                        <Button isIconOnly aria-label="Edit" color="default" variant="solid">
                            <i className="bx bxs-edit-alt"/>
                        </Button>

                        <Button isIconOnly aria-label="Archive (hide)" color="danger" variant="flat"
                                onPress={() => handleArchiveClick(item.id)}>
                            <i className="bx bxs-archive-in"/>
                        </Button>

                    </div>
                );
            default:
                return cellValue;
        }
    }, [handleArchiveClick]);

    return (
        <div className={style.container}>

            <div className="flex justify-end mb-5">
                <Button size="sm" color="default" onPress={refresh} isLoading={loading}>
                    {loading ? "Refreshing..." : "Refresh list"}
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
