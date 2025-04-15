"use client"

import React, {useEffect, useState} from "react";
// import Props from './props.types';
import style from "./style.module.scss";
import {Button, Form, Selection} from "@heroui/react"
import {useModal} from "@components/GlobalModal/ModalContext";
import {Select, SelectItem} from "@heroui/select";
import jobStatusOptions from "@config/jobStatusOptions";
import {JobUpdate} from "@/types/JobUpdate";
import {useUpsertJob} from "@hooks/useUpsertJob";
import {addToast} from "@heroui/toast";

export default function Component({data}: { data: null | JobUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState<Selection>(new Set([data?.status || ""]));
    const [warning, setWarning] = useState<string | null>(null);
    const {closeModal} = useModal();
    const {upsertJob, error, success, loading} = useUpsertJob();


    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const current_status: string = data?.status ?? "";
        const selected_status: string = Array.from(selectedStatus)[0].toString() ?? null;

        if (!selected_status || selected_status === current_status) {
            setWarning("Nothing to change.");
            return;
        }

        await upsertJob({id: data!.id, status: selected_status});
    };

    useEffect(() => {
        let toastConfig;

        if (success && closeModal) {
            toastConfig = {
                title: "Success",
                description: success,
                color: "success" as const,
            };
            closeModal();
        } else if (error) {
            toastConfig = {
                title: "Error",
                description: error,
                color: "danger" as const,
            };
        } else if (warning) {
            toastConfig = {
                title: "Warning",
                description: warning,
                color: "warning" as const,
            };
        }

        if (toastConfig) {
            addToast(toastConfig);
        }
    }, [warning, success, error, closeModal]);


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
                {jobStatusOptions.map(({key, label, color, icon}) => (
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

        </Form>
    );
}