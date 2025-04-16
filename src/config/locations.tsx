import {ReactElement} from "react";

export interface LocationProps {
    label: string,
    key: string,
    description?: string,
    startContent?: ReactElement,
}


const locations: Array<LocationProps> = [
    {key: "remote", label: "Remote", description: "Working from home"},
    {key: "hybrid", label: "Hybrid", description: "Working from home&office"},
    {key: "on_site", label: "On site", description: "Working from office only"},
];

export default locations;