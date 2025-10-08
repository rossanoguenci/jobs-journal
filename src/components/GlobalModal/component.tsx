"use client"

import React, {useEffect} from "react";
// import Props from "./props.types";
import {Button} from "@heroui/react";
import {useModal} from '@contexts/ModalContext';
import {infoLog} from "@utilities/devLog";

export default function Component() {

    const {...hook} = useModal();

    useEffect(() => {
        infoLog("GlobalModal - isOpen", hook.isOpen);
    }, [hook.isOpen]);

    if (!hook.isOpen) return null;

    return (
        <div className="absolute size-full top-0 left-0 flex justify-center sm:items-center z-10 bg-overlay/30 backdrop-saturate-150 backdrop-blur-sm">

            <div className="border-3 border-gray-700 rounded-xl w-full sm:max-w-sm text-foreground container-bg">
                {hook.isCloseButtonVisible && (
                    <div className="mt-2 ml-2">
                        <Button
                            aria-label="Close modal"
                            className="opacity-75"
                            // isIconOnly
                            color="default"
                            variant="light"
                            // radius="full"
                            size="sm"
                            onPress={hook.closeModal}
                        >Close</Button>
                    </div>
                )}
                {hook.content}
            </div>
        </div>
    );
}
