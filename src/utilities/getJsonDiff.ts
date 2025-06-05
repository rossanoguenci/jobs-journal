export default function getJsonDiff<T extends object>(base: T, updated: T): Partial<T> | object {
    const diff = {} as Partial<T>;

    (Object.keys(updated) as (keyof T)[]).forEach((key) => {
        const baseVal = base[key];
        const updatedVal = updated[key];

        if (
            typeof baseVal === 'object' &&
            typeof updatedVal === 'object' &&
            baseVal !== null &&
            updatedVal !== null &&
            !Array.isArray(baseVal) &&
            !Array.isArray(updatedVal)
        ) {
            const nestedDiff = getJsonDiff(baseVal, updatedVal);
            if (nestedDiff !== undefined) {
                diff[key] = nestedDiff as T[keyof T];
            }
        } else if (JSON.stringify(baseVal) !== JSON.stringify(updatedVal)) {
            diff[key] = updatedVal;
        }
    });

    return Object.keys(diff).length ? diff : {};
}
