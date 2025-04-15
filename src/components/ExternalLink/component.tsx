"use client"

import React from "react";
import styles from "./styles.module.scss";
import { openUrl } from "@tauri-apps/plugin-opener";

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children: React.ReactNode;
    className?: string;
}

const ExternalLink = React.forwardRef<HTMLAnchorElement, ExternalLinkProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <a
                ref={ref}
                className={`${styles} ${className}`}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
                onClick={(e) => {
                    e.preventDefault();
                    void openUrl(props.href);
                }}
            >
                {children}
            </a>
        );
    }
);
// Add display name to fix the ESLint warning
ExternalLink.displayName = "ExternalLink";

export default ExternalLink;