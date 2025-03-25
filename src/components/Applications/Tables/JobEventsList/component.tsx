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

import {Eye, Edit, Delete} from "@components/Icons";
import {invoke} from "@tauri-apps/api/core";
import Link from "next/link";

type JobEventsRowProps = {
    id: number,
    date_of_event: string,
    description: string,
}
export default function Component() {
    // const {data, loading, error, refresh} = useJobsList();

    const data = {
        columns: [
            {key: "date_of_event", label: "Date of Event"},
            {key:"description", label: "Description"},
        ],
        rows: [
            {id: 1, date_of_event: "2024-03-24", description: "Bla bla bla"},
            {id: 2, date_of_event: "2024-03-24", description: "Bla bla bla"},
            {id: 3, date_of_event: "2024-03-24", description: "Bla bla bla"},
            {id: 4, date_of_event: "2024-03-24", description: "Bla bla bla"},
        ],
    }

    const renderCell = React.useCallback((item: JobEventsRowProps, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof JobEventsRowProps];

        switch (columnKey) {
            case "date_of_event":
                if (typeof cellValue !== "string" || cellValue.length < 10) {
                    return null;
                }
                const [year, month, day] = cellValue.split("-");
                return (<>{`${day}-${month}-${year}`}</>);

            default:
                return cellValue;
        }
    }, []);

    return (
        <div className={`${style.container} shadow-small`}>
            <h2>List of event</h2>
            <Table fullWidth={false} hideHeader removeWrapper aria-label="Table of events">
                <TableHeader columns={data?.columns ?? []}>
                    {/*todo: there's an issue with props, they are truing to fix*/}
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    // isLoading={loading}
                    loadingContent={"Loading..."}
                    emptyContent={"No rows to display."}
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
