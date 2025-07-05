import React from 'react';

interface CountAreaProps {
    /** how many digits (controls which tab is highlighted) */
    digits: 2 | 3 | 4 | 'other';
    /** the current problem (e.g. 12) */
    a: number;
    /** the current problem (e.g. 24) */
    b: number;
    /** what the user has typed so far */
    answer: string;
    /** only shown when incorrect */
    correctAnswer?: number;
    /** seconds until it auto-switches */
    countdown: number;
}

export default function CountArea({
                                      digits,
                                      a,
                                      b,
                                      answer,
                                      correctAnswer,
                                      countdown,
                                  }: CountAreaProps) {
    // Tab labels
    const tabs = ['2-digit', '3-digit', 'other'] as const;

    return (
        <div className="relative w-[1200px] h-[900px] rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-orange-100"/>

            {/* Big grey panel */}
            <div className="absolute left-[175px] top-[406px] w-[850px] h-64 bg-gray-400 rounded-3xl"/>

            {/* User’s answer */}
            <div
                className="
          absolute left-[226px] top-[431px]
          w-[550px] h-48
          text-slate-700/90
          text-[175px] font-semibold
          font-['Kantumruy_Pro']
          flex items-center justify-start
        "
            >
                {answer}
            </div>

            {/* Arrow */}
            <div
                className="
          absolute left-[775px] top-[406px]
          w-64 h-64
          text-slate-700/90
          text-[175px] font-semibold
          font-['Kantumruy_Pro']
          flex items-center justify-center
        "
            >
                →
            </div>

            {/* Problem display */}
            <div
                className="
          absolute left-[360px] top-[199px]
          text-slate-700/90
          text-[175px] font-semibold
          font-['Kantumruy_Pro']
        "
            >
                {a}×{b}
            </div>

            {/* “Press enter…” text */}
            <div
                className="
          absolute left-[144px] top-[809px]
          text-slate-700/80
          text-5xl font-semibold
          font-['Kantumruy_Pro']
        "
            >
                press enter to move on, switching in {countdown}s…
            </div>

            {/* Wrong-answer banner (only if provided) */}
            {correctAnswer !== undefined && (
                <div
                    className="
            absolute left-[282px] top-[677px]
            w-[618px] h-20
            text-red-400
            text-6xl font-semibold
            font-['Kantumruy_Pro']
            flex items-center justify-center
          "
                >
                    wrong! answer: {correctAnswer}
                </div>
            )}

            {/* Top tabs background */}
            <div
                className="
          absolute left-[175px] top-[31px]
          w-[850px] h-24
          bg-slate-700
          rounded-3xl
        "
            />
            <div
                className="
          absolute left-[175px] top-[31px]
          w-72 h-24
          bg-gray-400
          rounded-3xl
        "
            />

            {/* Tabs */}
            {tabs.map((label, i) => {
                // compute left offset per your Figma: 229,504,811
                const lefts = [229, 504, 811];
                const isActive = digits === label.replace('-digit', '') || (label === 'other' && digits === 'other');
                return (
                    <div
                        key={label}
                        className={`
              absolute
              left-[${lefts[i]}px] top-[44px]
              text-center
              text-6xl font-semibold
              font-['Kantumruy_Pro']
              ${isActive ? 'text-slate-700' : 'text-gray-400'}
            `}
                    >
                        {label}
                    </div>
                );
            })}
        </div>
    );
}
