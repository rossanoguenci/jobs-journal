"use client"

import React from "react";
import {useRouter} from "next/navigation"
import {Avatar, Button, Chip, ChipProps, Link} from "@heroui/react";
import {Delete, Eye, Edit, Company} from "@components/Icons";
import JobEventsList from "@components/Applications/Tables/JobEventsList";

interface JobDetailsProps {
    params: { id: string };
}


export default function JobDetails({params}: JobDetailsProps) {
    const router = useRouter();

    const statusColorMap: Record<string, ChipProps["color"]> = {
        sent: "primary",
        in_progress: "secondary",
        got_offer: "success",
        rejected: "danger",
    };

    const statusLabelMap: Record<string, string> = {
        sent: "Sent",
        in_progress: "In progress",
        got_offer: "Successful",
        rejected: "Unsuccessful",
    }

    return (
        <main className="wrapper">
            <Button className="mb-5" onPress={() => router.push("/")} size={"sm"} variant={"flat"} color={"default"}>
                {/*todo: this must be added in NavBar (?)*/}
                <i className='bx bx-arrow-back'></i> Back to the list
            </Button>
            <div className="container">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Job Title - Full width on mobile, two-thirds on larger screens */}
                    <div className="sm:col-span-2">
                        <h1 className="text-xl">Job title here</h1>
                    </div>

                    {/* Buttons - Move below title in XS, align right in SM+ */}
                    <div className="sm:col-span-1 flex sm:justify-end justify-center flex-wrap gap-2">
                        <Button aria-label="View" color="primary" variant="flat" size="sm">
                            <i className="bx bx-calendar-plus"/> Add event
                        </Button>

                        <Button aria-label="View" color="primary" variant="flat" size="sm">
                            <Edit/> Edit Job
                        </Button>

                        <Button aria-label="Delete" color="danger" variant="flat" size="sm">
                            <Delete/> Hide Job
                        </Button>
                    </div>

                    {/* Company Info - Full width on mobile */}
                    <div className="flex items-center gap-2">
                        <Avatar
                            size="sm"
                            showFallback
                            fallback={<Company/>}
                            src="https://images.unsplash.com/broken"
                        />
                        <div>Company name</div>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center justify-center gap-2">
                        <i className="bx bx-calendar"></i>
                        <span>Applied on: dd/mm/yyyy</span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center gap-2">
                        <span>Status:
                            <Chip className="capitalize" color={statusColorMap["sent"] || "default"} size="sm"
                                  variant="solid">
                                {statusLabelMap["sent"]}
                            </Chip>
                        </span>
                    </div>

                    {/* Links - Full width, wrap on small screens */}
                    <div className="col-span-full flex flex-wrap gap-3 justify-center sm:justify-start">
                        {["Application", "Company's website", "LinkedIn profile"].map((link, index) => (
                            <Button
                                key={index}
                                className="text-xs"
                                showAnchorIcon
                                as={Link}
                                color="default"
                                href=""
                                variant="flat"
                            >
                                {link}
                            </Button>
                        ))}
                    </div>
                </div>


                <JobEventsList/>

            </div>
        </main>
    );
}
