"use client"

import React, {useEffect} from "react";
// import Props from './props.types';
import {Button, DatePicker, Input, Form,} from "@heroui/react"
import {getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@contexts/ModalContext";
import {JobEvent} from "@shared-types/JobEvent";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
// import {toastWarning} from "@utilities/toast";


export default function Component({jobId}: { jobId: string | null }) {
    // const [warning, setWarning] = useState<string | null>(null);
    const {eventsManager} = useGlobalSettingsContext();
    const {closeModal} = useModal();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: Record<string, unknown> = {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            job_id: jobId,
        };

        await eventsManager.upsert(data as JobEvent);
    };

    useEffect(() => {
        if (eventsManager.upsertStatus.success) {
            closeModal();
        }

    }, [closeModal, eventsManager.upsertStatus.success]);


    const default_size = "md";


    return (
        jobId ?
            <Form
                className="p-10 flex w-full flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl"
                onSubmit={onSubmit}
            >
                <Input
                    isRequired
                    label="Description"
                    aria-label="Description"
                    type="text"
                    name="description"
                    size={default_size}
                />

                <DatePicker
                    isRequired
                    label="Date of the event"
                    aria-label="Date of the event"
                    name="date_of_event"
                    size={default_size}
                    defaultValue={today(getLocalTimeZone())}
                />

                <div className="flex gap-2">
                    <Button
                        aria-label="Insert"
                        color="primary"
                        size={default_size}
                        radius={default_size}
                        type="submit"
                        isDisabled={eventsManager.upsertStatus.loading}
                    >{eventsManager.upsertStatus.loading ? "Inserting..." : "Insert"}
                    </Button>
                    <Button
                        aria-label="Reset"
                        size={default_size}
                        radius={default_size}
                        type="reset">
                        Reset
                    </Button>
                </div>

            </Form>
            :
            <p className="text-red-500">Job not found</p>
    );
}