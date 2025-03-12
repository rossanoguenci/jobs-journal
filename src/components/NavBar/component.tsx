"use client";

import React from "react";

import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle, NavbarMenu, NavbarMenuItem, Link, Button, Avatar
} from "@heroui/react";

import {useActionContext} from "@components/ActionProvider";
// import {Avatar} from "@heroui/avatar";


export default function Component() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const {setActiveAction} = useActionContext();

    /*const menuItems = [
        "Insert Application",
    ];*/


    return (
        <Navbar isBordered onMenuOpenChange={setIsMenuOpen}>
            <NavbarContent>
                {<NavbarMenuToggle
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    className="sm:hidden"
                />}
                <NavbarBrand>
                    <div className="flex items-center justify-between flex-col">
                        <p className="font-bold text-inherit">Jobs Journal</p>
                        <p className="text-xs font-extralight text-inherit">- Alpha 1.0 -</p>
                    </div>
                </NavbarBrand>
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem>
                    <Button size="sm" color="default" onPress={() => setActiveAction("add_application")}>Add
                        application</Button>
                </NavbarItem>
                <NavbarItem>
                    <Avatar
                        isBordered
                        // as="button"
                        name="U"
                        size="sm"
                    />
                </NavbarItem>
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
