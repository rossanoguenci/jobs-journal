"use client"

import React from "react";
// import Props from "./props.types";
import {Button} from "@heroui/react";
import { useModal } from '@contexts/ModalContext';

export default function Component() {

    const { isOpen, content, closeModal } = useModal();

    if (!isOpen) return null;

    return (
        <div className="absolute size-full top-0 left-0 flex justify-center sm:items-center z-10 bg-overlay/30 backdrop-saturate-150 backdrop-blur-sm">

            <div className="border-3 border-gray-700 rounded-xl w-full sm:max-w-sm text-foreground container-bg">
                <div className="mt-2 ml-2">
                    <Button
                        aria-label="Close modal"
                        className="opacity-75"
                        // isIconOnly
                        color="default"
                        variant="light"
                        // radius="full"
                        size="sm"
                        onPress={closeModal}
                    >Close</Button></div>
                {content}
            </div>
        </div>
    );
}
