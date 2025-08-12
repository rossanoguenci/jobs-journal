"use client"

import React, {useEffect, useRef, useState} from "react";
// import Props from './props.types';
import {Button, Input, Form} from "@heroui/react"
import style from "./style.module.scss";

import Icon from "@components/Icons";
import User from "@components/Settings/UserProfile/User";
import {useUserStore} from "@stores/useUserStore";
import {useGlobalSettingsContext} from "@contexts/GlobalSettingsContext";
import {useModal} from "@contexts/ModalContext";
import {addToast} from "@heroui/toast";
import {UserProfile} from "@shared-types/UserProfile";
import {allowedColors, HeroColor} from "@shared-types/HeroColor";
import getJsonDiff from "@utilities/getJsonDiff";
import {debugLog} from "@utilities/devLog";


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
    const {...userOptions} = useGlobalSettingsContext();

    const {uploadAvatar, deleteAvatar} = useGlobalSettingsContext();

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

        await userOptions.saveUserProfile(newUserData as UserProfile)
    };

    /**
     * Handles notifications and post-operation actions.
     * Displays toast messages for errors, warnings, and success states.
     * Closes modal and reloads user data after a successful profile update.
     */
    useEffect(() => {
        if (userOptions.userError || userOptions.userSuccess || warning) {
            addToast({
                title: userOptions.userError ? "Error" : warning ? "Warning" : "Success",
                description: userOptions.userError || warning || userOptions.userSuccess || "",
                color: userOptions.userError ? "danger" : warning ? "warning" : "success",
            });
        }

        if (userOptions.userSuccess) { //Updated
            debugLog("onSuccess: userOptions.success", userOptions.userSuccess);
            userOptions.userReload().then();
            closeModal();
        }

    }, [userOptions.userError, userOptions.userSuccess, warning, closeModal, user, userOptions]);

    return (
        <>
            <div className="relative flex justify-center w-full mt-6">
                <div className="relative group w-fit">
                    {/* Avatar (base layer) */}
                    <User variant="full" color={userColorSelector} iconOnly/>

                    {/* Hover overlay button (upload) */}
                    <button
                        onClick={uploadAvatar}
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-gray-500 bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Icon name="image" className="w-6 h-6 text-white"/>
                    </button>

                    {/* Delete button (top-right corner) */}
                    {avatarDataUrl && (
                        <button
                            onClick={deleteAvatar}
                            className="absolute -top-1 -right-1 z-20 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors duration-200"
                        >
                            <Icon name="delete" className="w-3 h-3"/>
                        </button>
                    )}
                </div>
            </div>


            <Form
                ref={formRef}
                className={style.container}
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
                                isLoading={userOptions.userLoading}
                                disabled={userOptions.userLoading}
                            >{userOptions.userLoading ? "Is updating..." : "Update"}
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
                                isLoading={userOptions.userLoading}
                                disabled={userOptions.userLoading}
                            >{userOptions.userLoading ? "Inserting..." : "Insert"}
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