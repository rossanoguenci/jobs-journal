import React from "react";
import Props from './props.types';
import styles from "./styles.module.scss";

import {Avatar} from "@heroui/avatar";

export default function Component({data}: Props) {
    if (!data) return null;

    return (
        <div className={styles.container}>

            <Avatar
                className={styles.avatar}
                isBordered
                showFallback
                // as="button"
                color="default" //todo: get user color from context
            />

            <ul className={styles.user_info}>
                <li className={styles.user_info_name}>{data.name}</li>
                {/*<li className={styles.user_info_role}>User role</li>*/}
            </ul>


        </div>
    );
}
