import {JobPeriod} from "@shared-types/JobPeriod";

export default interface Props {
    jobPeriodItem?: JobPeriod | null;
    onClose?: () => void;
}
