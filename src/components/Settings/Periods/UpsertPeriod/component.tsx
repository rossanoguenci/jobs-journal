import React, {useEffect, useRef, useState} from "react";

import Props from './props.types';
import styles from "./styles.module.scss";
import {Button} from "@heroui/button";
import {Form} from "@heroui/form";
import {DateValue, getLocalTimeZone, parseDate, today} from "@internationalized/date";
import {DatePicker} from "@heroui/date-picker";
import {JobPeriod} from "@shared-types/JobPeriod";
import getJsonDiff from "@utilities/getJsonDiff";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import {addToast} from "@heroui/toast";
import Icon from "@components/Icons/component";

const default_size = "md";
export default function Component({jobPeriodItem, onClose}: Props) {
    const {closeModal} = useModal();

    const {jobPeriodsManager} = useGlobalSettingsContext();

    const [startDate] = useState<DateValue>(jobPeriodItem?.start ? parseDate(jobPeriodItem.start) : today(getLocalTimeZone()));
    const [endDate, setEndDate] = useState<DateValue | null>(jobPeriodItem?.end ? parseDate(jobPeriodItem.end) : null);

    const isNew: boolean = !jobPeriodItem?.id;

    const formRef = useRef<HTMLFormElement>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(e.currentTarget));
        const newData: Partial<JobPeriod> = jobPeriodItem ? getJsonDiff(jobPeriodItem as object, formData) : formData;

        if (!isNew) {
            newData.id = jobPeriodItem!.id;
        }

        await jobPeriodsManager.upsertJobPeriod(newData as JobPeriod)
    }

    useEffect(() => {
        if (!isNew) return;

        if (jobPeriodsManager.jobPeriodsError ||
            jobPeriodsManager.jobPeriodsSuccess
        ) {
            addToast({
                title: jobPeriodsManager.jobPeriodsError ? "Error" : "Success",
                description: jobPeriodsManager.jobPeriodsError || jobPeriodsManager.jobPeriodsSuccess,
                color: jobPeriodsManager.jobPeriodsError ? "danger" : "success",
            });
        }

        if (jobPeriodsManager.jobPeriodsSuccess) {
            jobPeriodsManager.clearMessages();
            (onClose ?? closeModal)();
        }

    }, [closeModal, isNew, jobPeriodsManager, jobPeriodsManager.jobPeriodsError, jobPeriodsManager.jobPeriodsSuccess, onClose]);


    return (
        <Form className={styles.container} onSubmit={onSubmit} ref={formRef}>

            <DatePicker
                isRequired
                label="Start date"
                aria-label="Start date"
                name="start"
                size={default_size}
                defaultValue={startDate}
            />

            <DatePicker
                label="End date"
                aria-label="End date"
                name="end"
                size={default_size}
                // selectorButtonPlacement="start"
                value={endDate}
                onChange={setEndDate}
                endContent={
                    endDate ? (
                        <Button
                            as="span"
                            isIconOnly
                            variant="light"
                            onPress={() => setEndDate(null)}
                            aria-label="Clear date"
                        >
                            <Icon name="close"/>
                        </Button>
                    ) : null
                }
            />

            {isNew ?
                <>
                    <p className="text-tiny">The new period will be selected automatically after being
                        created</p>
                    <Button type={"submit"} color="warning">Create</Button>
                </> :
                <div className="flex gap-2">
                    <Button type={"submit"} color="warning">Update</Button>
                    <Button type={"button"}
                            onPress={onClose ?? undefined}
                            isDisabled={!onClose}
                    >Return to the list
                    </Button>
                </div>
            }

        </Form>
    );
}
