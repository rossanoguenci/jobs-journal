import React from "react";
import Props from './props.types';
import Icon from "@components/Icons/component";
import {Button} from "@heroui/button";
import {useRouter} from "next/navigation";

export default function Component(props: Props) {

    const router = useRouter();
    const defaultTitle = 'Back';
    const defaultIcon = 'arrowBack';
    const defaultOnPress = () => router.back();

    return (
        <Button
            className="mb-5"
            onPress={props.onPress ?? defaultOnPress}
            size="sm" variant="flat" color="default"
        >
            <Icon name={defaultIcon}/> {props.title ?? defaultTitle}
        </Button>
    );
}
