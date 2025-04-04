import { ReactElement } from "react";

export interface JobStatusProps {
    [key: string]: {
        label: string;
        color: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
        icon?: ReactElement | string | null;
    };
}

const jobStatus: JobStatusProps = {
    sent: { label: "Sent", color: "primary", icon: <i className="bx bxs-send" /> },
    in_progress: { label: "In progress", color: "secondary", icon: <i className="bx bxs-analyse" /> },
    got_offer: { label: "Successful", color: "success", icon: <i className="bx bxs-party" /> },
    rejected: { label: "Unsuccessful", color: "danger", icon: <i className="bx bxs-sad" /> },
    withdrawn: { label: "Withdrawn", color: "danger", icon: <i className="bx bx-x" /> },
};

export default jobStatus;
