"use client"

import React from "react";
import Props from './props.types';

import {Avatar} from "@heroui/avatar";

import {HeroColor, isValidColor} from "@shared-types/HeroColor";
import {Skeleton} from "@heroui/skeleton";
import {useUserStore} from "@stores/useUserStore";
import { vcn } from "./variants";

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
    const variant = props.variant ?? "default";

    return (
        <div className={vcn("container", variant, customClassName)}>

            <Skeleton
                className="rounded-full"
                isLoaded={avatarDataUrl !== undefined}
            >
                <Avatar
                    color={(props.color ?? (color as HeroColor))}
                    src={avatarDataUrl ?? undefined}
                    className={vcn("avatar", variant)}
                    isBordered
                    showFallback
                    as={props.as}
                    size={props.size}
                />
            </Skeleton>

            {!props.iconOnly && (
                <ul className={vcn("user_info", variant)}>
                    <li className={vcn("user_info_name", variant)}>{user.name}</li>
                    {/* <li className={vcn("user_info_role", variant)}>User role</li> */}
                </ul>
            )}

        </div>
    );
}
