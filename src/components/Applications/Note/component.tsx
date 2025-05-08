import React from "react";
// import Props from './props.types';
import styles from "./styles.module.scss";

export default function Component({children}: { children: string }) {

    return (
        <div className={styles.container}>
            <h2 className="text-sm">Notes</h2>
            <div className={styles.text_note}>{children}</div>
        </div>
    );
}
