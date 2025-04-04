import React from "react";
import {IconSvgProps} from "./IconSvgProps.type";

export const Company = (props: IconSvgProps) => {
    return (
        <svg aria-hidden="true"
             fill="white" //todo: fix this with stylesheet var
             focusable="false"
             height="1em"
             role="presentation"
             viewBox="0 0 20 20"
             width="1em"
             {...props}>
            <path
                d="M19 2H9c-1.103 0-2 .897-2 2v6H5c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zM5 12h6v8H5v-8zm14 8h-6v-8c0-1.103-.897-2-2-2H9V4h10v16z"></path>
            <path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 .001h2v2H7z"></path>
        </svg>
    );
};