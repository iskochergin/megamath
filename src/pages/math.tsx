// pages/multiplication.tsx
import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

type Simple = "2-digit" | "3-digit";
type Extra = "1x2" | "2x3" | "3x4" | "4x4" | "random";
type ProblemType = Simple | Extra;

const getRandomNumber = (digits: number) => {
    const min = 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const MultiplicationDrill: React.FC = () => {
    const tabs: Simple[] = ["2-digit", "3-digit"];
    const extra: Extra[] = ["1x2", "2x3", "3x4", "4x4", "random"];

    const [selected, setSelected] = useState<ProblemType>("2-digit");
    const [showExtra, setShowExtra] = useState(false);

    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState("");
    const [history, setHistory] = useState<boolean[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [bestTime, setBestTime] = useState<number | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(0);

    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);

    // animated dots for "Waiting..."
    const [dotCount, setDotCount] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => setDotCount(c => (c + 1) % 4), 500);
        return () => clearInterval(iv);
    }, []);

    // autofocus on the text input
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // scale-in effect
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // load stored best time
    useEffect(() => {
        const b = localStorage.getItem("best_multiplication");
        if (b) setBestTime(parseFloat(b));
    }, []);

    // generate a new multiplication problem
    const genProblem = () => {
        let d1: number, d2: number;
        if (selected === "random") {
            d1 = Math.floor(Math.random() * 3) + 2;
            d2 = Math.floor(Math.random() * 3) + 2;
        } else if (selected.includes("x")) {
            [d1, d2] = selected.split("x").map(Number);
        } else {
            d1 = d2 = +selected[0];
        }
        setNum1(getRandomNumber(d1));
        setNum2(getRandomNumber(d2));
        setInputValue("");
        setFeedback("");
        setIsCounting(false);
        setCountdown(0);
        setStartTime(Date.now());
        inputRef.current?.focus();
    };
    useEffect(genProblem, [selected]);

    // live timer update
    useEffect(() => {
        if (isCounting) return;
        const iv = setInterval(() => {
            setCurrentTime((Date.now() - startTime) / 1000);
        }, 50);
        return () => clearInterval(iv);
    }, [startTime, isCounting]);

    // handle submit or skip
    const handleSubmit = () => {
        if (isCounting) {
            genProblem();
            return;
        }
        const ans = Number(inputValue);
        const correct = num1 * num2;
        const ok = ans === correct;
        const elapsed = (Date.now() - startTime) / 1000;

        if (ok && (bestTime === null || elapsed < bestTime)) {
            setBestTime(elapsed);
            localStorage.setItem("best_multiplication", `${elapsed}`);
        }

        setFeedback(ok ? "Correct!" : `Wrong: ${correct}`);
        setHistory(h => [...h, ok]);
        setTotalCount(c => c + 1);
        setIsCounting(true);
        setCountdown(3);
    };

    // countdown before next problem
    useEffect(() => {
        if (!isCounting) return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            genProblem();
        }
    }, [countdown, isCounting]);

    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <title>Math drill</title>
            </Head>

            <Navbar pageTitle="multiplication"/>

            <main
                className="
                    relative pt-16
                    flex items-center justify-end
                    min-h-[calc(100vh-4rem)]
                    md:justify-center
                "
            >
                <GridPattern
                    width={40}
                    height={40}
                    strokeDasharray={0}
                    className="absolute inset-0"
                />

                <div
                    className={`
                        relative z-10
                        mt-6
                        w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-5/12
                        max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
                        mx-auto
                        bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
                        text-[rgb(var(--foreground))]
                        p-3 sm:p-6 md:p-8 lg:p-12
                        rounded-2xl shadow-background
                        transform transition-all duration-500
                        ${mounted ? "scale-100" : "scale-105"}
                    `}
                >
                    {/* guide link */}
                    <div className="text-right text-sm mb-3 sm:mb-4">
                        <a
                            href="https://thevedicmaths.com/vedic-maths-for-multiplication/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            Fast multiplication guide
                        </a>
                    </div>

                    {/* tabs */}
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {tabs.map(t => (
                            <button
                                key={t}
                                onClick={() => {
                                    setSelected(t);
                                    setShowExtra(false);
                                }}
                                className={`
                                    flex-1 min-w-[80px] py-1.5 sm:py-2 rounded-lg text-sm font-medium
                                    ${selected === t
                                    ? 'bg-[rgb(var(--accent))] dark:bg-white dark:text-black'
                                    : 'bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]'}
                                `}
                            >
                                {t}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowExtra(x => !x)}
                            className="
                                px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-medium
                                bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]
                            "
                        >
                            Other ▾
                        </button>
                    </div>

                    {/* extra menu */}
                    <div
                        className={`
                            overflow-hidden transition-[max-height] duration-300 mb-4 sm:mb-6
                            ${showExtra ? "max-h-40" : "max-h-0"}
                        `}
                    >
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            {extra.map(e => (
                                <button
                                    key={e}
                                    onClick={() => {
                                        setSelected(e);
                                        setShowExtra(false);
                                    }}
                                    className={`
                                        py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-sm
                                        ${selected === e
                                        ? 'bg-[rgb(var(--accent))] dark:bg-white dark:text-black'
                                        : 'bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]'}
                                    `}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* timers */}
                    <div className="flex justify-between text-sm mb-3 sm:mb-4">
                        <div>Current: {currentTime.toFixed(2)} s</div>
                        <div>Best: {bestTime?.toFixed(2) ?? "--"} s</div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        {/* problem */}
                        <div className="text-center mb-4 sm:mb-6">
                            <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
                                {num1} × {num2}
                            </span>
                        </div>

                        {/* history */}
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                            {totalCount > 3 && (
                                <span className="text-xs text-[rgb(var(--accent))] mr-2">
                                    +{totalCount - 3}
                                </span>
                            )}
                            {history.slice(-3).map((ok, i) => (
                                <span
                                    key={i}
                                    className={`
                                        w-5 h-5 rounded-full mr-1
                                        ${ok
                                        ? "bg-[rgb(var(--foreground))]"
                                        : "border-2 border-[rgb(var(--foreground))]"}
                                    `}
                                />
                            ))}
                        </div>

                        {/* feedback / waiting */}
                        <div className="text-center mb-3 sm:mb-4 min-h-[1.25rem]">
                            {feedback ? (
                                <>
                                    <div className="font-medium">
                                        {feedback || "\u200B"}
                                    </div>
                                    {isCounting && (
                                        <div className="text-xs text-[rgb(var(--accent))] mt-1">
                                            Press Enter — switching in {countdown}s…
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-sm text-[rgb(var(--accent))]">
                                    Waiting{".".repeat(dotCount)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* answer input */}
                    <div className="mb-4 sm:mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={inputValue}
                            onChange={e => {
                                setShowExtra(false);
                                setInputValue(e.target.value.replace(/\D/g, ""));
                            }}
                            onKeyDown={e => {
                                if (e.key === "Enter") handleSubmit();
                            }}
                            className="
                                w-full text-center text-2xl sm:text-3xl font-semibold
                                border-2 border-[rgb(var(--accent))]
                                rounded-lg py-2 sm:py-3 bg-transparent focus:outline-none
                                placeholder-opacity-50
                            "
                            placeholder="your answer"
                        />
                    </div>

                    {/* mobile keypad */}
                    <div className="grid grid-cols-3 max-[360px]:gap-0.5 gap-1 sm:gap-[6px] md:hidden w-full mx-auto">
                        {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map(d => (
                            <button
                                key={d}
                                onClick={() => {
                                    setShowExtra(false);
                                    setInputValue(v => v + d);
                                }}
                                className="
                                    max-[360px]:py-1 py-2 sm:py-[10px] bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]
                                    border border-[rgb(var(--accent))]
                                    rounded-lg text-xl
                                "
                            >
                                {d}
                            </button>
                        ))}
                        <button
                            onClick={() => setInputValue("")}
                            className="
                                max-[360px]:py-1 py-2 sm:py-[10px] bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]
                                border border-[rgb(var(--accent))]
                                rounded-lg text-sm
                            "
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => setInputValue(v => v + "0")}
                            className="
                                max-[360px]:py-1 py-2 sm:py-[10px] bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]
                                border border-[rgb(var(--accent))]
                                rounded-lg text-xl
                            "
                        >
                            0
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="
                                py-2 sm:py-3 bg-[rgb(var(--foreground))]
                                text-[rgb(var(--background))]
                                rounded-lg text-lg font-medium
                            "
                        >
                            Enter
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default MultiplicationDrill;
