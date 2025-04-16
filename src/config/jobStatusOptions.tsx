import {ReactElement} from "react";

export interface JobStatusProps {
    key: string;
    label: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    icon?: ReactElement | string | null;
}

const jobStatusOptions: Array<JobStatusProps> = [
    {key: "sent", label: "Sent", color: "primary", icon: <i className="bx bxs-send"/>},
    {key: "in_progress", label: "In progress", color: "secondary", icon: <i className="bx bxs-analyse"/>},
    {key: "got_offer", label: "Successful", color: "success", icon: <i className="bx bxs-party"/>},
    {key: "rejected", label: "Unsuccessful", color: "danger", icon: <i className="bx bxs-sad"/>},
    {key: "withdrawn", label: "Withdrawn", color: "danger", icon: <i className="bx bx-x"/>},
];

export default jobStatusOptions;
