"use client"

import React from "react";
// import Props from "./props.types";
import styles from "./styles.module.scss";
import {Button} from "@heroui/react";

import { useModal } from './ModalContext';



export default function Component() {

    const { isOpen, content, closeModal } = useModal();

    if (!isOpen) return null;

    return (
        <div className={styles.container}>

            <div className={styles.children}>
                <div className={styles.close}>
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
