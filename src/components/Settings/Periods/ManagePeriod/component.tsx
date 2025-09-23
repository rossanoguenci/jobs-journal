import React, {useCallback, useEffect, useState} from "react";
import {Form} from "@heroui/form";
import {Select, SelectItem} from "@heroui/select";
import {Selection} from "@heroui/react";
import dateFormat from "@utilities/dateFormat";
import {Button} from "@heroui/button";
import {UpsertPeriod} from "@components/Settings/Periods";
import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import {debugLog} from "@utilities/devLog";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {JobPeriod} from "@shared-types/JobPeriod";
import {addToast} from "@heroui/toast";
import {useModal} from "@contexts/ModalContext";

export default function Component() {
    const {...store} = useJobPeriodsStore();
    const {jobPeriodsManager} = useGlobalSettingsContext();
    const {closeModal} = useModal();

    //This is for the select to keep track of the selected period from the user, not from the store, especially for the editing mode
    const [selectedId, setSelectedId] = useState<JobPeriod["id"]>(
        store.selectedJobPeriodID ??
        (store.jobPeriodsList && store.jobPeriodsList.length > 0 ? store.jobPeriodsList[0].id : "") ??
        ""
    );
    const [isEditing, setIsEditing] = useState<boolean>(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        await jobPeriodsManager.setSelectedJobPeriod(selectedId)
    }

    const onSelectionChange = useCallback((keys: Selection) => {
        debugLog("On selection change", keys)
        if (keys === "all") return; //not applicable here, but part of the union type

        const first = keys.values().next().value as string | undefined;
        debugLog("first", first)

        if (first) setSelectedId(first);
    }, []);

    useEffect(() => {

        debugLog("useEffect() Selected id", selectedId)
        debugLog("useEffect() list", store.jobPeriodsList)

        if (jobPeriodsManager.jobPeriodsError ||
            jobPeriodsManager.jobPeriodsSuccess
        ) {
            addToast({
                title: jobPeriodsManager.jobPeriodsError ? "Error" : "Success",
                description: jobPeriodsManager.jobPeriodsError || jobPeriodsManager.jobPeriodsSuccess || "",
                color: jobPeriodsManager.jobPeriodsError ? "danger" : "success",
            });
        }

        if (jobPeriodsManager.jobPeriodsSuccess) {
            jobPeriodsManager.clearMessages()
            closeModal()
        }


    }, [closeModal, jobPeriodsManager, jobPeriodsManager.jobPeriodsError, jobPeriodsManager.jobPeriodsSuccess, selectedId, store.jobPeriodsList])

    return (
        <>
            {isEditing ? (
                <UpsertPeriod jobPeriodItem={store.getJobPeriodItem(selectedId)} onClose={() => setIsEditing(false)}/>
            ) : (
                <Form className="p-10 flex w-full flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl"
                      onSubmit={onSubmit}
                >
                    {!store.selectedJobPeriodID &&
                        <div className="text-tiny text-center w-full"><p className="text-danger font-bold">No period
                            set</p><p>Please choose one from the list</p></div>
                    }

                    <Select
                        label={store.selectedJobPeriodID ? "Selected period" : "Periods available"}
                        placeholder="Select a period"
                        isRequired
                        selectedKeys={new Set([selectedId])}
                        onSelectionChange={onSelectionChange}
                    >
                        {store.jobPeriodsList && store.jobPeriodsList.map((item) => (
                            <SelectItem key={item.id}>
                                {`${dateFormat(item.start)} - ${item.end ? dateFormat(item.end) : "present"}`}
                            </SelectItem>
                        ))}
                    </Select>

                    <div className="flex gap-2">
                        <Button color="warning"
                                type="submit"
                                isDisabled={selectedId === store.selectedJobPeriodID}
                        >Select</Button>
                        <Button color="default"
                                onPress={() => setIsEditing(true)}
                                isDisabled={!selectedId}
                        >Edit</Button>
                    </div>
                </Form>
            )}
        </>
    );
}
