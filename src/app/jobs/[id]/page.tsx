"use client"

import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {
    Avatar,
    Button,
    Chip,
    ChipProps,
    Link,
    Skeleton,
} from "@heroui/react";
import JobEventsList from "@components/Applications/Tables/JobEventsList";
import InsertEvent from "@components/Applications/Forms/InsertEvent";
import useJobDetails from "@/queries/useJobDetails";
import {Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@heroui/dropdown";
import Modal from "@components/Modal";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";

export default function JobDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = Number(params.id);

    const {data, loading, error, refresh} = useJobDetails({jobId});

    // const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<string | null>(null);
    const openModal = (type: string) => setModalType(type);
    const closeModal = () => setModalType(null);

    const archiveJob = async () => {
        try {
            const response = await fetch(`/api/jobs/${jobId}/archive`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to archive job");

        } catch (error) {
            console.error("Error archiving job:", error);
        }
    }; // todo: to be developed

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

    const daysFromDate = (date: string) => {
        if (date.length < 10) {
            return null
        }
        const givenDate = new Date(date);
        if (isNaN(givenDate.getTime())) {
            return null;
        }
        const today = new Date();
        const diff = today.getTime() - givenDate.getTime();

        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }


    return (
        <main className="wrapper">
            {/* Back Button */}
            <Button className="mb-5" onPress={() => router.push("/")} size="sm" variant="flat" color="default">
                <i className='bx bx-arrow-back'></i> Back to the list
            </Button>

            <div className="container">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                    {/* Job Title */}
                    <div className="col-span-1 sm:col-span-2 flex items-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <h1 className="text-xl">{data?.title ?? "N/A"}</h1>
                        </Skeleton>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end">
                        <Dropdown backdrop="blur">
                            <DropdownTrigger>
                                <Button aria-label="Open actions" color="default" variant="light" size="lg" isIconOnly
                                        className="text-xl"><i className='bx bxs-cog'/></Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Actions dropdown menu" variant="faded">
                                <DropdownSection aria-label="Actions" showDivider>
                                    <DropdownItem
                                        key="add_event"
                                        startContent={<i className="bx bxs-calendar-plus"/>}
                                        onPress={() => openModal("add_event")}
                                    >Add event</DropdownItem>
                                    <DropdownItem
                                        key="edit_job"
                                        startContent={<i className="bx bxs-edit-alt"/>}
                                        onPress={() => openModal("edit_job")}
                                    >Edit job</DropdownItem>
                                </DropdownSection>
                                <DropdownSection aria-label="Danger zone">
                                    <DropdownItem
                                        key="archive"
                                        startContent={<i className="bx bxs-archive-in"/>}
                                        className="text-danger"
                                        color="danger"
                                        // onPress={archiveJob}
                                    >Archive job</DropdownItem>
                                </DropdownSection>
                            </DropdownMenu>
                        </Dropdown>

                    </div>

                    {/* Company Info */}
                    <div className="flex items-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex items-center gap-2 align-middle">
                                <Avatar size="sm" showFallback fallback={<i className="bx bx-buildings"/>}
                                        src="https://images.unsplash.com/broken"/>
                                <span>{data?.company ?? "N/A"}</span>
                            </div>
                        </Skeleton>
                    </div>

                    {/* Applied Date */}
                    <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span><i
                                    className="bx bx-calendar"></i> {application_date(data?.application_date ?? '')}</span>
                                <span>({daysFromDate(data?.application_date ?? '')} days ago)</span>
                            </div>
                        </Skeleton>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 sm:col-span-1 text-xs flex items-center justify-center">
                        <Skeleton className="rounded-lg" isLoaded={!loading}>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <span>Current status</span>
                                <Chip className="capitalize"
                                      color={statusColorMap[data?.status ?? "default"] || "default"} size="sm"
                                      variant="solid">
                                    {statusLabelMap[data?.status ?? "default"] || "Unknown"}
                                </Chip>
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

                <JobEventsList jobId={jobId}/>
            </div>

            {/*Modal*/}
            <Modal isOpen={modalType !== null} onClose={closeModal}>
                {modalType === "add_event" && <InsertEvent jobId={jobId}/>}
                {modalType === "edit_job" && <InsertEditJob data={data}/>}
            </Modal>


        </main>
    );
}
