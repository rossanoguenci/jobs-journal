import React from "react";
import Props from './props.types';
import styles from "./styles.module.scss";
import {Chip} from "@heroui/react";

export default function StatusChip({
                                       color,
                                       label,
                                       icon,
                                       variant = 'solid'
                                   }: Props) {
    return (
        <div className={styles.container}>
            <Chip
                className="capitalize"
                color={color}
                size="sm"
                variant={variant}
            >
                <div className="inline-flex gap-1 items-center">
                    {icon && icon}
                    {label}
                </div>
            </Chip>
        </div>
    );
};

