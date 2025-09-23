import React from "react";
import Props from './props.types';
import {Chip} from "@heroui/react";

export default function StatusChip({
                                       color,
                                       label,
                                       icon,
                                       variant = 'solid'
                                   }: Props) {
    return (
        <div className="">
            <Chip
                className="capitalize"
                color={color}
                size="sm"
                variant={variant}
            >
                <div className="inline-flex gap-1 items-center align-middle">
                    {icon && icon}
                    {label}
                </div>
            </Chip>
        </div>
    );
};

