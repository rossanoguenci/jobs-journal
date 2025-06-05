import React from "react";
import Props from './props.types';
import styles from "./styles.module.scss";
import Icon from "@components/Icons/component";
import {Button} from "@heroui/button";
import {useRouter} from "next/navigation";

export default function Component({title}: Props) {

    const router = useRouter();

    return (
        <Button className={styles.container} onPress={() => router.back()} size="sm" variant="flat" color="default">
            <Icon name="arrowBack"/> {title}
        </Button>
    );
}
