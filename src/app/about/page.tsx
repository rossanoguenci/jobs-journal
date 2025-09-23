import React from 'react';
import {Section, SectionItemList, SectionList} from "@components/Sections";
import Icon from "@components/Icons";

export default function AboutPage() {

    return (
        <main className="wrapper">
            <Section title="About This App">
                <p>
                    This app is a local job journal to help you keep track of your job applications. It runs fully
                    offline using Tauri and stores your data locally with SQLite.
                </p>
                <SectionList variant="inline">
                    <SectionItemList><Icon name="version"/> {process.env.NEXT_PUBLIC_VERSION}</SectionItemList>
                    <SectionItemList><Icon name="build"/> {process.env.NEXT_PUBLIC_BUILD_NUMBER}</SectionItemList>
                </SectionList>
            </Section>

            <Section title="Open Source & Licenses">
                <p>
                    This app is open source and uses various open-source packages. Each package is distributed under its
                    respective license.
                </p>
            </Section>

            <Section title="Copyright">
                <p>© {new Date().getFullYear()} @RossanoGuenci. All rights reserved.</p>
                <SectionList>
                    <SectionItemList><Icon name="gitHub"/> github.com/@rossanoguenci</SectionItemList>
                </SectionList>
            </Section>

            <Section title="Privacy">
                <p>
                    This app does not collect, track, or share any personal data. All information is stored locally on
                    your device.
                </p>
            </Section>
        </main>
    );
}
