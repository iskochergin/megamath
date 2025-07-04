import React from "react";

interface Props {
    answer: string;
    onChange: (val: string) => void;
    onCheck: () => void;
}

export default function AnswerInput({answer, onChange, onCheck}: Props) {
    return (
        <div className="flex items-center justify-center mb-4">
            <input
                type="number"
                value={answer}
                onChange={(e) => onChange(e.target.value)}
                className="
          border border-secondary rounded-lg px-4 py-2 w-32 text-xl text-center
          focus:outline-none focus:ring-2 focus:ring-primary
        "
                placeholder="Your answer"
            />
            <button
                onClick={onCheck}
                className="ml-4 bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition"
            >
                Check
            </button>
        </div>
    );
}
