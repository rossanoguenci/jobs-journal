import React from "react";
import Props from "./props.types";
import {Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@heroui/dropdown";
import {Button} from "@heroui/react";

export default function JobActionsDropdown({actions, icon, triggerSize = "lg", variant = "light"}: Props) {
    const mainActions = actions.filter(action => action.section !== "danger");
    const dangerActions = actions.filter(action => action.section === "danger");

    return (
        <Dropdown backdrop="blur">
            <DropdownTrigger>
                <Button
                    aria-label="Open actions"
                    color="default"
                    variant={variant}
                    size={triggerSize}
                    isIconOnly
                    className="text-xl"
                >
                    {icon}
                </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Actions dropdown menu" variant="faded">
                {mainActions.length > 0 ? (
                    <DropdownSection aria-label="Actions" showDivider={dangerActions.length > 0}>
                        {mainActions.map(action => (
                            <DropdownItem
                                key={action.key}
                                startContent={<i className={action.icon}/>}
                                color={action.color}
                                onPress={action.onClick}
                            >
                                {action.label}
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                ) : null}

                {dangerActions.length > 0 ? (
                    <DropdownSection aria-label="Danger zone">
                        {dangerActions.map(action => (
                            <DropdownItem
                                key={action.key}
                                startContent={<i className={action.icon}/>}
                                className={`text-${action.color}`}
                                color={action.color}
                                onPress={action.onClick}
                            >
                                {action.label}
                            </DropdownItem>
                        ))}
                    </DropdownSection>
                ) : null}
            </DropdownMenu>
        </Dropdown>
    );
}