"use client"

import React, {useEffect, useRef, useState} from "react";
import Props from './props.types';

import {Button, DatePicker, Input, Form, Autocomplete, AutocompleteItem} from "@heroui/react"

import {parseDate, getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@contexts/ModalContext";
import locations from "@config/locations";
import {JobInsert} from "@shared-types/JobInsert";
import {JobUpdate} from "@shared-types/JobUpdate";
import {Key} from "@react-types/shared";
import {toJobInsert} from "@utilities/toJobInsert";
import {debugLog} from "@utilities/devLog";
import {toJobUpdate} from "@utilities/toJobUpdate";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {toastWarning} from "@utilities/toast";

export default function Component({data = null}: Props) {
    const [warning, setWarning] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();

    const {jobsManager} = useGlobalSettingsContext();

    /* Autocomplete workaround
    *
    * issue #3186 -> https://github.com/heroui-inc/heroui/issues/3186
    * issue #3436 -> https://github.com/heroui-inc/heroui/issues/3436
    * issue #5113 -> https://github.com/heroui-inc/heroui/issues/5113
    *
    * */
    const [locationValue, setLocationValue] = useState(data?.meta.location || "");
    const isSelectionChange = useRef(false);

    const handleInputChange = (value: string) => {
        if (!isSelectionChange.current) {
            setLocationValue(value);
        }
        isSelectionChange.current = false;
    };

    const handleSelectionChange = (key: Key | null) => {
        const selectedItem = locations.find(item => item.key === key);
        if (selectedItem) {
            setLocationValue(selectedItem.label);
        }
        isSelectionChange.current = true;
    };


    /*On Submit*/
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const formData = Object.fromEntries(new FormData(e.currentTarget));

        debugLog('formData', formData);

        let payload: JobInsert | JobUpdate | null;

        if (!data) {
            payload = toJobInsert(formData);
        } else {
            payload = toJobUpdate(formData, data);

            if (!payload) {
                setWarning("Nothing to update");
                return;
            }
        }

        await jobsManager.upsert(payload);

    };

    useEffect(() => {
        if(warning) {
            toastWarning(warning)
            return
        }

        if (data?.id && jobsManager.upsertStatus.success) { //Updated
            closeModal();
        } else if (!data?.id && jobsManager.upsertStatus.success) { //Inserted
            formRef.current?.reset();
        }

    }, [data?.id, warning, closeModal, jobsManager.upsertStatus.error, jobsManager.upsertStatus.success, jobsManager]);


    const default_size = "md";

    return (
        <Form
            ref={formRef}
            className="p-10 flex w-full max-w-[1000px] flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl"
            onSubmit={onSubmit}
            onReset={() => setLocationValue(data?.meta.location || "")}
        >
            {/*Required*/}
            <Input
                isRequired
                label="Title"
                aria-label="Title"
                name="title"
                type="text"
                size={default_size}
                defaultValue={data?.title || ""}
            />

            <Input
                isRequired
                label="Company"
                aria-label="Company Name"
                type="text"
                name="company"
                size={default_size}
                defaultValue={data?.company || ""}
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
                name="link_to_job_posting"
                size={default_size}
                defaultValue={data?.meta.link_to_job_posting || ""}
            />

            <Autocomplete
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
                onClear={() => {
                    if (data) {
                        // When editing, reset to the original value
                        setLocationValue(data.meta.location || "");
                    } else {
                        // When creating new, clear completely
                        setLocationValue("");
                    }
                }}
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
                            isLoading={jobsManager.upsertStatus.loading}
                            disabled={jobsManager.upsertStatus.loading}
                        >{jobsManager.upsertStatus.loading ? "Is updating..." : "Update"}
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
                            isLoading={jobsManager.upsertStatus.loading}
                            disabled={jobsManager.upsertStatus.loading}
                        >{jobsManager.upsertStatus.loading ? "Inserting..." : "Insert"}
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