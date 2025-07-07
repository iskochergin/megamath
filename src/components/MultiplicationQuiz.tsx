// src/components/MultiplicationQuiz.tsx
"use client";

import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
    CSSProperties,
}
    from
        "react";
import clsx from "clsx";
import Head from "next/head";
import Header from "./Header";

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

export default function MultiplicationQuiz() {
    /* ── sizing & margins ───────────────────────── */
    // 1) take 4/5 of the original BASE_W / BASE_H
    const BASE_W = 1200; // 960
    const BASE_H = 900; // 720
    const SHRINK = 0.9;   // we folded the “initial shrink” into BASE_W/H
    const INIT_MARGIN = 100; // start at 100px on left / right / bottom
    const MIN_MARGIN = 0;  // never shrink margin below 10px
    const HEAD_H = 64;  // height of the Header

    /* ── state & refs ───────────────────────────── */
    const [mode, setMode] = useState<Mode>("2-digit");
    const [prob, setProb] = useState<Prob | null>(null);
    const [input, setInput] = useState("");
    const [sec, setSec] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<"" | "correct" | "wrong">("");
    const [chooser, setChooser] = useState(false);

    const timer = useRef<NodeJS.Timeout | null>(null);
    const tick = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [scale, setScale] = useState(SHRINK);
    const [margin, setMargin] = useState(INIT_MARGIN);
    // track whether we’re “wide” or “narrow”
    const [isWide, setIsWide] = useState(false);

    /* ── responsive calc ─────────────────────────── */
    useEffect(() => {
        const calc = () => {
            const W = window.innerWidth;
            const H = window.innerHeight - HEAD_H;

            // update wide/narrow
            setIsWide(W >= 600);

            // 1 ▸ pick a side‐margin that shrinks from INIT_MARGIN down to MIN_MARGIN
            const propMargin = Math.floor(W * 0.05); // 5% of width
            let m = Math.max(MIN_MARGIN, Math.min(INIT_MARGIN, propMargin));

            // 2 ▸ find the largest scale that fits with that margin
            const availW = W - 2 * m;
            const availH = H - m;
            let s = Math.min(availW / BASE_W, availH / BASE_H, 1) * SHRINK;

            // 3 ▸ if height is the limiting side, tighten the margins
            const widthLimited = BASE_W * s > availW;
            const heightLimited = BASE_H * s > availH;
            if (heightLimited && !widthLimited) {
                const maxM = Math.min(
                    (W - BASE_W * s) / 2,
                    H - BASE_H * s
                );
                m = Math.max(MIN_MARGIN, Math.min(m, maxM));
                const newAvailW = W - 2 * m;
                const newAvailH = H - m;
                const newBase = Math.min(newAvailW / BASE_W, newAvailH / BASE_H, 1);
                s = newBase * SHRINK;
            }

            setMargin(m);
            setScale(s);
        };

        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);

    /* ── quiz logic ──────────────────────────────── */
    const prepare = useCallback(
        (newMode: Mode = mode) => {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
            setProb(build(newMode));
            setInput("");
            setSec(null);
            setFeedback("");
            setTimeout(() => inputRef.current?.focus(), 0);
        },
        [mode]
    );

    const beginCountdown = useCallback(() => {
        setSec(10);
        tick.current = setInterval(
            () => setSec((s) => (s !== null && s > 0 ? s - 1 : s)),
            1000
        );
        timer.current = setTimeout(() => prepare(), 10000);
    }, [prepare]);

    const submit = useCallback(() => {
        if (!prob) return;
        if (sec !== null) {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
            prepare();
            return;
        }
        const ok = parseInt(input.trim() || "0", 10) === prob.answer;
        setFeedback(ok ? "correct" : "wrong");
        beginCountdown();
    }, [input, prob, sec, beginCountdown, prepare]);

    useEffect(() => {
        prepare("2-digit");
        return () => {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
        };
    }, [prepare]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => e.key === "Enter" && submit();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [submit]);

    const idx = ["2-digit", "3-digit", "other"].indexOf(
        mode === "2-digit" || mode === "3-digit" ? mode : "other"
    );
    const highlightLeft = 175 + idx * 288;

    /* ── render ─────────────────────────────────── */
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600&display=swap"
                    rel="stylesheet"
                />
                <title>Math drill</title>

            </Head>

            <Header pageTitle="multiplication"/>

            <div
                className="fixed top-[80px]"
                style={{marginLeft: margin, marginRight: margin}}
            >
                <div>Current:</div>
                <div>Best:</div>
            </div>


            <div
                className="fixed top-[150px] w-screen overflow-hidden flex flex-col items-center justify-end bg-white pb-8"
            >

                <div
                    style={{
                        marginLeft: margin,
                        marginRight: margin,
                        // 2) stick to bottom with exactly 10px when wide
                        marginBottom: isWide ? MIN_MARGIN : margin,
                        width: BASE_W * scale,
                        height: BASE_H * scale,
                    } as CSSProperties}
                    className="relative rounded-3xl"
                >
                    <div
                        style={{
                            width: BASE_W,
                            height: BASE_H,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                        } as CSSProperties}
                        className="relative"
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-fig-bg rounded-3xl"/>

                        {/* Selector Bar */}
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

                        {/* Problem Display */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 top-[199px] text-[175px] font-semibold font-['Kantumruy_Pro'] text-fig-dark/90 whitespace-nowrap"
                        >
                            {prob?.text}
                        </div>

                        {/* Answer Bar & Input */}
                        <div className="absolute left-[175px] top-[406px] w-[850px] h-64 bg-fig-muted rounded-3xl"/>
                        <div className="absolute left-[226px] top-[431px] w-[550px] h-48">
                            <input
                                ref={inputRef}
                                value={input}
                                // 3) disable native keyboard on narrow + force custom keypad
                                inputMode={isWide ? "numeric" : "none"}
                                readOnly={!isWide}
                                onFocus={(e) => !isWide && (e.target as HTMLInputElement).blur()}
                                onChange={(e) =>
                                    setInput(e.target.value.replace(/\D/g, ""))
                                }
                                className="
                  w-full h-full
                  bg-transparent
                  text-[175px] font-semibold font-['Kantumruy_Pro']
                  text-fig-dark/90 outline-none
                "
                                autoComplete="off"
                            />
                        </div>
                        <button
                            onClick={submit}
                            className="absolute left-[775px] top-[406px] w-64 h-64 flex items-center justify-center text-[175px] font-semibold font-['Kantumruy_Pro'] text-fig-dark/90"
                        >
                            →
                        </button>

                        {/* Feedback */}
                        {feedback && (
                            <div
                                className={clsx(
                                    "absolute left-1/2 -translate-x-1/2 top-[677px] text-6xl font-semibold font-['Kantumruy_Pro'] text-center",
                                    feedback === "correct"
                                        ? "text-fig-muted"
                                        : "text-fig-warn"
                                )}
                            >
                                {feedback === "correct"
                                    ? "Correct!"
                                    : `Wrong! answer: ${prob?.answer}`}
                            </div>
                        )}

                        {/* Countdown */}
                        {sec !== null && (
                            <div
                                className="absolute left-1/2 -translate-x-1/2 top-[809px] text-5xl font-semibold font-['Kantumruy_Pro'] text-fig-dark/80"
                            >
                                press enter or switching in {sec}s…
                            </div>
                        )}

                        {/* Chooser Overlay */}
                        {chooser && (
                            <div className="absolute inset-0 rounded-3xl animate-fade">
                                {/* … chooser overlay content unchanged … */}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
