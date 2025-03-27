"use client"

import React, {useState} from "react";
// import Props from './props.types';
import style from "./style.module.scss";

import {Button, DatePicker, Input, Form,} from "@heroui/react"

import {invoke} from "@tauri-apps/api/core"


type insertProps = {
    status: boolean;
    message: string;
}

//todo: change
async function insertEvent(data: { [k: string]: FormDataEntryValue; }): Promise<insertProps> {
    try {
        const message = await invoke<string>("job_events_insert", {data: data});
        console.log(message);
        return {status: true, message};
    } catch (error) {
        console.error("Error invoking Rust function:", error);

        // Ensure we extract the message properly
        let errorMessage = "An error occurred";

        if (typeof error === "string") {
            errorMessage = error;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === "object" && error !== null && "message" in error) {
            errorMessage = String(error.message);
        }

        return {status: false, message: errorMessage};
    }
}

export default function Component({jobId}: { jobId: number }) {
    const [queryResult, setQueryResult] = useState<insertProps>();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: { [k: string]: FormDataEntryValue } = {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            job_id: String(jobId),
        };

        console.log(data);

        const result = await insertEvent(data);

        console.log(result);

        setQueryResult(result);
    };

    const onReset = () => {
        setQueryResult(undefined);
    }


    const default_size = "sm";


    return (
        <Form
            className={style.container}
            onSubmit={onSubmit}
            onReset={onReset}
        >
            <Input
                isRequired
                label="Description"
                aria-label="Description"
                type="text"
                name="description"
                size={default_size}
            />

            <div className="flex gap-3">

                <DatePicker
                    label="Date of the event"
                    aria-label="Date of the event"
                    name="date_of_event"
                    size={default_size}
                    // hideTimeZone //todo: generate error
                    // showMonthAndYearPickers //todo: generate error
                    // defaultValue={today} //todo: generate error IDE
                />
            </div>
            <div className="flex gap-2">
                <Button
                    aria-label="Insert"
                    color="primary"
                    size={default_size}
                    radius={default_size}
                    type="submit"
                >Insert
                </Button>
                <Button
                    aria-label="Reset"
                    size={default_size}
                    radius={default_size}
                    type="reset">
                    Reset
                </Button>
            </div>

            {queryResult && (
                <div className={`text-small ${queryResult.status ? "text-success-500" : "text-danger-500"}`}>
                    {queryResult.message}
                </div>
            )}

        </Form>
    );
}