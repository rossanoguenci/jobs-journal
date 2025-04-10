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
} from "@heroui/react";

import useJobEventLog from "@hooks/useJobEventLog";
import {JobEvent} from "@/types/JobEvent";

export default function Component({jobId}: { jobId: number }) {
    const {data, loading/*, error, refresh*/} = useJobEventLog({jobId});

    const renderCell = React.useCallback((item: JobEvent, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof JobEvent];

        switch (columnKey) {
            case "date_of_event": {
                if (typeof cellValue !== "string" || cellValue.length < 10) {
                    return null;
                }
                const [year, month, day] = cellValue.split("-");
                return (<>{`${day}-${month}-${year}`}</>);
            }
            case "description":{
                return cellValue;
            }
        }
    }, []);

    return (
        <div className={`${style.container}`}>
            <h2 className="text-sm">List of event</h2>
            <Table fullWidth={false} hideHeader removeWrapper aria-label="Table of events">
                <TableHeader columns={data?.columns ?? []}>
                    {/*todo: there's an issue with props, they are truing to fix*/}
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={loading}
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
