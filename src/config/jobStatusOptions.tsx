import {ReactElement} from "react";
import Icon from "@components/Icons";

export interface JobStatusProps {
    key: string;
    label: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    icon?: ReactElement | string | null;
}

const defaultSize = "w-3 h-3";

const jobStatusOptions: Array<JobStatusProps> = [
    {key: "sent", label: "Sent", color: "primary", icon: <Icon name="sent" className={defaultSize}/>},
    {key: "in_progress", label: "In progress", color: "secondary", icon: <Icon name="inProgress" className={defaultSize}/>},
    {key: "got_offer", label: "Successful", color: "success", icon: <Icon name="gotOffer" className={`${defaultSize} text-success`}/>},
    {key: "rejected", label: "Unsuccessful", color: "danger", icon: <Icon name="rejected" className={defaultSize}/>},
    {key: "withdrawn", label: "Withdrawn", color: "danger", icon: <Icon name="withdrawn" className={defaultSize}/>},
    {key: "ghosted", label: "Ghosted", color: "default", icon: <Icon name="ghosted" className={defaultSize}/>},
];

export default jobStatusOptions;
