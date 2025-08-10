import {JobPeriod} from "@/types/JobPeriod";

export default interface Props {
    jobPeriodItem?: JobPeriod | null;
    onClose?: () => void;
}
