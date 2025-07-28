import {HeroColor} from "@/types/HeroColor";

export default interface Props {
    variant?: "full" | "compact" | "default";
    iconOnly?: boolean;
    as?: undefined | "button";
    className?: string;
    size?: "sm" | "md" | "lg";
    color?: HeroColor;
}
