import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

type ProblemType = "percent" | "simplify" | "add-fraction" | "random";

const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const gcd = (a: number, b: number): number =>
    b === 0 ? a : gcd(b, a % b);

const SATArithmeticDrill: React.FC = () => {
    const tabs: ProblemType[] = ["percent", "simplify", "add-fraction", "random"];
    const [selected, setSelected] = useState<ProblemType>("percent");
    const [question, setQuestion] = useState("");
    const [correct, setCorrect] = useState<string>("");
    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState("");
    const [history, setHistory] = useState<boolean[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [isCounting, setIsCounting] = useState(false);
    const [dotCount, setDotCount] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const iv = setInterval(() => setDotCount((c) => (c + 1) % 4), 500);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const b = localStorage.getItem("best_arithmetic");
        if (b) setBestTime(parseFloat(b));
    }, []);

    const genProblem = () => {
        let q = "";
        let ans = "";
        const type =
            selected === "random"
                ? tabs[randInt(0, tabs.length - 1)]
                : selected;
        if (type === "percent") {
            const p = [5, 10, 15, 20, 25, 30, 40, 50][randInt(0, 7)];
            const n = randInt(20, 200);
            q = `What is ${p}% of ${n}?`;
            ans = ((p / 100) * n).toString();
        } else if (type === "simplify") {
            let d1 = randInt(10, 99);
            let d2 = randInt(10, 99);
            while (gcd(d1, d2) === 1) {
                d1 = randInt(10, 99);
                d2 = randInt(10, 99);
            }
            const g = gcd(d1, d2);
            q = `Simplify ${d1}/${d2}`;
            ans = `${d1 / g}/${d2 / g}`;
        } else if (type === "add-fraction") {
            const b = randInt(10, 20);
            let d = randInt(10, 20);
            while (d === b) d = randInt(10, 20);
            const a = randInt(1, b - 1);
            const c = randInt(1, d - 1);
            const num = a * d + c * b;
            const den = b * d;
            const g = gcd(num, den);
            q = `What is ${a}/${b} + ${c}/${d}?`;
            ans = `${num / g}/${den / g}`;
        }
        setQuestion(q);
        setCorrect(ans);
        setInputValue("");
        setFeedback("");
        setIsCounting(false);
        setCountdown(0);
        setStartTime(Date.now());
        inputRef.current?.focus();
    };

    useEffect(genProblem, [selected]);

    useEffect(() => {
        if (isCounting) return;
        const iv = setInterval(() => {
            setCurrentTime((Date.now() - startTime) / 1000);
        }, 50);
        return () => clearInterval(iv);
    }, [startTime, isCounting]);

    const handleSubmit = () => {
        if (isCounting) {
            genProblem();
            return;
        }
        const ans = inputValue.trim();
        const ok = ans === correct;
        const elapsed = (Date.now() - startTime) / 1000;
        if (ok && (bestTime === null || elapsed < bestTime)) {
            setBestTime(elapsed);
            localStorage.setItem("best_arithmetic", `${elapsed}`);
        }
        setFeedback(ok ? "Correct!" : `Wrong: ${correct}`);
        setHistory((h) => [...h, ok]);
        setTotalCount((c) => c + 1);
        setIsCounting(true);
        setCountdown(3);
    };

    useEffect(() => {
        if (!isCounting) return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            genProblem();
        }
    }, [countdown, isCounting]);

    const sanitize = (s: string) => s.replace(/[^0-9./]/g, "");

    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <title>SAT Arithmetic Drill</title>
            </Head>
            <Navbar pageTitle="arithmetic"/>
            <main className="relative pt-16 flex items-center justify-end min-h-[calc(100vh-4rem)] md:justify-center">
                <GridPattern
                    width={40}
                    height={40}
                    strokeDasharray={0}
                    className="absolute inset-0"
                />
                <div
                    className={`
            relative z-10 mt-6 w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-5/12
            max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
            mx-auto bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
            text-[rgb(var(--foreground))] p-3 sm:p-6 md:p-8 lg:p-12
            rounded-2xl shadow-background transform transition-all duration-500
            ${mounted ? "scale-100" : "scale-105"}
          `}
                >
                    <div className="text-right text-sm mb-3 sm:mb-4">
                        <a
                            href="https://collegereadiness.collegeboard.org/sat/practice"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            SAT Arithmetic Guide
                        </a>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelected(t)}
                                className={`
                  flex-1 min-w-[80px] py-1.5 sm:py-2 rounded-lg text-sm font-medium
                  ${
                                    selected === t
                                        ? "bg-[rgb(var(--accent))] dark:bg-white dark:text-black"
                                        : "bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]"
                                }
                `}
                            >
                                {t === "percent"
                                    ? "Percent"
                                    : t === "simplify"
                                        ? "Simplify"
                                        : t === "add-fraction"
                                            ? "Add Fraction"
                                            : "Random"}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm mb-3 sm:mb-4">
                        <div>Current: {currentTime.toFixed(2)} s</div>
                        <div>Best: {bestTime?.toFixed(2) ?? "--"} s</div>
                    </div>
                    <div className="text-center mb-4 sm:mb-6">
            <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
              {question}
            </span>
                    </div>
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
                    <div className="text-center mb-3 sm:mb-4 min-h-[1.25rem]">
                        {feedback ? (
                            <>
                                <div className="font-medium">{feedback}</div>
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
                    {(selected === "add-fraction" || selected === "simplify") && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">
                            Enter answer as a/b
                        </div>
                    )}
                    <div className="mb-4 sm:mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => setInputValue(sanitize(e.target.value))}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            className="w-full text-center text-2xl font-semibold border-2 border-[rgb(var(--accent))] rounded-lg py-2 sm:py-3 bg-transparent focus:outline-none placeholder-opacity-50"
                            placeholder="your answer"
                        />
                    </div>
                    <div className="md:hidden w-full mx-auto">
                        <div className="grid grid-cols-4 gap-1 sm:gap-[6px]">
                            {["7", "8", "9", "0"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue((v) => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px] mt-1">
                            {["4", "5", "6"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue((v) => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px] mt-1">
                            {["1", "2", "3"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue((v) => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1 sm:gap-[6px] mt-1">
                            {["Del", ".", "/", "Enter"].map((d) => {
                                const isEnter = d === "Enter";
                                const cls = isEnter
                                    ? "text-2xl py-2 sm:py-[10px] bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg font-medium"
                                    : "text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-2 sm:py-[10px]";
                                return (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            if (d === "Del") setInputValue((v) => v.slice(0, -1));
                                            else if (d === "Enter") handleSubmit();
                                            else setInputValue((v) => v + d);
                                        }}
                                        className={cls}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default SATArithmeticDrill;
