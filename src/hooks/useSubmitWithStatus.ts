import { useState, useCallback } from "react";

export function useSubmitWithStatus<Args extends unknown[], T>(
    asyncFn: (...args: Args) => Promise<T>
) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const submit = useCallback(
        async (...args: Args): Promise<T | undefined> => {
            setLoading(true);
            setSuccess(null);
            setError(null);

            try {
                const result = await asyncFn(...args);
                setSuccess("Success!");
                return result;
            } catch {
                setError("Something went wrong.");
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [asyncFn]
    );

    return { submit, loading, success, error };
}
