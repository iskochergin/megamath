import React from "react";

interface Props {
    a: number;
    b: number;
    sizeClass?: string;
}

export default function ProblemDisplay({
                                           a,
                                           b,
                                           sizeClass = "text-5xl",
                                       }: Props) {
    return (
        <div className="text-center mb-4">
            <span className={`${sizeClass} font-mono`}>{a}</span>
            <span className={`${sizeClass} font-mono mx-2`}>×</span>
            <span className={`${sizeClass} font-mono`}>{b}</span>
        </div>
    );
}
