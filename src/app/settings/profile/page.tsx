"use client"
import BackButton from "@components/BackButton";
import {Section, SectionItemList, SectionList} from "@components/Sections";
import User from "../../../components/UserProfile/User";
import {Button} from "@heroui/button";

export default function ProfilePage() {

    return (
        <main className="wrapper">

            <BackButton title="Back to Settings"/>

            <Section title="User">
                <SectionList>
                    <SectionItemList>
                        <User variant="compact"/>
                    </SectionItemList>

                    <SectionItemList>
                        <ul className="flex gap-1">
                            <li><Button>Edit profile</Button></li>
                            <li><Button>button</Button></li>
                            <li><Button>button</Button></li>
                        </ul>
                    </SectionItemList>

                    <SectionItemList>

                    </SectionItemList>

                </SectionList>
            </Section>

        </main>
    );
}
