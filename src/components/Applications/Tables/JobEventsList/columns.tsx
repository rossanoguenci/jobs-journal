import {JSX} from "react";

type ColumnType = {
    key: string,
    label: string | JSX.Element,
    width?: number | undefined,
}

const columns: Array<ColumnType> = [
    // {key: "id", label: "ID"},
    // {key: "job_id", label: "Job ID"},
    {key: "date_of_event", label: "Date of event"},
    {key: "description", label: "Description"},
    // {key: "insert_type", label: "Insert Type"},
    // {key: "insert_date", label: "Insert Date"},
];

export default columns;