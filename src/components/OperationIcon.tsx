import React from "react";

export type OperationType = "add" | "sub" | "mult" | "div";

const symbols: Record<OperationType, string> = {
    add: "+",
    sub: "−",
    mult: "×",
    div: "÷",
};

export default function OperationIcon({
                                          type,
                                          size = 48,
                                      }: {
    type: OperationType;
    size?: number;
}) {
    return (
        <span
            className="text-black dark:text-white font-extrabold"
            style={{fontSize: size}}
        >
      {symbols[type]}
    </span>
    );
}
