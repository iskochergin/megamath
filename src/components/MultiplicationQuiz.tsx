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

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */
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
        case "2-digit":
            return (() => {
                const a = p(2),
                    b = p(2);
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
        case "3-digit":
            return (() => {
                const a = p(3),
                    b = p(3);
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
        case "2x3":
            return (() => {
                const a = p(2),
                    b = p(3);
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
        case "3x4":
            return (() => {
                const a = p(3),
                    b = p(4);
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
        case "4x4":
            return (() => {
                const a = p(4),
                    b = p(4);
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
        case "random":
            return (() => {
                const a = p(rand(2, 4)),
                    b = p(rand(2, 4));
                return {a, b, text: `${a}×${b}`, answer: a * b};
            })();
    }
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MultiplicationQuiz() {
    /* ---- state ----------------------------------------------------- */
    const [mode, setMode] = useState<Mode>("2-digit");
    const [prob, setProb] = useState<Prob | null>(null); // build AFTER mount
    const [input, setInput] = useState("");
    const [sec, setSec] = useState(10);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [chooser, setChooser] = useState(false);

    const timer = useRef<NodeJS.Timeout | null>(null);
    const tick = useRef<NodeJS.Timeout | null>(null);

    /* ---- perfect 4 : 3 scaling ------------------------------------- */
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const calc = () =>
            setScale(Math.min(window.innerWidth / 2400, window.innerHeight / 1800, 1));
        calc();
        window.addEventListener("resize", calc);
        return () => window.removeEventListener("resize", calc);
    }, []);

    /* ---- helpers --------------------------------------------------- */
    const prepare = useCallback(
        (newMode: Mode = mode) => {
            setProb(build(newMode));
            setInput("");
            setSec(10);
            setFeedback(null);

            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);

            tick.current = setInterval(
                () => setSec((s) => (s > 0 ? s - 1 : 0)),
                1_000
            );
            timer.current = setTimeout(() => submit(true), 10_000);
        },
        [mode]
    );

    const submit = useCallback(
        (auto = false) => {
            if (!prob) return;
            const val = parseInt(input.trim(), 10);
            if (!auto && val === prob.answer) {
                prepare();
                return;
            }
            setFeedback(
                auto
                    ? `time’s up! answer: ${prob.answer}`
                    : `wrong! answer: ${prob.answer}`
            );
            setTimeout(() => prepare(), 1_400);
        },
        [input, prob, prepare]
    );

    /* ---- first problem only in browser ----------------------------- */
    useEffect(() => {
        prepare("2-digit");
        return () => {
            if (timer.current) clearTimeout(timer.current);
            if (tick.current) clearInterval(tick.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ---- Enter key -------------------------------------------------- */
    useEffect(() => {
        const h = (e: KeyboardEvent) => e.key === "Enter" && submit(false);
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [submit]);

    /* ---- highlight bar position ------------------------------------ */
    const idx = ["2-digit", "3-digit", "other"].indexOf(
        mode === "2-digit" || mode === "3-digit" ? mode : "other"
    );
    const highlightLeft = 175 + idx * 288; // 288 px = w-72

    /* ---------------------------------------------------------------- */
    /*  render                                                          */
    /* ---------------------------------------------------------------- */
    return (
        <>
            <Head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600&display=swap"
                    rel="stylesheet"
                />
                <title>Math drill</title>
            </Head>

            {/* ---------- centred & scaled wrapper ---------- */}
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div
                    style={
                        {
                            width: 1200,
                            height: 900,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                        } as CSSProperties
                    }
                    className="relative rounded-3xl"
                >
                    {/* ===================================================== */}
                    {/* COUNT frame                                           */}
                    {/* ===================================================== */}
                    <div
                        data-layer="count"
                        className="Count w-[1200px] h-[900px] relative rounded-3xl"
                    >
                        <div
                            data-layer="Rectangle 1"
                            className="Rectangle1 absolute inset-0 bg-fig-bg rounded-3xl"
                        />

                        {/* ----- top bar ----- */}
                        <div
                            data-layer="Rectangle 7"
                            className="Rectangle7 w-[850px] h-24 left-[175px] top-[31px] absolute bg-fig-dark rounded-3xl"
                        />
                        <div
                            data-layer="Rectangle 8"
                            style={{left: highlightLeft, transition: "left .25s"}}
                            className="Rectangle8 w-72 h-24 absolute bg-fig-muted rounded-3xl"
                        />

                        {/* choices */}
                        <button
                            onClick={() => {
                                setMode("2-digit");
                                prepare("2-digit");
                            }}
                            className={clsx(
                                "Digit absolute left-[229px] top-[44px] text-center text-6xl font-semibold font-['Kantumruy_Pro']",
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
                                "Digit absolute left-[504px] top-[46px] text-center text-6xl font-semibold font-['Kantumruy_Pro']",
                                mode === "3-digit" ? "text-fig-dark" : "text-gray-400"
                            )}
                        >
                            3-digit
                        </button>
                        <button
                            onClick={() => setChooser(true)}
                            className={clsx(
                                "Other absolute left-[811px] top-[44px] text-center text-6xl font-semibold font-['Kantumruy_Pro']",
                                chooser ? "text-fig-dark" : "text-gray-400"
                            )}
                        >
                            other
                        </button>

                        {/* problem text */}
                        <div
                            data-layer="12×24"
                            className="24 left-[360px] top-[199px] absolute text-fig-dark/90 text-[175px] font-semibold font-['Kantumruy_Pro']"
                        >
                            {prob ? prob.text : ""}
                        </div>

                        {/* input background */}
                        <div
                            data-layer="Rounded rectangle"
                            className="RoundedRectangle w-[850px] h-64 left-[175px] top-[406px] absolute bg-fig-muted rounded-3xl"
                        />

                        {/* numeric input */}
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                            inputMode="numeric"
                            className="w-[550px] h-48 left-[226px] top-[431px] absolute bg-transparent text-fig-dark/90 text-[175px] font-semibold font-['Kantumruy_Pro'] outline-none"
                        />

                        {/* arrow button */}
                        <button
                            onClick={() => submit(false)}
                            aria-label="submit"
                            className="w-64 h-64 left-[775px] top-[406px] absolute flex items-center justify-center text-fig-dark/90 text-[175px] font-semibold font-['Kantumruy_Pro']"
                        >
                            →
                        </button>

                        {/* feedback */}
                        {feedback && (
                            <div
                                data-layer="wrong"
                                className="WrongAnswer288 w-[618px] h-20 left-[282px] top-[677px] absolute text-center text-fig-warn text-6xl font-semibold font-['Kantumruy_Pro']"
                            >
                                {feedback}
                            </div>
                        )}

                        {/* countdown */}
                        <div
                            data-layer="press"
                            className="PressEnterToMoveOnSwitchingIn10s left-[144px] top-[809px] absolute text-center text-fig-dark/80 text-5xl font-semibold font-['Kantumruy_Pro']"
                        >
                            press enter to move on,&nbsp;switching in {sec}s…
                        </div>
                    </div>

                    {/* ===================================================== */}
                    {/* CHOOSE overlay                                        */}
                    {/* ===================================================== */}
                    {chooser && (
                        <div
                            data-layer="choose"
                            className="Choose absolute inset-0 w-[1200px] h-[900px] rounded-3xl animate-fade"
                        >
                            <div className="Rectangle4 absolute inset-0 bg-fig-bg rounded-3xl"/>
                            <div
                                className="RoundedRectangle absolute left-[304px] top-[162px] w-[593px] h-[512px] bg-fig-dark rounded-3xl"/>
                            <div
                                className="Rectangle5 absolute left-[175px] top-[28px] w-[850px] h-24 bg-fig-dark rounded-3xl"/>
                            <div
                                className="Rectangle6 absolute left-[755px] top-[28px] w-64 h-24 bg-fig-muted rounded-3xl"/>

                            {/* static labels */}
                            <div
                                className="Digit absolute left-[229px] top-[41px] text-gray-400 text-6xl font-semibold font-['Kantumruy_Pro']">
                                2-digit
                            </div>
                            <div
                                className="Digit absolute left-[504px] top-[43px] text-gray-400 text-6xl font-semibold font-['Kantumruy_Pro']">
                                3-digit
                            </div>
                            <button
                                onClick={() => setChooser(false)}
                                className="Other absolute left-[811px] top-[41px] text-fig-dark text-6xl font-semibold font-['Kantumruy_Pro']"
                            >
                                other
                            </button>

                            {/* choices inside dark box */}
                            {([
                                ["2x3", "2-digit × 3-digit", 207],
                                ["3x4", "3-digit × 4-digit", 324],
                                ["4x4", "4-digit × 4-digit", 441],
                                ["random", "random", 558],
                            ] as [Extra, string, number][]).map(([k, label, top]) => (
                                <button
                                    key={k}
                                    onClick={() => {
                                        setMode(k);
                                        setChooser(false);
                                        prepare(k);
                                    }}
                                    className="absolute left-[372px] text-fig-muted hover:text-white transition-colors text-6xl font-semibold font-['Kantumruy_Pro']"
                                    style={{top}}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
