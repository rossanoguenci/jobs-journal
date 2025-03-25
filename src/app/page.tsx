import JobsList from "../components/Applications/Tables/JobsList";
import Insert from "../components/Applications/Forms/Insert";
// import NavBar from "@components/NavBar";
import React from "react";



export default function Home() {
    return (
        <>
            {/*<NavBar/>*/}
            <main className="wrapper">
                <Insert/>
                <JobsList/>
            </main>
        </>
    );
}
