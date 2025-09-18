"use client";

import React, {useMemo, useState} from "react";
// import Props from './props.types';
// import styles from "./styles.module.scss";
import {
    Spinner,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem
} from "@heroui/react";
import {useAppInit} from "@contexts/modules/useAppInit";

export default function AppInitGate({children}: { children: React.ReactNode }) {
    const {
        state, message, error,
        // hasOrphans, orphans,
        // periods, selectedPeriodId,
        // actions
    } = useAppInit();
    // const [chosenPeriod, setChosenPeriod] = useState<string>(selectedPeriodId);

    const loading = useMemo(() => state !== "ready" && state !== "error", [state]);

    if (loading) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-3">
                <Spinner size="lg"/>
                <div className="text-default-500">{message}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-dvh flex flex-col items-center justify-center gap-4">
                <div className="text-danger-500 font-medium">Initialization error</div>
                <div className="text-default-500">{error}</div>
                <div className="text-default-400 text-sm">You can try to restart the app.</div>
            </div>
        );
    }

    return (
        <>
            {children}

            {/*<Modal isOpen={hasOrphans} isDismissable={false}>
                <ModalContent>
                    <ModalHeader>Fix orphan jobs</ModalHeader>
                    <ModalBody>
                        <p>Found {orphans.length} job(s) with missing or invalid period.</p>
                        <p>Select a period to assign them to:</p>
                        <Select
                            selectedKeys={chosenPeriod ? [chosenPeriod] : []}
                            onSelectionChange={(keys) => {
                                const val = Array.from(keys)[0] as string | undefined;
                                setChosenPeriod(val ?? "");
                            }}
                            placeholder="Choose a period"
                            disallowEmptySelection
                        >
                            {periods.map(p => (
                                <SelectItem key={p.id} value={p.id}>
                                    {"label" in p ? String(p.label) : p.id}
                                </SelectItem>
                            ))}
                        </Select>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="default" variant="flat" onPress={actions.skipFix}>
                            Skip for now
                        </Button>
                        <Button color="primary" isDisabled={!chosenPeriod}
                                onPress={() => chosenPeriod && actions.fixOrphansTo(chosenPeriod)}>
                            Assign {orphans.length} job(s)
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>*/}
        </>
    );
}
