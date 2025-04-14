"use client"

import React, {useState} from "react";
// import Props from './props.types';
import style from "./style.module.scss";
import {Button, Form, Selection} from "@heroui/react"
import {useModal} from "@components/GlobalModal/ModalContext";
import {Select, SelectItem} from "@heroui/select";
import jobStatusOptions from "@config/jobStatusOptions";
import {JobUpdate} from "@/types/JobUpdate";
import {useUpsertJob} from "@hooks/useUpsertJob";


type insertProps = {
    status: boolean;
    message: string;
}


export default function Component({data}: { data: null | JobUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState<Selection>(new Set([data?.status || ""]));
    const [queryResult, setQueryResult] = useState<insertProps>();
    const {closeModal} = useModal();
    const {upsertJob, loading} = useUpsertJob();


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const current_status: string = data?.status ?? "";
        const selected_status: string = Array.from(selectedStatus)[0].toString() ?? null;

        if (!selected_status || selected_status === current_status) {
            setQueryResult({status: false, message: "Nothing to change."});
            return;
        }

        const prepare_data: JobUpdate = {id: data!.id, status: selected_status};

        const result = await upsertJob(prepare_data);

        console.log("Result: ", result);

        if (result.status && closeModal) {
            closeModal();
        } else {
            setQueryResult(result);
        }
    };

    const default_size = "md";


    return (
        <Form
            className={style.container}
            onSubmit={onSubmit}
        >

            {/*todo: custom render in the future releases*/}
            <Select label="Select a new status"
                    selectedKeys={selectedStatus}
                    onSelectionChange={setSelectedStatus}
            >
                {Object.entries(jobStatusOptions).map(([key, {label, color, icon}]) => (
                    <SelectItem key={key} startContent={icon} className={`text-${color}`}>
                        {label}
                    </SelectItem>
                ))}
            </Select>

            <div className="flex gap-2">
                <Button
                    aria-label="Update"
                    color="warning"
                    size={default_size}
                    radius={default_size}
                    type="submit"
                    disabled={loading}
                >Update
                </Button>
                <Button
                    aria-label="Cancel"
                    size={default_size}
                    radius={default_size}
                    onPress={closeModal}
                    disabled={loading}
                >Cancel
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