import React, {useState} from "react";
import {Select, SelectItem} from "@heroui/select";
import {Selection} from "@heroui/react";
import dateFormat from "@utilities/dateFormat";
import {JobPeriod} from "@shared-types/JobPeriod";

export interface PeriodSelectProps {
    data: JobPeriod[] | null;
    value?: JobPeriod["id"] | null; // controlled selected id
    defaultValue?: JobPeriod["id"]; // uncontrolled initial id
    onChange?: (selectedId: JobPeriod["id"]) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    getOptionLabel?: (p: JobPeriod) => string;
}

export default function PeriodSelect({
                                         data,
                                         value,
                                         defaultValue,
                                         onChange,
                                         label = "Periods available",
                                         placeholder = "Select a period",
                                         disabled,
                                         getOptionLabel = (p) => `${dateFormat(p.start)} - ${p.end ? dateFormat(p.end) : "present"}`,
                                     }: PeriodSelectProps) {
    const [internal, setInternal] = useState<PeriodSelectProps["value"]>(() => {
        if (value !== undefined) return value; // if controlled, seed with value
        return defaultValue ?? (data && data.length > 0 ? data[0].id : "");
    });

    // Keep internal selection consistent if data changes (only for uncontrolled)
    React.useEffect(() => {
        if (value !== undefined) return;
        if (!data || data.length === 0) {
            setInternal("");
            return;
        }
        if (!data.some(p => p.id === internal)) {
            setInternal(data[0].id);
        }
    }, [data, value, internal]);

    const selected = value !== undefined ? value : internal;
    const hasData = !!data && data.length > 0;

    const handleSelectionChange = (keys: Selection) => {
        if (keys === "all") return;
        const first = keys.values().next().value as string | undefined;
        if (!first) return;
        if (value === undefined) setInternal(first);
        onChange?.(first);
    };

    return (
        <Select
            label={selected ? "Selected period" : label}
            placeholder={placeholder}
            isRequired={hasData}
            isDisabled={disabled || !hasData}
            selectedKeys={selected ? new Set([selected]) : new Set()}
            onSelectionChange={handleSelectionChange}
        >
            {(data ?? []).map((item) => (
                <SelectItem key={item.id}>{getOptionLabel(item)}</SelectItem>
            ))}
        </Select>
    );
}
