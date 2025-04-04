import React from "react";
import Props from "./props.types";
import styles from "./styles.module.scss";
import {Button} from "@heroui/react";
import {ModalProvider} from "@components/Modal/provider";

export default function Component({children, isOpen = true, onClose}: Props) {
    return isOpen ? (
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
                        onPress={onClose}
                    >Close</Button></div>
                <ModalProvider onClose={onClose}>{children}</ModalProvider>
            </div>
        </div>
    ) : null;
}
