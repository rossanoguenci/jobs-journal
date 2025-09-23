import React from "react";
// import Props from './props.types';

export default function Component({children}: { children: string }) {

    return (
        <div className="mt-15 p-4 text-foreground container-bg rounded-xl">
            <h2 className="text-sm font-semibold">Notes</h2>
            <div className="mt-5 pl-7 pr-7 text-sm">{children}</div>
        </div>
    );
}
