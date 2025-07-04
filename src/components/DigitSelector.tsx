import React from "react";

interface Props {
    digits: number;
    onChange: (n: number) => void;
}

export default function DigitSelector({digits, onChange}: Props) {
    return (
        <div className="flex justify-center mb-6">
            {[2, 3].map((n) => (
                <button
                    key={n}
                    onClick={() => onChange(n)}
                    className={`
            mx-2 px-4 py-2 rounded-lg transition
            ${digits === n
                        ? "bg-primary text-white"
                        : "bg-secondary/20 text-secondary hover:bg-secondary/30"}
          `}
                >
                    {n}-digit
                </button>
            ))}
        </div>
    );
}
