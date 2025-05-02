"use client"

import React, {useEffect} from "react";
// import Props from './props.types';
import style from "./style.module.scss";
import {Button, DatePicker, Input, Form,} from "@heroui/react"
import {getLocalTimeZone, today} from "@internationalized/date";
import {useModal} from "@components/GlobalModal/ModalContext";
import useInsertJobEvent from "@hooks/useInsertJobEvent";
import {addToast} from "@heroui/toast";
import {JobEvent} from "@/types/JobEvent";


export default function Component({jobId}: { jobId: string }) {
    const {success, error, loading, insertEvent} = useInsertJobEvent();
    const {closeModal} = useModal();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const data: Record<string, unknown> = {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            job_id: jobId,
        };

        await insertEvent(data as JobEvent);
    };

    useEffect(() => {
        if (error || success) {
            addToast({
                title: error ? "Error" : "Success",
                description: error || success || "",
                color: error ? "danger" : "success",
            });
        }

        if (success) {
            closeModal();
        }

    }, [error, success, closeModal]);


    const default_size = "md";


    return (
        <Form
            className={style.container}
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
                    isDisabled={loading}
                >{loading ? "Inserting..." : "Insert"}
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
    );
}