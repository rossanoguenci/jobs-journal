"use client"

import React, {useState} from "react";
import Props from './props.types';
import style from "./style.module.scss";

import {Button, DatePicker, Input, Form, Autocomplete, AutocompleteItem} from "@heroui/react"

import {invoke} from "@tauri-apps/api/core"
import {JobEntry} from "@types/JobEntry";
import {parseDate, getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@components/Modal/provider";


type insertProps = {
    status: boolean;
    message: string;
}

async function invokeBackend(data: Record<string, unknown>): Promise<insertProps> {

    const functionToInvoke = data.id ? "jobs_update" : "jobs_insert";

    try {
        const message = await invoke<string>(functionToInvoke, {data: data});
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

export default function Component({data = null}: { data: null | JobEntry }) {
    const [queryResult, setQueryResult] = useState<insertProps>();
    const {onClose} = useModal();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.currentTarget));

        if (!data) {
            // Insert new entry
            const result = await invokeBackend(formData);
            setQueryResult(result);
            return;
        }

        // Update logic: Compare form values with existing data
        const updates: Record<string, unknown> = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== data[key as keyof JobEntry]) {
                updates[key] = formData[key];
            }
        });

        // If no changes are found, show a warning
        if (Object.keys(updates).length === 0) {
            setQueryResult({status: false, message: "Nothing to update"});
            return;
        }

        // Send only updated fields to the backend
        updates.id = data.id;
        console.log("Updates", updates);

        const result = await invokeBackend(updates);
        setQueryResult(result);
    };

    const onReset = () => {
        setQueryResult(undefined);
    }

    const default_size = "md";

    /*const locations: Array<{ label: string, key: string, description?: string, startContent?: never }> = [
        {label: "Remote", key: "remote", description: "Working from home"},
        {label: "Hybrid", key: "hybrid", description: "Working from home&office"},
        {label: "On site", key: "on_site", description: "Working from office only"},
    ];*/

    return (
        <Form
            className={style.container}
            onSubmit={onSubmit}
            onReset={onReset}
        >
            {/*Required*/}
            <Input
                isRequired
                label="Company"
                aria-label="Company Name"
                type="text"
                name="company"
                size={default_size}
                defaultValue={data?.company || ""}
            />

            <Input
                isRequired
                label="Title"
                aria-label="Title"
                name="title"
                type="text"
                size={default_size}
                defaultValue={data?.title || ""}
            />

            <DatePicker
                isRequired
                label="Date"
                aria-label="Date"
                name="application_date"
                size={default_size}
                defaultValue={data?.application_date ? parseDate(data.application_date) : today(getLocalTimeZone())}
            />

            {/*Optional*/}
            <Input
                label="Link"
                aria-label="Link"
                type="url"
                name="link"
                size={default_size}
                defaultValue={data?.link || ""}
            />

            {/*todo: to be added soon*/}
            {/*<Autocomplete
                allowsCustomValue
                className="max-w-xs"
                defaultItems={locations}
                label="Location"
                size={default_size}
                // inputValue={data?.location || undefined}
            >
                {(item) =>
                    <AutocompleteItem
                        key={item.key}
                        description={item.description ?? ''}
                        startContent={item.startContent ?? ''}
                    >{item.label}</AutocompleteItem>}
            </Autocomplete>*/}

            {/*Actions*/}
            <div className="flex gap-2">
                {data ?
                    <>
                        <Button
                            aria-label="Update"
                            color="warning"
                            size={default_size}
                            radius={default_size}
                            type="submit"
                        >Update
                        </Button>

                        <Button
                            aria-label="Cancel"
                            size={default_size}
                            radius={default_size}
                            onPress={onClose}
                        >Cancel
                        </Button>
                    </>
                    :
                    <>
                        <Button
                            aria-label="Insert and add a new one"
                            color="primary"
                            size={default_size}
                            radius={default_size}
                            type="submit"
                        >Insert & Add a new one
                        </Button>

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
                            type="reset"
                        >Reset
                        </Button>
                    </>
                }
            </div>

            {queryResult && (
                <div className={`text-small ${queryResult.status ? "text-success-500" : "text-danger-500"}`}>
                    {queryResult.message}
                </div>
            )}
        </Form>
    );
}
