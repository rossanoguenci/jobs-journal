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
    Tooltip,
    Chip,
    Button,
} from "@heroui/react";

import useJobsList, {JobsListType} from "@/queries/useJobsList";
import {Eye, Edit, Delete} from "@components/Icons";
import {invoke} from "@tauri-apps/api/core";

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

    const handleTrashClick = React.useCallback(async (id: number) => {
        console.log('handleTrashClick() clicked -> ', id);
        try {
            const response: string = await invoke("trash_job_entry", {id});
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
                return (
                    <Chip className="capitalize" color={statusColorMap[cellValue] || "default"} size="sm"
                          variant="solid">
                        {statusLabelMap[cellValue]}
                    </Chip>
                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip color="warning" content="This is still in development" showArrow={true}>
                            <Button isIconOnly aria-label="View" color="default" variant="flat">
                                <Eye/>
                            </Button>
                        </Tooltip>

                        <Tooltip color="warning" content="This is still in development" showArrow={true}>
                            <Button isIconOnly aria-label="Edit" color="default" variant="flat">
                                <Edit/>
                            </Button>
                        </Tooltip>

                        <Button isIconOnly aria-label="Delete" color="danger" variant="flat"
                                onPress={() => handleTrashClick(item.id)}>
                            <Delete/>
                        </Button>

                    </div>
                );
            default:
                return cellValue;
        }
    }, [handleTrashClick]);

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
