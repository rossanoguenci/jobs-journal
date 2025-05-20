import type { JobUpdate } from "@/types/JobUpdate";
import { extractMeta, stripMeta, hasMetaChanges } from "@utilities/meta";

type UpdatableKey = Exclude<keyof JobUpdate, "meta" | "id">;

export function toJobUpdate(
    formData: Record<string, unknown>,
    original: JobUpdate
): JobUpdate | null {
    const base = stripMeta(formData);
    const meta = extractMeta(formData);

    const updates: Partial<JobUpdate> = {};

    (Object.keys(base) as UpdatableKey[]).forEach((key) => {
        const newValue = base[key] as JobUpdate[UpdatableKey];
        const oldValue = original[key];

        if (newValue !== oldValue) {
            updates[key] = newValue;
        }
    });

    if (hasMetaChanges(meta, original.meta ?? {})) {
        updates.meta = {
            ...original.meta,
            ...meta,
        };
    }

    if (Object.keys(updates).length === 0) {
        return null;
    }

    updates.id = original.id;

    return updates as JobUpdate;
}
