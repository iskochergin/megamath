import React from "react";
import {execSync} from "child_process";
import Link from "next/link";
import {GetStaticProps} from "next";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";
import OperationIcon, {OperationType} from "@/components/OperationIcon";
import Footer from "@/components/Footer";

type Tile = {
    href: string;
    type: OperationType;
    label: string;
};

export default function Home({lastUpdated}: { lastUpdated: string }) {
    const satTiles: Tile[] = [
        {href: "/sat-arith", type: "satArith", label: "Arithmetic"},
    ];

    const fastTiles: Tile[] = [
        {href: "/add", type: "add", label: "Addition"},
        {href: "/sub", type: "sub", label: "Subtraction"},
        {href: "/mult", type: "mult", label: "Multiplication"},
        {href: "/div", type: "div", label: "Division"},
    ];

    return (
        <>
            <Navbar pageTitle="megamath"/>

            <main className="relative pt-16 flex flex-col items-center min-h-screen">
                <GridPattern
                    width={40}
                    height={40}
                    strokeDasharray={0}
                    className="absolute inset-0"
                />

                {/* SAT PREP */}
                <section className="relative z-10 flex-1 w-11/12 max-w-4xl px-4 py-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center">
                        sat prep
                    </h1>
                    <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fit,_minmax(135px,_1fr))]">
                        {satTiles.map(({href, type, label}) => (
                            <Link
                                key={href}
                                href={href}
                                className="
                  flex flex-col items-center justify-center
                  px-6 pt-8 pb-4 sm:p-6
                  bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
                  rounded-2xl shadow-background
                  hover:scale-[1.02] transition-transform
                "
                            >
                                <OperationIcon type={type}/>
                                <span className="mt-2 sm:mt-4 text-base sm:text-xl font-medium">
                  {label}
                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* FAST COUNT */}
                <section className="relative z-10 flex-1 w-11/12 max-w-4xl px-4 py-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center">
                        fast count
                    </h1>
                    <div className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fit,_minmax(135px,_1fr))]">
                        {fastTiles.map(({href, type, label}) => (
                            <Link
                                key={href}
                                href={href}
                                className="
                  flex flex-col items-center justify-center
                  px-6 pt-8 pb-4 sm:p-6
                  bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
                  rounded-2xl shadow-background
                  hover:scale-[1.02] transition-transform
                "
                            >
                                <OperationIcon type={type}/>
                                <span className="mt-2 sm:mt-4 text-base sm:text-xl font-medium">
                  {label}
                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <Footer lastUpdated={lastUpdated}/>
            </main>
        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    let isoDate: string;
    try {
        isoDate = execSync("git log -1 --format=%cI").toString().trim();
    } catch {
        isoDate = new Date().toISOString();
    }
    return {props: {lastUpdated: isoDate}};
};
