import {JSX} from "react";
import Icon from "@components/Icons";

type ColumnType = {
    key: string,
    label: string | JSX.Element,
    width?: number | undefined,
}

const columns: Array<ColumnType> = [
    {key: "job_entry", label: "Position", width: 250},
    {key: "application_date", label: (<span className="flex items-center align-middle gap-1">Submitted<Icon name="chevronDown"/></span>), width: 50},
    {key: "status", label: "Status", width: 50},
    {key: "actions", label: " ", width: 30},
];

export default columns;