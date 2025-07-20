// components/OperationIcon.tsx
import React from "react";

export type OperationType =
    | "add"
    | "sub"
    | "mult"
    | "div"
    | "satArith"
    | "satAlg"
    | "satGeom"
    | "seqBubble"
    | "digitRebus";

const symbols: Record<OperationType, string> = {
    add: "+",
    sub: "−",
    mult: "×",
    div: "÷",
    satArith: "5%×2?",
    satAlg: "6x+9=0",
    satGeom: "△",
    seqBubble: "1→2→?",
    digitRebus: "□+○=?",
};

export default function OperationIcon({
                                          type,
                                      }: {
    type: OperationType;
}) {
    const sizeClass =
        type === "satArith" ||
        type === "satAlg" ||
        type === "satGeom" ||
        type === "seqBubble" ||
        type === "digitRebus"
            ? "text-[38px] sm:text-[50px] md:text-[55px]"
            : "text-[64px]";

    return (
        <span className={`${sizeClass} font-extrabold text-black dark:text-white`}>
      {symbols[type]}
    </span>
    );
}
