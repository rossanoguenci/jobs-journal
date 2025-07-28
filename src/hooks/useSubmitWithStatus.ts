import {useState, useCallback} from "react";
import {debugLog, errorLog} from "@utilities/devLog";

/**
 * Custom hook for managing the status of an asynchronous submit operation.
 *
 * Given an async function, this hook provides a `submit` function that wraps the async logic and
 * manages its loading, success, and error states. It exposes these states as well as the submit
 * function for easy integration with UI components that need to provide user feedback during
 * data submissions or other async processes.
 *
 * @param asyncFn - The asynchronous function to be executed on submitting.
 * @returns An object containing:
 *   - submit: A function to invoke the async operation, wrapped with status handling.
 *   - loading: Whether the submit operation is in progress.
 *   - success: A string indicating a successful operation (or null if not successful or started).
 *   - error: A string error message if the operation failed (or null if no error).
 */
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

                debugLog("submit() result: ", result ?? "no returns for this key");
                setSuccess("Success!");
                return result;
            } catch (err: unknown) {
                errorLog("Something went wrong: " + err);
                setError("Something went wrong: " + err);
                return undefined;
            } finally {
                setLoading(false);
            }
        },
        [asyncFn]
    );

    return {submit, loading, success, error};
}