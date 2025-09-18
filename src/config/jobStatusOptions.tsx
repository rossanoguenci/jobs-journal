import {ReactElement} from "react";
import Icon from "@components/Icons";

export interface JobStatusProps {
    key: string;
    label: string;
    color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
    icon?: ReactElement | string | null;
}

const defaultSize = "w-3 h-3";

// Preserve literals; verify shape with `satisfies`
export const jobStatusOptions = [
    {key: "sent", label: "Sent", color: "primary", icon: <Icon name="sent" className={defaultSize}/>},
    {
        key: "in_progress",
        label: "In progress",
        color: "secondary",
        icon: <Icon name="inProgress" className={defaultSize}/>
    },
    {key: "got_offer", label: "Successful", color: "success", icon: <Icon name="gotOffer" className={defaultSize}/>},
    {key: "rejected", label: "Unsuccessful", color: "danger", icon: <Icon name="rejected" className={defaultSize}/>},
    {key: "withdrawn", label: "Withdrawn", color: "danger", icon: <Icon name="withdrawn" className={defaultSize}/>},
    {key: "ghosted", label: "Ghosted", color: "default", icon: <Icon name="ghosted" className={defaultSize}/>},
] as const satisfies readonly JobStatusProps[];

// Literal union type of all keys: "sent" | "in_progress" | ...
export type JobStatusKey = typeof jobStatusOptions[number]["key"];

// Readonly array of keys for convenience
export const jobStatusKeys = jobStatusOptions.map(s => s.key) as readonly JobStatusKey[];


export default jobStatusOptions;
