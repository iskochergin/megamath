import React from "react";

interface Props {
    elapsed: string;
}

export default function Timer({elapsed}: Props) {
    return <p className="text-secondary text-center mb-4">Time: {elapsed}s</p>;
}
