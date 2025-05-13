import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [

        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/styles/*.{sass,scss,css}",

        /*
        this caused SUDDENLY a lot of issues with tailwindcss,
        although it was working fine before and recommended by their installation guide.
        I will leave it here for now, but it might be a good idea to remove it.
        Developers' life is incredible!
        */
        // "./src/**/*.{js,ts,jsx,tsx,mdx}",

        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
        },
    },
    darkMode: "class",
    plugins: [heroui()],
}
