"use client"

import React from "react";
import {useParams, useRouter} from "next/navigation";
import {Avatar, Button, Chip, ChipProps, Link, Skeleton} from "@heroui/react";
import {Delete, Eye, Edit, Company} from "@components/Icons";
import JobEventsList from "@components/Applications/Tables/JobEventsList";
import useJobDetails from "@/queries/useJobDetails";

export default function JobDetails() {
    const router = useRouter();
    const params = useParams();
    const jobId = Number(params.id);

    const {data, loading, error, refresh} = useJobDetails({jobId});

    console.log(data);

    const statusColorMap: Record<string, ChipProps["color"]> = {
        sent: "primary",
        in_progress: "secondary",
        got_offer: "success",
        rejected: "danger",
        withdrawn: "default",
    };

    const statusLabelMap: Record<string, string> = {
        sent: "Sent",
        in_progress: "In progress",
        got_offer: "Successful",
        rejected: "Unsuccessful",
        withdrawn: "Withdrawn",
    };

    //todo: manage links dynamically, company's and linkedin's from Companies table - To be developed
    const links: Array<{ label: string, url: string }> = [
        {label: "Application", url: data?.link ?? ""},
        // {label: "Company's website", url: "#"},
        // {label: "LinkedIn profile", url: "#"},
    ];

    const application_date = (date: string) => {
        if (date.length < 10) {
            return null;
        }
        const [year, month, day] = date.split("-");
        return (<>{`${day}-${month}-${year}`}</>);
    }

    return (
        <main className="wrapper">
            {/* Back Button */}
            <Button className="mb-5" onPress={() => router.push("/")} size="sm" variant="flat" color="default">
                <i className='bx bx-arrow-back'></i> Back to the list
            </Button>

            <div className="container">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Job Title */}
                    <div className="sm:col-span-2">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <h1 className="text-xl">{data?.title ?? "N/A"}</h1>
                        </Skeleton>
                    </div>

                    {/* Buttons */}
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

                    {/* Company Info */}
                    <div>
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex items-center gap-2">
                                <Avatar size="sm" showFallback fallback={<Company/>}
                                        src="https://images.unsplash.com/broken"/>
                                <div>{data?.company ?? "N/A"}</div>
                            </div>
                        </Skeleton>
                    </div>

                    {/* Applied Date */}
                    <div className="text-xs flex items-center justify-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex items-center justify-center gap-2">
                                <i className="bx bx-calendar"></i>
                                <span>Applied on: {application_date(data?.application_date ?? '')}</span>
                            </div>
                        </Skeleton>
                    </div>

                    {/* Status */}
                    <div className="text-xs flex items-center justify-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex items-center justify-center gap-2">
                                <span>Status:
                                    <Chip className="capitalize"
                                          color={statusColorMap[data?.status ?? "default"] || "default"} size="sm"
                                          variant="solid">
                                        {statusLabelMap[data?.status ?? "default"] || "Unknown"}
                                    </Chip>
                                </span>
                            </div>
                        </Skeleton>
                    </div>

                    {/* Links */}
                    <div className="col-span-full mt-2">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                {links.map((link, index) => (
                                    <Button
                                        key={index}
                                        className="text-xs"
                                        showAnchorIcon
                                        as={Link}
                                        color="default"
                                        href={link.url}
                                        variant="flat"
                                    >
                                        {link.label}
                                    </Button>
                                ))}
                            </div>
                        </Skeleton>
                    </div>
                </div>

                <JobEventsList jobId={jobId} />
            </div>
        </main>
    );
}
