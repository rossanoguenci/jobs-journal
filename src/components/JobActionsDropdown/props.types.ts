export interface Action {
    key: string;
    label: string;
    icon: string;
    color?: "default" | "primary" | "secondary" | "warning" | "danger";
    section?: "main" | "danger";
    onClick: () => void;
}

export default interface Props {
    actions: Array<Action>;
    icon: React.ReactElement,
    triggerSize?: "sm" | "md" | "lg";
    variant?: "light" | "flat" | "solid" | "faded";
}
