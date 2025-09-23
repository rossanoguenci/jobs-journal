import {HeroColor} from "@shared-types/HeroColor";
import type {StyleVariant} from "./variants";

export default interface Props {
    variant?: StyleVariant;
    iconOnly?: boolean;
    as?: "button" | undefined;
    className?: string;
    size?: "sm" | "md" | "lg";
    color?: HeroColor;
}
