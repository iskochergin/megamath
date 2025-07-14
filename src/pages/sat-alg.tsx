import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

type ProblemType = "one-step" | "two-step" | "evaluate" | "random";

const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const AlgebraDrill: React.FC = () => {
    const tabs: ProblemType[] = ["one-step", "two-step", "evaluate", "random"];
    const [selected, setSelected] = useState<ProblemType>("one-step");
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
        const iv = setInterval(() => setDotCount(c => (c + 1) % 4), 500);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const b = localStorage.getItem("best_algebra");
        if (b) setBestTime(parseFloat(b));
    }, []);

    const genProblem = () => {
        let q = "";
        let ans = "";
        const type =
            selected === "random"
                ? tabs[randInt(0, tabs.length - 1)]
                : selected;

        if (type === "one-step") {
            const a = randInt(2, 12);
            const b = randInt(-20, 20);
            const x0 = randInt(-20, 20);
            const c = a * x0 + b;
            q = `Solve for x: ${a}x${b >= 0 ? "+" + b : b} = ${c}`;
            ans = x0.toString();
        } else if (type === "two-step") {
            const m = randInt(2, 12);
            const shift = randInt(-10, 10);
            const x0 = randInt(-20, 20);
            const c = m * (x0 + shift);
            q = `Solve for x: ${m}(x${shift >= 0 ? "+" + shift : shift}) = ${c}`;
            ans = x0.toString();
        } else if (type === "evaluate") {
            let a = randInt(-10, 10);
            if (a === 0) a = 1;
            const b = randInt(-20, 20);
            const x0 = randInt(-10, 10);
            const val = a * x0 + b;
            q = `Evaluate ${a}x${b >= 0 ? "+" + b : b} at x = ${x0}`;
            ans = val.toString();
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
            localStorage.setItem("best_algebra", `${elapsed}`);
        }
        setFeedback(ok ? "Correct!" : `Wrong: ${correct}`);
        setHistory(h => [...h, ok]);
        setTotalCount(c => c + 1);
        setIsCounting(true);
        setCountdown(3);
    };

    useEffect(() => {
        if (!isCounting) return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        } else {
            genProblem();
        }
    }, [countdown, isCounting]);

    const sanitize = (s: string) => s.replace(/[^0-9.-]/g, "");

    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <title>SAT Algebra I Drill</title>
            </Head>

            <Navbar pageTitle="sat algebra"/>

            <main className="relative pt-16 flex items-center justify-end min-h-[calc(100vh-4rem)] md:justify-center">
                <GridPattern
                    width={40}
                    height={40}
                    strokeDasharray={0}
                    className="absolute inset-0"
                />

                <div
                    className={`
            relative z-10 mt-6 w-11/12 sm:w-10/12 md:w-9/12 lg:w-8/12 xl:w-1/2
            max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
            mx-auto bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
            text-[rgb(var(--foreground))] p-3 sm:p-6 md:p-8 lg:p-12
            rounded-2xl shadow-background transform transition-all duration-500
            ${mounted ? "scale-100" : "scale-105"}
          `}
                >
                    <div className="text-right text-sm mb-3 sm:mb-4">
                        <a
                            href="https://www.khanacademy.org/math/algebra/one-variable-linear-equations"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                        >
                            Algebra I Guide
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
                        {tabs.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelected(t)}
                                className={`
                  flex-1 min-w-[80px] py-1.5 sm:py-2 rounded-lg text-sm font-medium
                  ${selected === t
                                    ? "bg-[rgb(var(--accent))] dark:bg-white dark:text-black"
                                    : "bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]"}
                `}
                            >
                                {t === "one-step"
                                    ? "Solve"
                                    : t === "two-step"
                                        ? "Multi-Step"
                                        : t === "evaluate"
                                            ? "Evaluate"
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

                    <div className="mb-4 sm:mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={inputValue}
                            onChange={e => setInputValue(sanitize(e.target.value))}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            className="w-full text-center text-2xl font-semibold border-2 border-[rgb(var(--accent))] rounded-lg py-2 sm:py-3 bg-transparent focus:outline-none placeholder-opacity-50"
                            placeholder="your answer"
                        />
                    </div>

                    <div className="md:hidden w-full mx-auto">
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px]">
                            {["7", "8", "9"].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue(v => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg max-[360px]:py-1.5 py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px] mt-1">
                            {["4", "5", "6"].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue(v => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg max-[360px]:py-1.5 py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 sm:gap-[6px] mt-1">
                            {["1", "2", "3"].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setInputValue(v => v + d)}
                                    className="text-2xl bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg max-[360px]:py-1.5 py-2 sm:py-[10px]"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1 sm:gap-[6px] mt-1">
                            {["Del", ".", "0", "Enter"].map(d => {
                                const isEnter = d === "Enter";
                                const cls = isEnter
                                    ? "text-2xl max-[360px]:py-1.5 py-2 sm:py-[10px] bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg font-medium"
                                    : "text-2xl max-[360px]:py-1.5 py-2 sm:py-[10px] bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg";
                                return (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            if (d === "Del") setInputValue(v => v.slice(0, -1));
                                            else if (d === "Enter") handleSubmit();
                                            else setInputValue(v => v + d);
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

export default AlgebraDrill;
