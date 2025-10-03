/**
 * Formats a date from "YYYY-MM-DD" to "DD-MM-YYYY".
 *
 * Behavior:
 * - Returns null unless the input is exactly 10 characters and matches YYYY-MM-DD.
 * - Validates calendar correctness (month/day ranges and leap years). Invalid dates return null.
 * - Ignores time or timezone parts; only the first 10 characters are considered valid.
 *
 * @param date - Date string in the exact format "YYYY-MM-DD".
 * @returns The formatted date string "DD-MM-YYYY", or null if the input is malformed or not a real date.
 * @example
 * dateFormat("2025-10-03"); // "03-10-2025"
 * dateFormat("2025-02-30"); // null (Feb 30 does not exist)
 */
export default function dateFormat(date: string): string | null {
    if (date.length !== 10) {
        return null;
    }

    // Enforce the exact shape: YYYY-MM-DD (no time or timezone parts)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return null;
    }

    // Extract numeric components
    const y = Number(date.slice(0, 4));
    const m = Number(date.slice(5, 7));
    const d = Number(date.slice(8, 10));

    // Validate calendar correctness via UTC reconstruction to avoid TZ effects
    const dt = new Date(Date.UTC(y, m - 1, d));
    const isValid =
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() === m - 1 &&
        dt.getUTCDate() === d;

    if (!isValid) return null;

    const mm = String(m).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${dd}-${mm}-${y}`;
}