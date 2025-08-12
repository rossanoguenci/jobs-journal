"use client"

import React from "react";
import Props from './props.types';
import styles from "./styles.module.scss";

import {Avatar} from "@heroui/avatar";

import {HeroColor, isValidColor} from "@shared-types/HeroColor";
import {Skeleton} from "@heroui/skeleton";
import {useUserStore} from "@stores/useUserStore";

/**
 * User profile component that displays the user avatar and name.
 * Renders a user's avatar with optional loading state and name display.
 * 
 * @param props - Component properties
 * @param props.variant - Display style: "full", "compact", or "default"
 * @param props.iconOnly - When true, only shows the avatar without user info
 * @param props.as - Renders avatar as a button when set to "button"
 * @param props.size - Avatar size: "sm", "md", or "lg"
 * @param props.color - Custom avatar colour, overrides user's colour preference
 * @param props.className - Additional CSS class names
 */
export default function Component(props: Props) {
    const avatarDataUrl = useUserStore((s) => s.avatar);
    const user = useUserStore((s) => s.user);

    if (!user) return null;

    //todo: set the colour completely customised by the user in future releases
    const color = isValidColor(user?.color as HeroColor) ? user.color : "default";

    const customClassName = props.className ?? "";
    const style_variant = props.variant ? styles[props.variant] : "";

    return (
        <div className={`${styles.container} ${style_variant} ${customClassName}`}>

            <Skeleton
                className="rounded-full"
                isLoaded={avatarDataUrl !== undefined}
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
