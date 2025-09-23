"use client"

import React, {useEffect, useRef, useState} from "react";
// import Props from './props.types';
import {Button, Input, Form} from "@heroui/react"
import style from "./style.module.css";

import Icon from "@components/Icons";
import User from "@components/Settings/UserProfile/User";
import {useUserStore} from "@stores/useUserStore";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import {UserProfile} from "@shared-types/UserProfile";
import {allowedColors, HeroColor} from "@shared-types/HeroColor";
import getJsonDiff from "@utilities/getJsonDiff";
import {debugLog} from "@utilities/devLog";
import {toastWarning} from "@utilities/toast";


const default_size = "md";

/**
 * User profile editor component that allows creating new profiles or editing existing ones.
 * 
 * Features:
 * - Avatar management (upload, view, delete)
 * - Profile colour selection
 * - Name editing
 * - Form validation with toast notifications
 * 
 * Renders different UI based on whether the user exists (edit mode) or not (create mode).
 * Integrates with a modal system for display and dismissal.
 */
export default function Component() {
    const user = useUserStore((s) => s.user);
    const avatarDataUrl = useUserStore((s) => s.avatar);
    const {avatarManager, userManager} = useGlobalSettingsContext();

    const [warning, setWarning] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();

    const [userColorSelector, setUserColorSelector] = useState<HeroColor>((user?.color ?? "default") as HeroColor);

    /**
     * Handles form submission for user profile updates.
     * Compares form data with current user data to detect changes.
     * Shows warning if no changes are detected, otherwise saves profile.
     * 
     * @param e - Form submission event
     */
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const formData = Object.fromEntries(new FormData(e.currentTarget));

        const newUserData: Partial<UserProfile> = getJsonDiff(user as object, formData);

        if (user?.color != userColorSelector) {
            newUserData.color = userColorSelector;
        }

        debugLog('onSubmit: current user', user);
        debugLog('onSubmit: userForm', formData);
        debugLog('onSubmit: newUserData', newUserData);

        if (Object.keys(newUserData).length === 0) {
            debugLog("onSubmit: No changes detected");
            setWarning("No changes detected");
            return;
        }

        await userManager.saveUserProfile(newUserData as UserProfile)
    };

    /**
     * Handles warning notification and post-operation actions.
     * Displaying toast messages for errors and success states are managed globally.
     * Closes modal and reloads user data after a successful profile update.
     */
    useEffect(() => {
        if (warning) {
            toastWarning(warning)
        }else if (userManager.userSuccess) {
            closeModal();
        }
    }, [warning, closeModal, user, userManager.userSuccess]);

    return (
        <>
            <div className="relative flex justify-center w-full mt-6">
                <div className="relative group w-fit">
                    {/* Avatar (base layer) */}
                    <User variant="full" color={userColorSelector} iconOnly/>

                    {/* Hover overlay button (upload) */}
                    <button
                        onClick={avatarManager.uploadAvatar}
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-gray-500 bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Icon name="image" className="w-6 h-6 text-white"/>
                    </button>

                    {/* Delete button (top-right corner) */}
                    {avatarDataUrl && (
                        <button
                            onClick={avatarManager.deleteAvatar}
                            className="absolute -top-1 -right-1 z-20 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors duration-200"
                        >
                            <Icon name="delete" className="w-3 h-3"/>
                        </button>
                    )}
                </div>
            </div>


            <Form
                ref={formRef}
                className="p-10 flex w-full max-w-[1000px] flex-wrap md:flex-nowrap mb-7 gap-4 rounded-2xl"
                onSubmit={onSubmit}
            >

                {/*Colours*/}
                <div className="flex justify-between gap-2 w-full">
                    {allowedColors.map((color, key) => (
                        <Button
                            key={key}
                            isIconOnly
                            radius="full"
                            color={color}
                            variant={userColorSelector === color ? "solid" : "bordered"}
                            onPress={() => setUserColorSelector(color)}
                        />
                    ))}
                </div>


                {/*Required*/}
                <Input
                    isRequired
                    label="Name"
                    aria-label="Name"
                    name="name"
                    type="text"
                    size={default_size}
                    defaultValue={user?.name || ""}
                />

                <Input
                    // isRequired
                    label="Role (be available soon)"
                    aria-label="Role"
                    type="text"
                    name="role"
                    size={default_size}
                    // defaultValue={user?.role || ""}
                    isDisabled
                />

                {/*Actions*/}
                <div className="flex flex-wrap gap-2 w-full">
                    {user ?
                        <>
                            <Button
                                aria-label="Update"
                                color="warning"
                                size={default_size}
                                radius={default_size}
                                type="submit"
                                isLoading={userManager.userLoading}
                                disabled={userManager.userLoading}
                            >{userManager.userLoading ? "Is updating..." : "Update"}
                            </Button>

                            <Button
                                aria-label="Cancel"
                                size={default_size}
                                radius={default_size}
                                onPress={closeModal}
                            >Cancel
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                className="w-full"
                                aria-label="Insert"
                                color="primary"
                                size={default_size}
                                radius={default_size}
                                type="submit"
                                isLoading={userManager.userLoading}
                                disabled={userManager.userLoading}
                            >{userManager.userLoading ? "Inserting..." : "Insert"}
                            </Button>

                            <Button
                                className="w-full"
                                aria-label="Reset"
                                size={default_size}
                                radius={default_size}
                                type="reset"
                            >Reset fields
                            </Button>
                        </>
                    }
                </div>
            </Form>
        </>
    );
}