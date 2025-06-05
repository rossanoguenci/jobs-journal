export const allowedColors = [
    "default",
    "primary",
    "secondary",
    "success",
    "warning",
    "danger",
] as const;

export type HeroColor = typeof allowedColors[number];

export function isValidColor(color: HeroColor): color is HeroColor {
    return allowedColors.includes(color);
}
