"use client"

import React, {useEffect, useRef, useState} from "react";
import Props from './props.types';
import style from "./style.module.scss";

import {Button, DatePicker, Input, Form, Autocomplete, AutocompleteItem} from "@heroui/react"

import {JobEntry} from "@/types/JobEntry";
import {parseDate, getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@components/GlobalModal/ModalContext";
import locations from "@config/locations";
import {addToast} from "@heroui/toast";
import {useUpsertJob} from "@hooks/useUpsertJob";
import {JobInsert} from "@/types/JobInsert";
import {JobUpdate} from "@/types/JobUpdate";
import {Key} from "@react-types/shared";

export default function Component({data = null}: Props) {
    const [warning, setWarning] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();
    const {upsertJob, loading, error, success} = useUpsertJob();

    /* Autocomplete workaround
    *
    * issue #3186 -> https://github.com/heroui-inc/heroui/issues/3186
    * issue #3436 -> https://github.com/heroui-inc/heroui/issues/3436
    *
    * */
    const [locationValue, setLocationValue] = useState(data?.location || "");
    const isSelectionChange = useRef(false);

    const handleInputChange = (value: string) => {
        if (!isSelectionChange.current) {
            setLocationValue(value);
            // If you need to update a form state or parent component
            // updateFormData("location", value);
        }
        isSelectionChange.current = false;
    };

    const handleSelectionChange = (key: Key | null) => {
        // Find the selected item to get its label
        const selectedItem = locations.find(item => item.key === key);
        if (selectedItem) {
            setLocationValue(selectedItem.label);
            // If you need to update a form state or parent component
            // updateFormData("location", selectedItem.label);
        }
        isSelectionChange.current = true;
    };


    /*On Submit*/
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const formData = Object.fromEntries(new FormData(e.currentTarget));

        console.log('formData', formData);

        if (!data) {
            // Insert new entry
            const insertData = formData as JobInsert;
            await upsertJob(insertData);
        } else {
            // Update logic
            const updates: Record<string, unknown> = {};
            Object.keys(formData).forEach((key) => {
                if (formData[key] !== data[key as keyof JobEntry]) {
                    updates[key] = formData[key];
                }
            });

            if (Object.keys(updates).length === 0) {
                setWarning("Nothing to update");
                return;
            }

            updates.id = data.id;
            await upsertJob(updates as JobUpdate);
        }
    };

    useEffect(() => {
        if (error || success || warning) {
            addToast({
                title: error ? "Error" : warning ? "Warning" : "Success",
                description: error || warning || success || "",
                color: error ? "danger" : warning ? "warning" : "success",
            });
        }

        if (data?.id && success) {
            closeModal();
        } else {
            formRef.current?.reset();
        }

    }, [data?.id, error, success, warning, closeModal]);


    const default_size = "md";

    return (
        <Form
            ref={formRef}
            className={style.container}
            onSubmit={onSubmit}
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
                inputValue={locationValue}
                onInputChange={handleInputChange}
                onSelectionChange={handleSelectionChange}
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
                            isLoading={loading}
                            disabled={loading}
                        >{loading ? "Is updating..." : "Update"}
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
                        <Button
                            className="w-full"
                            aria-label="Insert"
                            color="primary"
                            size={default_size}
                            radius={default_size}
                            type="submit"
                            isLoading={loading}
                            disabled={loading}
                        >{loading ? "Inserting..." : "Insert"}
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
        </Form>
    );
}
