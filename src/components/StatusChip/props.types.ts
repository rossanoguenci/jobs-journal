import {ChipProps} from "@heroui/react";
export default interface Props {
    color: ChipProps['color'];
    label: string;
    icon?: React.ReactNode;
    variant?: 'solid' | 'bordered';
}
