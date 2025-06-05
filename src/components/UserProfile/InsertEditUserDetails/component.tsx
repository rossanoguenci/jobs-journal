"use client"

import React, {useEffect, useRef, useState} from "react";
// import Props from './props.types';
import style from "./style.module.scss";

import {Button, Input, Form} from "@heroui/react"

import {useModal} from "@components/GlobalModal/ModalContext";
import {addToast} from "@heroui/toast";
import {debugLog} from "@utilities/devLog";
import {useUserContext} from "@contexts/UserContext";
import User from "@components/UserProfile/User";
import {UserProfile} from "@/types/UserProfile";
import {allowedColors, HeroColor} from "@/types/HeroColor";
import getJsonDiff from "@utilities/getJsonDiff";
import {useSubmitWithStatus} from "@hooks/useSubmitWithStatus";
import Icon from "@components/Icons";

export default function Component() {
    const {user, saveUser, uploadAvatar, deleteAvatar, avatarDataUrl} = useUserContext();

    const {...useSubmit} = useSubmitWithStatus(saveUser);

    const [warning, setWarning] = useState<string | null>(null);

    const formRef = useRef<HTMLFormElement>(null);
    const {closeModal} = useModal();

    const [userColorSelector, setUserColorSelector] = useState<HeroColor>((user?.color ?? "default") as HeroColor);

    /*On Submit*/
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setWarning(null);

        const formData = Object.fromEntries(new FormData(e.currentTarget));

        const newUserData: Partial<UserProfile> = getJsonDiff(user as object, formData);

        if (user?.color != userColorSelector) {
            newUserData.color = userColorSelector;
        }

        debugLog('current user', user);
        debugLog('userForm', formData);

        if (Object.keys(newUserData).length === 0) {
            setWarning("No changes detected");
            return;
        }

        await useSubmit.submit(newUserData as UserProfile);

    };

    useEffect(() => {
        if (useSubmit.error || useSubmit.success || warning) {
            addToast({
                title: useSubmit.error ? "Error" : warning ? "Warning" : "Success",
                description: useSubmit.error || warning || useSubmit.success || "",
                color: useSubmit.error ? "danger" : warning ? "warning" : "success",
            });
        }

        if (useSubmit.success) { //Updated
            closeModal();
        }

    }, [useSubmit.error, useSubmit.success, warning, closeModal]);


    const default_size = "md";

    return (
        <>
            <div className="relative flex justify-center w-full mt-6">
                <div className="relative group w-fit">
                    {/* Avatar (base layer) */}
                    <User variant="full" color={userColorSelector} iconOnly />

                    {/* Hover overlay button (upload) */}
                    <button
                        onClick={uploadAvatar}
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-full bg-gray-500 bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <Icon name="image" className="w-6 h-6 text-white" />
                    </button>

                    {/* Delete button (top-right corner) */}
                    {avatarDataUrl && (
                        <button
                            onClick={deleteAvatar}
                            className="absolute -top-1 -right-1 z-20 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors duration-200"
                        >
                            <Icon name="delete" className="w-3 h-3" />
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
                                isLoading={useSubmit.loading}
                                disabled={useSubmit.loading}
                            >{useSubmit.loading ? "Is updating..." : "Update"}
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
                                isLoading={useSubmit.loading}
                                disabled={useSubmit.loading}
                            >{useSubmit.loading ? "Inserting..." : "Insert"}
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