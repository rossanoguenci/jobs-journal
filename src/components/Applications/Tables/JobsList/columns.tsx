import {JSX} from "react";

type ColumnType = {
    key: string,
    label: string | JSX.Element,
    width?: number | undefined,
}

const columns: Array<ColumnType> = [
    {key: "job_entry", label: "Position", width: 250},
    {key: "application_date", label: (<><i className="bx bxs-down-arrow"/> Submitted</>), width: 50},
    {key: "status", label: "Status", width: 50},
    {key: "actions", label: " ", width: 30},
];

export default columns;