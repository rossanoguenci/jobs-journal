"use client";

import React from "react";

import {
    Navbar, NavbarBrand, NavbarContent, /*NavbarItem, NavbarMenuToggle, Button,*/ Avatar
} from "@heroui/react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/dropdown";
import Icon from "@components/Icons";
import {HeroColor} from "@shared-types/HeroColor";
import {useUserStore} from "@stores/useUserStore";
// import {useRouter} from "next/navigation";


/*const menuItems = [
        "Insert Application",
    ];*/

export default function Component() {
    const user = useUserStore((s) => s.user);
    const avatarDataUrl = useUserStore((s) => s.avatar);

    return (
        <Navbar isBordered>
            <NavbarContent>

                <NavbarBrand>
                    <div className="flex items-center justify-between flex-col">
                        <p className="font-bold text-inherit">Jobs Journal</p>
                    </div>
                </NavbarBrand>
            </NavbarContent>

            {/*Dropdown menu*/}
            <NavbarContent as="div" justify="end">
                <Dropdown placement="bottom-end" backdrop="blur">
                    <DropdownTrigger>

                        <Avatar
                            src={avatarDataUrl ?? undefined}
                            isBordered
                            as="button"
                            name={user?.name}
                            size="sm"
                            color={user?.color as HeroColor}
                        />

                        {/*
                        //Cannot use the user component as a trigger for now because a known issue with the dropdown menu
                        <User size="sm" iconOnly as="button"/>
                        */}

                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Profile Actions"
                        variant="flat"
                    >

                        <DropdownItem
                            key="user" className="h-14 gap-2 cursor-default" isReadOnly>
                            <p className="font-semibold">Hey {user?.name ? user.name : "there"} 👋</p>
                        </DropdownItem>

                        <DropdownItem key="profile_settings" startContent={<Icon name="jobsList" className="size-4"/>}
                                      href="/">Jobs
                            list</DropdownItem>

                        <DropdownItem key="settings" startContent={<Icon name="settings" className="size-4"/>}
                                      href="/settings/">App
                            Settings</DropdownItem>

                        {/*<DropdownItem key="analytics">Analytics</DropdownItem>*/}

                        {/*<DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>*/}

                        <DropdownItem key="about" href="/about/" startContent={<Icon name="info" className="size-4"/>}>About
                            & Legal</DropdownItem>

                    </DropdownMenu>
                </Dropdown>
            </NavbarContent>

            {/*
            <NavbarMenu>
                {menuItems.map((item, index) => (
                    <NavbarMenuItem key={`${item}-${index}`}>
                        <Link
                            className="w-full"
                            href="#"
                            size="lg"

                        >
                            {item}
                        </Link>
                    </NavbarMenuItem>
                ))}
            </NavbarMenu>*/
            }


        </Navbar>
    );
}
