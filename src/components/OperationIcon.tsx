import React from "react";

export type OperationType =
    | "add"
    | "sub"
    | "mult"
    | "div"
    | "satArith"
    | "satAlg";

const symbols: Record<OperationType, string> = {
    add: "+",
    sub: "−",
    mult: "×",
    div: "÷",
    satArith: "5% of 2?",
    satAlg: "6x+9=0",
};

export default function OperationIcon({
                                          type,
                                      }: {
    type: OperationType;
}) {
    const sizeClass =
        type === "satArith" || type === "satAlg"
            ? "text-[50px]"
            : "text-[64px]";

    return (
        <span
            className={`${sizeClass} font-extrabold text-black dark:text-white`}
        >
            {symbols[type]}
        </span>
    );
}
