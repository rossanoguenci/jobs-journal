import React, {useEffect, useState} from "react";
import {PeriodSelectorForm, UpsertPeriod} from "@components/Settings/Periods";
import {useJobPeriodsStore} from "@stores/useJobPeriodsStore";
import {addToast} from "@heroui/toast";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";

export default function Component() {
    const {...store} = useJobPeriodsStore();
    const {jobPeriodsManager} = useGlobalSettingsContext();
    const {closeModal} = useModal();

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editId, setEditId] = useState<string | undefined>(store.selectedJobPeriodId || undefined);

    useEffect(() => {
        if (jobPeriodsManager.jobPeriodsError || jobPeriodsManager.jobPeriodsSuccess) {
            addToast({
                title: jobPeriodsManager.jobPeriodsError ? "Error" : "Success",
                description: jobPeriodsManager.jobPeriodsError || jobPeriodsManager.jobPeriodsSuccess || "",
                color: jobPeriodsManager.jobPeriodsError ? "danger" : "success",
            });
        }

        if (jobPeriodsManager.jobPeriodsSuccess) {
            jobPeriodsManager.clearMessages();
            closeModal();
        }
    }, [closeModal, jobPeriodsManager, jobPeriodsManager.jobPeriodsError, jobPeriodsManager.jobPeriodsSuccess]);

    return (
        <>
            {isEditing ? (
                <UpsertPeriod jobPeriodItem={store.getJobPeriodItem(editId || "")} onClose={() => setIsEditing(false)} />
            ) : (
                <>
                    {!store.selectedJobPeriodId && (
                        <div className="text-tiny text-center w-full">
                            <p className="text-danger font-bold">No period set</p>
                            <p>Please choose one from the list</p>
                        </div>
                    )}
                    <PeriodSelectorForm
                        data={store.jobPeriodsList}
                        value={store.selectedJobPeriodId}
                        onChange={store.setSelectedJobPeriodId}
                        onSubmit={async (id) => {
                            await jobPeriodsManager.setSelectedJobPeriod(id);
                        }}
                        onEditClick={(id) => {
                            setEditId(id);
                            setIsEditing(true);
                        }}
                        submitLabel="Select"
                    />
                </>
            )}
        </>
    );
}
