"use client"

import React, {useState} from "react";
import Props from './props.types';
import style from "./style.module.scss";

import {Button, DatePicker, Input, Form, Autocomplete, AutocompleteItem} from "@heroui/react"

import {invoke} from "@tauri-apps/api/core"
import {JobEntry} from "@/types/JobEntry";
import {parseDate, getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@components/GlobalModal/ModalContext";
import locations from "@config/locations";


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

export default function Component({data = null}: Props) {
    const [queryResult, setQueryResult] = useState<insertProps>();
    const formRef = React.useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.currentTarget));

        console.log('formData', formData);

        if (!data) {
            // Insert new entry
            const result = await invokeBackend(formData);
            setQueryResult(result);

            if(result.status) {
                formRef.current?.reset();
            }

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

        if (result.status && closeModal) {
            closeModal();
        } else {
            setQueryResult(result);
        }
    };

    const onReset = () => {
        setQueryResult(undefined);
    }

    const default_size = "md";

    return (
        <Form
            ref={formRef}
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

            <Autocomplete
                isClearable={false} // (GitHub issue #1977)
                allowsCustomValue
                className="max-w-xs"
                defaultItems={locations}
                name="location"
                label="Location"
                aria-label="Location"
                size={default_size}
                inputValue={data?.location || undefined}
            >
                {(item) =>
                    <AutocompleteItem
                        key={item.key}
                        description={item.description ?? ''}
                        startContent={item.startContent ?? ''}
                    >{item.label}</AutocompleteItem>
                }
            </Autocomplete>

            {/*Actions*/}
            <div className="flex flex-wrap gap-2 w-full">
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
                            onPress={closeModal}
                        >Cancel
                        </Button>
                    </>
                    :
                    <>
                        {/*<Button
                            className="w-full"
                            aria-label="Insert and add a new one"
                            color="primary"
                            size={default_size}
                            radius={default_size}
                            type="submit"
                        >Insert & Add a new one
                        </Button>*/}

                        <Button
                            className="w-full"
                            aria-label="Insert"
                            color="primary"
                            size={default_size}
                            radius={default_size}
                            type="submit"
                        >Insert
                        </Button>

                        <Button
                            className="w-full"
                            aria-label="Reset"
                            size={default_size}
                            radius={default_size}
                            type="reset"
                        >Reset fields
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
