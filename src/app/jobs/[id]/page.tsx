"use client"

import React, {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {
    Avatar,
    Button,
    Chip,
    Link,
    Skeleton,
} from "@heroui/react";
import JobEventsList from "@components/Applications/Tables/JobEventsList";
import InsertEvent from "@components/Applications/Forms/InsertEvent";
import useJobDetails from "@hooks/useJobDetails";
import {Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger} from "@heroui/dropdown";
import {useModal} from "@components/GlobalModal/ModalContext";
import InsertEditJob from "@components/Applications/Forms/InsertEditJob";
import UpdateStatus from "@components/Applications/Forms/UpdateStatus";
import useToggleJobArchive from "@hooks/useToggleJobArchive";
import jobStatus from "@config/jobStatus";

export default function JobDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const {openModal} = useModal();

    const jobId = Number(params.id);

    const {data, loading, /*error ,*/ refresh} = useJobDetails({jobId});
    const {/*error: errorInsertStatus,*/ insertStatusJob} = useToggleJobArchive();

    const [refreshKey, setRefreshKey] = useState(0);

    const handleInsertStatusJobChange = React.useCallback(async () => {
        if (!data?.insert_status) return;  // Ensure data is available

        const statusTo = data.insert_status === "archived" ? "restore" : "archive";

        try {
            await insertStatusJob({id: jobId, statusTo});
            router.push(`/`);
            console.log(`Job ${statusTo}d successfully`);
        } catch (err) {
            console.error(`Error ${statusTo}ing job:`, err);
        }
    }, [data?.insert_status, insertStatusJob, jobId, router]);


    //todo: manage links dynamically, company's and linkedin's from Companies table - To be developed
    const links: Array<{ label: string, url: string }> = [
        // {label: "Job posting", url: data?.link ?? ""},
        // {label: "Company's website", url: "#"},
        // {label: "LinkedIn profile", url: "#"},
    ];

    if (data?.link) {
        links.push({label: "Job posting", url: data?.link ?? ""});
    }

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

    const statusColor = typeof data?.status === "string" ? jobStatus[data?.status].color : "default";
    const statusLabel = typeof data?.status === "string" ? jobStatus[data?.status].label : "Unknown";


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
                            <h1 className="text-xl">{data?.insert_status === "archived" ? `<i class="bx bxs-archive-in"/> Archived - ` : ''}{data?.title ?? "N/A"}</h1>
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
                                        key="update_status"
                                        startContent={<i className="bx bxs-info-circle"/>}
                                        onPress={() => openModal(<UpdateStatus data={data}/>, refresh)}
                                    >Update status</DropdownItem>
                                    <DropdownItem
                                        key="add_event"
                                        startContent={<i className="bx bxs-calendar-plus"/>}
                                        onPress={() => openModal(<InsertEvent jobId={jobId}/>, () => {
                                            setRefreshKey(prev => prev + 1);
                                        })}
                                    >Add event</DropdownItem>
                                    <DropdownItem
                                        key="edit_job"
                                        startContent={<i className="bx bxs-edit-alt"/>}
                                        onPress={() => openModal(<InsertEditJob data={data}/>, refresh)}
                                    >Edit job</DropdownItem>
                                </DropdownSection>

                                <DropdownSection aria-label="Danger zone">
                                    <DropdownItem
                                        key={data?.insert_status === "archived" ? "restore" : "archive"}
                                        startContent={
                                            <i className={data?.insert_status === "archived" ? "bx bxs-archive-out" : "bx bxs-archive-in"}/>
                                        }
                                        className={data?.insert_status === "archived" ? "text-secondary" : "text-danger"}
                                        color={data?.insert_status === "archived" ? "secondary" : "danger"}
                                        onPress={() => handleInsertStatusJobChange()}
                                    >
                                        {data?.insert_status === "archived" ? "Restore job" : "Archive job"}
                                    </DropdownItem>


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
                                      color={statusColor} size="sm"
                                      variant="solid">
                                    {statusLabel}
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

                <JobEventsList key={refreshKey} jobId={jobId}/>
            </div>
        </main>
    );
}
