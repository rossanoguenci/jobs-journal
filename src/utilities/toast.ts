import {addToast} from "@heroui/toast";

export type ToastKind = "success" | "danger" | "warning" | "default";

export interface Props {
    title: string;
    description?: string;
    kind?: ToastKind;
    dedupeMs?: number
}

const DEDUPE_MS_DEFAULT = 2500;
const recentMap = new Map<string, number>();

function signature(kind: ToastKind, title: string, description: string) {
    return `${kind}|${title}|${description}`;
}

export function toast({title, description = "", kind = "default", dedupeMs = DEDUPE_MS_DEFAULT,}: Props) {
    const sig = signature(kind, title, description);
    const now = Date.now();
    const last = recentMap.get(sig) ?? 0;
    if (now - last < dedupeMs) return; // skip duplicate

    recentMap.set(sig, now);
    addToast({title, description, color: kind});
}

export const toastSuccess = (description: string, title = "Success") =>
    toast({title, description, kind: "success"});
export const toastError = (description: string, title = "Error") =>
    toast({title, description, kind: "danger"});
export const toastWarning = (description: string, title = "Warning") =>
    toast({title, description, kind: "warning"});