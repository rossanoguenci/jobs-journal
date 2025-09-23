"use client"

import React, {useEffect, useState} from "react";
// import Props from './props.types';
import {Button, Form, Selection} from "@heroui/react"
import {useModal} from "@contexts/ModalContext";
import {Select, SelectItem} from "@heroui/select";
import jobStatusOptions from "@config/jobStatusOptions";
import {JobUpdate} from "@shared-types/JobUpdate";
import {toastWarning} from "@utilities/toast"
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";

export default function Component({data}: { data: null | JobUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState<Selection>(new Set([data?.status || ""]));
    const [warning, setWarning] = useState<string | null>(null);

    const {closeModal} = useModal(); //todo: check if this can be passed as a prop for future proofing the component
    const {jobsManager} = useGlobalSettingsContext();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const current_status: string = data?.status ?? "";
        const selected_status: string = Array.from(selectedStatus)[0].toString() ?? null;

        if (!selected_status || selected_status === current_status) {
            setWarning("Nothing to change."); //todo: replace with t()
            return;
        }

        await jobsManager.upsert({id: data!.id, status: selected_status}, {source:"user"});
    };

    useEffect(() => {
        if (warning) {
            toastWarning(warning)
        } else if (jobsManager.upsertStatus.success && closeModal) {
            closeModal();
        }

    }, [warning, closeModal, jobsManager.upsertStatus.success]);


    const default_size = "md";


    return (
        <Form
            className="p-10 flex w-full flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl"
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
                    disabled={jobsManager.upsertStatus.loading}
                >Update
                </Button>
                <Button
                    aria-label="Cancel"
                    size={default_size}
                    radius={default_size}
                    onPress={closeModal}
                    disabled={jobsManager.upsertStatus.loading}
                >Cancel
                </Button>
            </div>

        </Form>
    );
}