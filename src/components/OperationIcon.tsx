// components/OperationIcon.tsx
import React from "react";

export type OperationType =
    | "add"
    | "sub"
    | "mult"
    | "div"
    | "satArith"
    | "satAlg"
    | "satGeom";

const symbols: Record<OperationType, string> = {
    add: "+",
    sub: "−",
    mult: "×",
    div: "÷",
    satArith: "5%×2?",
    satAlg: "6x+9=0",
    satGeom: "△",
};

export default function OperationIcon({
                                          type,
                                      }: {
    type: OperationType;
}) {
    const sizeClass =
        type === "satArith" || type === "satAlg" || type === "satGeom"
            ? "text-[38px] sm:text-[50px] md:text-[55px]"
            : "text-[64px]";

    return (
        <span className={`${sizeClass} font-extrabold text-black dark:text-white`}>
            {symbols[type]}
        </span>
    );
}
