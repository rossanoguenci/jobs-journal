import React, {useEffect, useRef, useState} from "react";
import Props from './props.types';
import styles from "./styles.module.scss";
import {Form, Textarea, Button} from "@heroui/react";
import {addToast} from "@heroui/toast";
import {useModal} from "@components/GlobalModal/ModalContext";
import {useUpsertJob} from "@hooks/useUpsertJob";
import {JobUpdate} from "@/types/JobUpdate";
import {JobEntry} from "@/types/JobEntry";

export default function Component({data}: Props) {
    const [warning, setWarning] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();
    const {upsertJob, loading, error, success} = useUpsertJob();


    /*On Submit*/
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const nativeEvent = e.nativeEvent as SubmitEvent;
        const submitter = nativeEvent.submitter;
        const action = submitter?.getAttribute('data-action');

        const noteUpdate: JobUpdate = {id: data.id, note: ""};

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

            noteUpdate.note = updates.note as string;
        }

        await upsertJob(noteUpdate);
    };

    useEffect(() => {
        if (error || success || warning) {
            addToast({
                title: error ? "Error" : warning ? "Warning" : "Success",
                description: error || warning || success || "",
                color: error ? "danger" : warning ? "warning" : "success",
            });
        }

        if (success) { //Updated
            closeModal();
        }

    }, [error, success, warning, closeModal]);


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
                defaultValue={data?.note || ""}
            />

            <div className="flex gap-2">

                <Button
                    data-action="upsert"
                    aria-label={data?.note ? "Update" : "Insert"}
                    color={data?.note ? "warning" : "primary"}
                    size={default_size}
                    radius={default_size}
                    type="submit"
                    isDisabled={loading}
                >{data?.note ? "Update" : "Insert"}
                </Button>

                <Button
                    data-action="remove"
                    aria-label="Remove note"
                    color="danger"
                    size={default_size}
                    radius={default_size}
                    type="submit"
                    isDisabled={loading}
                >Remove
                </Button>
            </div>
        </Form>
    );
}
