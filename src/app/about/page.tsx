import React from 'react';

export default function AboutPage() {

    return (
        <main className="wrapper">
            <section className="container">
                <h1 className="text-2xl font-bold mb-2">About This App</h1>
                <p>
                    This app is a local job journal to help you keep track of your job applications. It runs fully
                    offline using Tauri and stores your data locally with SQLite.
                </p>
                <ul className="flex items-center flex-wrap gap-5 mt-3">
                    <li className="flex items-center gap-2"><i className="bx bx-laptop"/> {process.env.NEXT_PUBLIC_VERSION}</li>
                    <li className="flex items-center gap-2"><i className="bx bx-building"/> {process.env.NEXT_PUBLIC_BUILD_NUMBER}</li>
                </ul>
            </section>

            <section className="container">
                <h2 className="text-xl font-semibold mb-1">Open Source & Licenses</h2>
                <p>
                    This app is open source and uses various open-source packages. Each package is distributed under its
                    respective license.
                </p>
            </section>

            <section className="container">
                <h2 className="text-xl font-semibold mb-1">Copyright</h2>
                <p>© {new Date().getFullYear()} @RossanoGuenci. All rights reserved.</p>
                <ul className="mt-3">
                    <li className="flex items-center gap-2"><i className="bx bxl-github text-xl"/> github.com/@rossanoguenci</li>
                </ul>
            </section>

            <section className="container">
                <h2 className="text-xl font-semibold mb-1">Privacy</h2>
                <p>
                    This app does not collect, track, or share any personal data. All information is stored locally on
                    your device.
                </p>
            </section>
        </main>
    );
}
