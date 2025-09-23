import {ReactNode} from "react";
import type { Variant } from "./variants";

export default interface Props {
    children?: ReactNode;
    variant?: Variant;
}
