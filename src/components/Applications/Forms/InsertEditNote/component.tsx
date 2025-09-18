import React, {useEffect, useRef, useState} from "react";
import Props from './props.types';
import styles from "./styles.module.scss";
import {Form, Textarea, Button} from "@heroui/react";
import {useModal} from "@contexts/ModalContext";
import {JobUpdate} from "@shared-types/JobUpdate";
import {JobEntry} from "@shared-types/JobEntry";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {toastWarning} from "@utilities/toast";

export default function Component({data}: Props) {
    const [warning, setWarning] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();

    const {jobsManager} = useGlobalSettingsContext();

    /*On Submit*/
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const nativeEvent = e.nativeEvent as SubmitEvent;
        const submitter = nativeEvent.submitter;
        const action = submitter?.getAttribute('data-action');

        let note = "";

        if (action === "upsert") {

            const formData = Object.fromEntries(new FormData(e.currentTarget));

            const updates = Object.entries(formData).reduce((acc, [key, value]) => {
                if (value !== data[key as keyof JobEntry]) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, unknown>);

            if (Object.keys(updates).length === 0) {
                setWarning("Nothing to record");
                return;
            }

            note = updates.note as string;
        }

        if (action === "remove") {
            note = "";
        }

        await jobsManager.upsert({id: data.id, meta: {note}} as JobUpdate, {source: "user"});
    };

    useEffect(() => {
        if (warning) {
            toastWarning(warning);
            return;
        }
        if (jobsManager.upsertStatus.success) {
            closeModal();
        }
    }, [warning, closeModal, jobsManager.upsertStatus.success]);


    const default_size = "md";

    return (
        <Form
            ref={formRef}
            className={styles.container}
            onSubmit={onSubmit}
        >
            <Textarea
                isClearable
                name="note"
                label="Note for this job"
                placeholder="Enter a personal note here"
                defaultValue={data?.meta.note || ""}
            />

            <div className="flex gap-2">

                <Button
                    data-action="upsert"
                    aria-label={data?.meta.note ? "Update" : "Insert"}
                    color={data?.meta.note ? "warning" : "primary"}
                    size={default_size}
                    radius={default_size}
                    type="submit"
                    isDisabled={jobsManager.upsertStatus.loading}
                >{data?.meta.note ? "Update" : "Insert"}
                </Button>

                <Button
                    data-action="remove"
                    aria-label="Remove note"
                    color="danger"
                    size={default_size}
                    radius={default_size}
                    type="submit"
                    isDisabled={jobsManager.upsertStatus.loading}
                >Remove
                </Button>
            </div>
        </Form>
    );
}
