"use client";

import React from "react";

import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, Button, Avatar
} from "@heroui/react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/dropdown";
import {useRouter} from "next/navigation";

// import {useActionContext} from "@components/ActionProvider";
// import {Avatar} from "@heroui/avatar";


export default function Component() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // const {setActiveAction} = useActionContext();

    /*const menuItems = [
        "Insert Application",
    ];*/


    return (
        <Navbar isBordered onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent>

                {/*<NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />*/}

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
                            isBordered
                            as="button"
                            name="U"
                            size="sm"
                        />
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Profile Actions"
                        variant="flat"
                    >

                        <DropdownItem
                            key="user" className="h-14 gap-2 cursor-default" isReadOnly>
                            <p className="font-semibold">Hey there 👋</p>
                        </DropdownItem>

                        <DropdownItem key="profile_settings" startContent={<i className="bx bxs-briefcase"/>} href="/">Jobs list</DropdownItem>

                        {/*<DropdownItem key="profile_settings">My Profile</DropdownItem>*/}

                        <DropdownItem key="settings" startContent={<i className="bx bxs-cog"/>} href="/settings/">App
                            Settings</DropdownItem>

                        {/*<DropdownItem key="analytics">Analytics</DropdownItem>*/}

                        {/*<DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>*/}

                        <DropdownItem key="about" href="/about/" startContent={<i className="bx bxs-info-circle"/>}>About & Legal</DropdownItem>

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
            </NavbarMenu>*/}


        </Navbar>
    );
}
