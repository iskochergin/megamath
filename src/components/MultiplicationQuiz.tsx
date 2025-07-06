/* components/MultiplicationQuiz.tsx */
"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    CSSProperties,
} from "react";
import clsx from "clsx";
import Head from "next/head";

/* ───────── helpers ───────── */
type Simple = "2-digit" | "3-digit";
type Extra = "2x3" | "3x4" | "4x4" | "random";
type Mode = Simple | Extra;

interface Prob {
    a: number;
    b: number;
    text: string;
    answer: number;
}

const rand = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const build = (m: Mode): Prob => {
    const p = (d: number) => rand(10 ** (d - 1), 10 ** d - 1);
    switch (m) {
        case "2-digit": {
            const a = p(2),
                b = p(2);
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
        case "3-digit": {
            const a = p(3),
                b = p(3);
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
        case "2x3": {
            const a = p(2),
                b = p(3);
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
        case "3x4": {
            const a = p(3),
                b = p(4);
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
        case "4x4": {
            const a = p(4),
                b = p(4);
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
        case "random": {
            const a = p(rand(2, 4)),
                b = p(rand(2, 4));
            return {a, b, text: `${a}×${b}`, answer: a * b};
        }
    }
};

/* ------------------------------------------------------------------ */
export default function MultiplicationQuiz() {
    /* state */
    const [mode, setMode] = useState<Mode>("2-digit");
    const [prob, setProb] = useState<Prob | null>(null);
    const [input, setInput] = useState("");
    const [sec, setSec] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
    const [chooser, setChooser] = useState(false);

    const timer = useRef<NodeJS.Timeout | null>(null);
    const tick = useRef<NodeJS.Timeout | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const caretRef = useRef<HTMLDivElement | null>(null);
    const measureRef = useRef<HTMLSpanElement | null>(null);

    /* perfectly centre & scale card */
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const calc = () =>
            setScale(Math.min(window.innerWidth / 2400, window.innerHeight / 1800, 1));
        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);

    /* ----- helpers ----- */
    const prepare = useCallback(
        (newMode: Mode = mode) => {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);

            setProb(build(newMode));
            setInput("");
            setSec(null);
            setFeedback("");
            if (caretRef.current) caretRef.current.style.left = "0px";
            setTimeout(() => inputRef.current?.focus(), 0); // show caret instantly
        },
        [mode]
    );

    const beginCountdown = useCallback(() => {
        setSec(10);
        tick.current = setInterval(
            () => setSec((s) => (s !== null && s > 0 ? s - 1 : s)),
            1_000
        );
        timer.current = setTimeout(() => prepare(), 10_000);
    }, [prepare]);

    const submit = useCallback(() => {
        if (!prob) return;

        /* if countdown running, skip immediately */
        if (sec !== null) {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
            prepare();
            return;
        }

        const ok = parseInt(input.trim(), 10) === prob.answer;
        setFeedback(ok ? "correct" : "wrong");
        beginCountdown();
    }, [input, prob, sec, beginCountdown, prepare]);

    /* first problem */
    useEffect(() => {
        prepare("2-digit");
        return () => {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const h = (e: KeyboardEvent) => e.key === "Enter" && submit();
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [submit]);

    /* caret positioning */
    useEffect(() => {
        if (!caretRef.current || !measureRef.current) return;

        measureRef.current.textContent = input;

        const w = measureRef.current.offsetWidth;
        const len = input.length;

        let x: number;
        if (len === 0) {
            x = -20;
        } else {
            x = w + len * 2;
            if (len == 1) {
                x -= 2;
            }
        }

        // Clamp to [0, 550−6] so the caret never escapes the 550px field
        x = Math.min(Math.max(x, 0), 550 - 6);

        caretRef.current.style.left = `${x}px`;
    }, [input]);

    /* highlight slider */
    const idx = ["2-digit", "3-digit", "other"].indexOf(
        mode === "2-digit" || mode === "3-digit" ? mode : "other"
    );
    const highlightLeft = 175 + idx * 288;

    /* ---------------- render ---------------- */
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600&display=swap"
                    rel="stylesheet"
                />
                <title>Math drill</title>
            </Head>

            <div className="min-h-screen flex items-center justify-center bg-black">
                <div
                    style={
                        {
                            width: 1200,
                            height: 900,
                            transform: `scale(${scale})`,
                            transformOrigin: "center",
                        } as CSSProperties
                    }
                    className="relative rounded-3xl"
                >
                    {/* background */}
                    <div className="absolute inset-0 bg-fig-bg rounded-3xl"/>

                    {/* selector bar */}
                    <div className="absolute left-[175px] top-[31px] w-[850px] h-24 bg-fig-dark rounded-3xl"/>
                    <div
                        className="absolute w-72 h-24 bg-fig-muted rounded-3xl top-[31px] transition-[left] duration-200"
                        style={{left: highlightLeft}}
                    />
                    <button
                        onClick={() => {
                            setMode("2-digit");
                            prepare("2-digit");
                        }}
                        className={clsx(
                            "absolute left-[229px] top-[44px] text-6xl font-semibold font-['Kantumruy_Pro']",
                            mode === "2-digit" ? "text-fig-dark" : "text-gray-400"
                        )}
                    >
                        2-digit
                    </button>
                    <button
                        onClick={() => {
                            setMode("3-digit");
                            prepare("3-digit");
                        }}
                        className={clsx(
                            "absolute left-[504px] top-[46px] text-6xl font-semibold font-['Kantumruy_Pro']",
                            mode === "3-digit" ? "text-fig-dark" : "text-gray-400"
                        )}
                    >
                        3-digit
                    </button>
                    <button
                        onClick={() => setChooser(true)}
                        className={clsx(
                            "absolute left-[811px] top-[44px] text-6xl font-semibold font-['Kantumruy_Pro']",
                            chooser ? "text-fig-dark" : "text-gray-400"
                        )}
                    >
                        other
                    </button>

                    {/* problem */}
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-[199px] text-[175px] font-semibold font-['Kantumruy_Pro'] text-fig-dark/90 whitespace-nowrap">
                        {prob?.text}
                    </div>

                    {/* answer bar & input */}
                    <div className="absolute left-[175px] top-[406px] w-[850px] h-64 bg-fig-muted rounded-3xl"/>
                    <div className="absolute left-[226px] top-[431px] w-[550px] h-48">
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                            inputMode="numeric"
                            className="w-full h-full bg-transparent text-[175px] font-semibold font-['Kantumruy_Pro'] text-fig-dark/90 outline-none"
                            style={{textAlign: "left", caretColor: "transparent"}}
                        />
                        {/* hidden mirror for width */}
                        <span
                            ref={measureRef}
                            className="absolute invisible whitespace-pre pointer-events-none text-[175px] font-['Kantumruy_Pro']"
                            style={{left: 0, top: 0}}
                        />
                        {/* wide caret */}
                        <div
                            ref={caretRef}
                            style={{
                                position: "absolute",
                                top: "10%",
                                width: "6px",
                                height: "80%",
                                background: "#35385a",
                                animation: "blink 1s steps(1) infinite",
                            }}
                        />
                    </div>
                    <button
                        onClick={submit}
                        className="absolute left-[775px] top-[406px] w-64 h-64 flex items-center justify-center text-[175px] font-semibold font-['Kantumruy_Pro'] text-fig-dark/90"
                    >
                        →
                    </button>

                    {/* feedback */}
                    {feedback && (
                        <div
                            className={clsx(
                                "absolute left-1/2 -translate-x-1/2 top-[677px] text-6xl font-semibold font-['Kantumruy_Pro'] text-center",
                                feedback === "correct" ? "text-fig-muted" : "text-fig-warn"
                            )}
                        >
                            {feedback === "correct"
                                ? "Correct!"
                                : `Wrong! answer: ${prob?.answer}`}
                        </div>
                    )}

                    {/* countdown */}
                    {sec !== null && (
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-[809px] text-5xl font-semibold font-['Kantumruy_Pro'] text-fig-dark/80">
                            switching in {sec}s…
                        </div>
                    )}

                    {/* chooser overlay (unchanged) */}
                    {chooser && (
                        <div className="absolute inset-0 rounded-3xl animate-fade">
                            <div className="absolute inset-0 bg-fig-bg rounded-3xl"/>
                            <div
                                className="absolute left-[304px] top-[162px] w-[593px] h-[512px] bg-fig-dark rounded-3xl"/>
                            <div className="absolute left-[175px] top-[31px] w-[850px] h-24 bg-fig-dark rounded-3xl"/>
                            <div className="absolute left-[755px] top-[31px] w-64 h-24 bg-fig-muted rounded-3xl"/>
                            <div
                                className="absolute left-[229px] top-[41px] text-gray-400 text-6xl font-semibold font-['Kantumruy_Pro']">
                                2-digit
                            </div>
                            <div
                                className="absolute left-[504px] top-[43px] text-gray-400 text-6xl font-semibold font-['Kantumruy_Pro']">
                                3-digit
                            </div>
                            <button
                                onClick={() => setChooser(false)}
                                className="absolute left-[811px] top-[41px] text-fig-dark text-6xl font-semibold font-['Kantumruy_Pro']"
                            >
                                other
                            </button>

                            {(
                                [
                                    ["2x3", "2-digit × 3-digit", 207],
                                    ["3x4", "3-digit × 4-digit", 324],
                                    ["4x4", "4-digit × 4-digit", 441],
                                    ["random", "random", 558],
                                ] as [Extra, string, number][]
                            ).map(([k, label, top]) => (
                                <button
                                    key={k}
                                    onClick={() => {
                                        setMode(k);
                                        setChooser(false);
                                        prepare(k);
                                    }}
                                    style={{top}}
                                    className="absolute left-[372px] text-fig-muted hover:text-white transition-colors text-6xl font-semibold font-['Kantumruy_Pro']"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* caret blink */}
            <style jsx>{`
                @keyframes blink {
                    0%,
                    50% {
                        opacity: 1;
                    }
                    50.01%,
                    100% {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
}
