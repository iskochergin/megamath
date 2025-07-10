import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

// our three SAT-arithmetic types
type ProblemType = "percent" | "simplify" | "add-fraction" | "random";

// pick a random integer in [min…max]
const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

// greatest common divisor
const gcd = (a: number, b: number): number =>
    b === 0 ? a : gcd(b, a % b);

const SATArithmeticDrill: React.FC = () => {
    const tabs: ProblemType[] = ["percent", "simplify", "add-fraction"];
    const [selected, setSelected] = useState<ProblemType>("percent");
    const [showExtra, setShowExtra] = useState(false);

    // the current question text, and the correct answer
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

    const inputRef = useRef<HTMLInputElement>(null);

    // tiny dot animation
    const [dotCount, setDotCount] = useState(0);
    useEffect(() => {
        const iv = setInterval(() => setDotCount((c) => (c + 1) % 4), 500);
        return () => clearInterval(iv);
    }, []);

    // autofocus
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // mount animation
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // load best time
    useEffect(() => {
        const b = localStorage.getItem("best_arithmetic");
        if (b) setBestTime(parseFloat(b));
    }, []);

    // *** problem generator ***
    const genProblem = () => {
        let q = "";
        let ans = "";

        // pick type
        const type =
            selected === "random"
                ? tabs[randInt(0, tabs.length - 1)]
                : selected;

        if (type === "percent") {
            // percent-of: pick p in [5,10,15,…,50], base in [20…200]
            const p = [5, 10, 15, 20, 25, 30, 40, 50][randInt(0, 7)];
            const n = randInt(20, 200);
            q = `What is ${p}% of ${n}?`;
            ans = ((p / 100) * n).toString();
        } else if (type === "simplify") {
            // simplify fraction: pick numerator/denom share gcd >1
            const d1 = randInt(2, 9);
            const d2 = randInt(2, 9);
            const g = gcd(d1, d2);
            q = `Simplify ${d1}/${d2}`;
            ans = `${d1 / g}/${d2 / g}`;
        } else if (type === "add-fraction") {
            // add two unlike unit fractions: a/b + c/d
            const b = [2, 3, 4, 5, 6][randInt(0, 4)];
            let d = [2, 3, 4, 5, 6][randInt(0, 4)];
            while (d === b) d = [2, 3, 4, 5, 6][randInt(0, 4)];
            const a = randInt(1, b - 1);
            const c = randInt(1, d - 1);
            // compute sum and simplify
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

    // timer
    useEffect(() => {
        if (isCounting) return;
        const iv = setInterval(() => {
            setCurrentTime((Date.now() - startTime) / 1000);
        }, 50);
        return () => clearInterval(iv);
    }, [startTime, isCounting]);

    // submit / skip
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

    // countdown to next
    useEffect(() => {
        if (!isCounting) return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            genProblem();
        }
    }, [countdown, isCounting]);

    // allow digits, slash, dot
    const sanitize = (s: string) =>
        s.replace(/[^0-9./]/g, "");

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
                    {/* guide */}
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

                    {/* tabs */}
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setSelected(t);
                                    setShowExtra(false);
                                }}
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
                                        : "Add Fraction"}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowExtra((x) => !x)}
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
              ${showExtra ? "max-h-20" : "max-h-0"}
            `}
                    >
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                            <button
                                onClick={() => {
                                    setSelected("random");
                                    setShowExtra(false);
                                }}
                                className={`
                  py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-sm
                  ${
                                    selected === "random"
                                        ? "bg-[rgb(var(--accent))] dark:bg-white dark:text-black"
                                        : "bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]"
                                }
                `}
                            >
                                random
                            </button>
                        </div>
                    </div>

                    {/* timers */}
                    <div className="flex justify-between text-sm mb-3 sm:mb-4">
                        <div>Current: {currentTime.toFixed(2)} s</div>
                        <div>Best: {bestTime?.toFixed(2) ?? "--"} s</div>
                    </div>

                    {/* problem */}
                    <div className="text-center mb-4 sm:mb-6">
            <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
              {question}
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

                    {/* feedback */}
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

                    {/* input */}
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

                    {/* keypad for mobile */}
                    <div className="md:hidden w-full mx-auto">
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px]">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue((v) => v + d)}
                                    className={`text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg max-[360px]:py-1.5 py-2 sm:py-[10px]`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px] mt-1">
                            {[".", "/", "Del"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => {
                                        if (d === "Del") setInputValue((v) => v.slice(0, -1));
                                        else setInputValue((v) => v + d);
                                    }}
                                    className={`text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg max-[360px]:py-1.5 py-2 sm:py-[10px]`}
                                >
                                    {d}
                                </button>
                            ))}
                            <button
                                onClick={handleSubmit}
                                className="text-2xl bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg font-medium"
                            >
                                Enter
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default SATArithmeticDrill;
