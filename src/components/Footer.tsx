// components/Footer.tsx
import React from "react";
import Divider from "./Divider";

export default function Footer({lastUpdated}: { lastUpdated: string }) {
    const date = new Date(lastUpdated).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <footer
            className="
        relative z-10
        w-full max-w-4xl
        mx-auto
        px-5
        pt-4 pb-2
        flex flex-col
      "
        >
            <Divider/>

            <div className="max-w-4xl mx-auto flex flex-col items-center py-4">
                <p className="text-foreground/80 text-center font-semibold text-base">
                    Programmed by{" "}
                    <a
                        href="https://kochergin.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:underline"
                    >
                        Ivan Kochergin
                    </a>{" "}
                    with ❤
                </p>
                <p className="text-foreground/80 text-center font-medium brightness-75 text-base">
                    Last updated: {date}
                </p>
            </div>
        </footer>
    );
}
