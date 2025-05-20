export const jobMetaKeys = [
    "note",
    "location",
    "link_to_job_posting",
] as const;

export type JobMetaKey = typeof jobMetaKeys[number];

export type MetaInput = Partial<Record<JobMetaKey, string>>;

/**
 * Extracts only the `meta` fields from a flat object like formData.
 */
export function extractMeta<T extends Record<string, unknown>>(data: T): MetaInput {
    const meta: MetaInput = {};

    for (const key of jobMetaKeys) {
        if (key in data) {
            meta[key] = data[key] as string;
        }
    }

    return meta;
}

/**
 * Removes the `meta` fields from an object, returning only the rest.
 */
export function stripMeta<T extends Record<string, unknown>>(data: T): Omit<T, JobMetaKey> {
    const base = { ...data };
    for (const key of jobMetaKeys) {
        delete base[key];
    }
    return base;
}

/**
 * Returns true if there are any changes between new and original meta.
 */
export function hasMetaChanges(newMeta: MetaInput, currentMeta: MetaInput = {}): boolean {
    return jobMetaKeys.some((key) => newMeta[key] !== currentMeta[key]);
}

/**
 * Flattens a meta object back into top-level fields (useful for forms).
 */
export function flattenMeta(meta: MetaInput = {}): MetaInput {
    const result: MetaInput = {};

    for (const key of jobMetaKeys) {
        if (key in meta) {
            result[key] = meta[key];
        }
    }

    return result;
}
