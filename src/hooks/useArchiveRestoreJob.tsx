import {useCallback, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export default function useArchiveRestoreJob() {
    const [state, setState] = useState<{ message: string | null; loading: boolean; error: string | null }>({
        message: null,
        loading: false,
        error: null,
    });

    const insertStatusJob = useCallback(async ({id, statusTo}: {
        id: bigint | number,
        statusTo: "archive" | "restore"
    }) => {
        console.log("insertStatusJob() -> ", id, statusTo);
        setState({message: null, loading: true, error: null});

        const invoke_function = `jobs_${statusTo}_entry`;

        try {
            console.log("trying: ", invoke_function);
            const message: string = await invoke(invoke_function, {id});
            console.log("message: ", message);
            setState({message: message, loading: false, error: null});
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === "string") {
                errorMessage = error;
            }
            setState({message: null, loading: false, error: errorMessage});
        }
    }, []);

    return {...state, insertStatusJob};
}
