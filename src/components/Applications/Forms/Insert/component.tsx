"use client"

import React, {useState} from "react";
import Props from './props.types';
import style from "./style.module.scss";

import {Button, DatePicker, Input, Form, Autocomplete, AutocompleteItem} from "@heroui/react"

import {invoke} from "@tauri-apps/api/core"

import {useActionContext} from "@components/ActionProvider";

type insertProps = {
    status: boolean;
    message: string;
}

async function insertEntry(data: { [k: string]: FormDataEntryValue; }): Promise<insertProps> {
    try {
        const message = await invoke<string>("insert_job_entry", {data: data});
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

export default function Component({isVisible = true}: Props) {
    const [queryResult, setQueryResult] = useState<insertProps>();

    const {activeAction, setActiveAction} = useActionContext();

    if (activeAction !== "add_application" || !isVisible) {
        return null;
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget));

        console.log(data);

        const result = await insertEntry(data);

        console.log(result);

        setQueryResult(result);
    };

    const onReset = () => {
        setQueryResult(undefined);
    }


    const default_size = "sm";

    const locations: Array<{ label: string, key: string, description?: string, startContent?: never }> = [
        {label: "Remote", key: "remote", description: "Working from home"},
        {label: "Hybrid", key: "hybrid", description: "Working from home&office"},
        {label: "On site", key: "on_site", description: "Working from office only"},
    ];

    return (
        <Form
            className={style.container}
            onSubmit={onSubmit}
            onReset={onReset}
        >
            <Input
                isRequired
                label="Company"
                aria-label="Company Name"
                type="text"
                name="company"
                size={default_size}
            />

            <Input
                isRequired
                label="Title"
                aria-label="Title"
                name="title"
                type="text"
                size={default_size}
            />

            <Input
                label="Link"
                aria-label="Link"
                type="url"
                name="link"
                size={default_size}
            />

            <div className="flex gap-3">

                <Autocomplete
                    allowsCustomValue
                    className="max-w-xs"
                    defaultItems={locations}
                    label="Location"
                    size={default_size}
                >
                    {(item) =>
                        <AutocompleteItem
                            key={item.key}
                            description={item.description ?? ''}
                            startContent={item.startContent ?? ''}
                        >{item.label}</AutocompleteItem>}
                </Autocomplete>

                <DatePicker
                    className="max-w-[284px]"
                    label="Date"
                    aria-label="Date"
                    name="date"
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
                <Button
                    aria-label="Close"
                    size={default_size}
                    radius={default_size}
                    type="button"
                    variant="flat"
                    onPress={() => setActiveAction(null)}>
                    Close
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