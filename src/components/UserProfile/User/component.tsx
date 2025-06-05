import React from "react";
import Props from './props.types';
import styles from "./styles.module.scss";

import {Avatar} from "@heroui/avatar";

import {HeroColor, isValidColor} from "@/types/HeroColor";
import {useUserContext} from "@contexts/UserContext";
import {Skeleton} from "@heroui/skeleton";

export default function Component(props: Props) {
    const {user, avatarDataUrl, avatarLoading} = useUserContext();

    if (!user) return null;

    //todo: set the colour completely customised by the user in future releases
    const color = isValidColor(user?.color as HeroColor) ? user.color : "default";

    const customClassName = props.className ?? "";
    const style_variant = props.variant ? styles[props.variant] : "";

    return (
        <div className={`${styles.container} ${style_variant} ${customClassName}`}>

            <Skeleton
                className="rounded-full"
                isLoaded={!avatarLoading}
            >
                <Avatar
                    color={props.color ?? color as HeroColor}
                    src={avatarDataUrl ?? undefined}
                    className={`${styles.avatar} ${style_variant}`}
                    isBordered
                    showFallback
                    as={props.as}
                    size={props.size}
                />
            </Skeleton>

            {!props.iconOnly &&
                <ul className={`${styles.user_info} ${style_variant}`}>
                    <li className={`${styles.user_info_name} ${style_variant}`}>{user.name}</li>
                    {/*<li className={`${styles.user_info_role} ${style_variant}`}>User role</li>*/}
                </ul>
            }

        </div>
    );
}
