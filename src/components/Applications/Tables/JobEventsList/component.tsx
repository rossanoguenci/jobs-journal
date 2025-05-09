"use client";

import React, {useEffect, useMemo, useState} from "react";
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
import columns from "./columns";
import {JobEvent} from "@/types/JobEvent";
import jobStatusOptions from "@config/jobStatusOptions";
import {Pagination} from "@heroui/pagination";

export default function Component({jobId}: { jobId: string }) {
    const {data, loading, error /*,refresh*/} = useJobEventLog({jobId});

    /* Paging */
    const rowsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            case "description": {
                if (typeof cellValue !== "string") return cellValue;

                let updatedValue = cellValue;

                jobStatusOptions.forEach(({key, label}) => {
                    const regex = new RegExp(`\\b${key}\\b`, "gi");
                    updatedValue = updatedValue.replace(regex, label);
                });

                return updatedValue;
            }
        }
    }, []);

    /* The items (shown) */
    const items = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return data?.slice(start, end) || [];
    }, [currentPage, data, rowsPerPage]);

    useEffect(() => {
        if (data) {
            setTotalPages(Math.ceil(data?.length / rowsPerPage));
        }

    }, [data]);

    return (
        <div className={`${style.container}`}>
            <h2 className="text-sm">List of event</h2>
            <Table hideHeader
                   shadow="none"
                   aria-label="Table of events"
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
                    {/* there's an issue with props, they are trying to fix*/}
                    {(column) => <TableColumn key={column.key} width={column.width}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={loading}
                    loadingContent={"Loading..."}
                    emptyContent={error ? <p className="text-danger">{error}</p> : "No rows to display."}
                    items={items}
                >
                    {(item) => (
                        <TableRow key={item.id}>
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
