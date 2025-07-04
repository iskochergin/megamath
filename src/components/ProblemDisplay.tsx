import React from "react";

interface Props {
    a: number;
    b: number;
}

export default function ProblemDisplay({a, b}: Props) {
    return (
        <div className="text-center mb-4">
            <span className="text-5xl font-mono">{a}</span>
            <span className="text-5xl font-mono mx-2">×</span>
            <span className="text-5xl font-mono">{b}</span>
        </div>
    );
}
