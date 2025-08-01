import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

const OR_BG = "hsl(28,100%,84%)";
const OR_BORDER = "hsl(30,100%,55%)";
const OR_TEXT = "hsl(26,86%,36%)";

type Shape = "▲" | "◼" | "●";

interface RebusRound {
    lines: string[];
    answerShape: Shape;
    answerValue: number;
    hint: string;
}

const shapes: Shape[] = ["▲", "◼", "●"];
const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

/** Inline SVG icon so all shapes are the same visual size and align with text. */
const ShapeIcon: React.FC<{ shape: Shape; className?: string }> = ({shape, className}) => {
    return (
        <svg
            className={className ?? ""}
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            {shape === "▲" && <polygon points="12,3 21,19 3,19"/>}
            {shape === "◼" && <rect x="4" y="4" width="16" height="16" rx="2"/>}
            {shape === "●" && <circle cx="12" cy="12" r="9"/>}
        </svg>
    );
};

/** Render a line, replacing text shapes with uniform SVG icons. */
const renderLine = (ln: string) => {
    const parts = ln.split(/(▲|◼|●)/g);
    return parts.map((p, i) => {
        if (p === "▲" || p === "◼" || p === "●") {
            return <ShapeIcon key={i} shape={p as Shape} className="eq-icon"/>;
        }
        return (
            <span key={i} className="eq-text">
        {p}
      </span>
        );
    });
};

/** Build solvable two‑equation rebus (always unique solution). */
const buildRebus = (level = 1): RebusRound => {
    const [a, b] = shapes.sort(() => 0.5 - Math.random()).slice(0, 2);
    const target = Math.random() < 0.5 ? a : b;

    const va = ri(1, 4 + level * 2);
    let vb = ri(1, 4 + level * 2);
    if (vb === va) vb++;

    const sum = va + vb;
    let eq2 = "", hint = "";

    if (level < 4) {
        const diff = va - vb;
        eq2 = diff >= 0 ? `${a} − ${b} = ${diff}` : `${b} − ${a} = ${-diff}`;
        hint = "Add and subtract the two equations.";
    } else if (level < 7) {
        eq2 = `2 × ${a} = ${2 * va}`;
        hint = "Find " + a + " from the doubling equation first.";
    } else {
        const prod = va * vb;
        eq2 = `${a} × ${b} = ${prod}`;
        hint = "Use multiplication & addition together.";
    }

    const lines = [`${a} + ${b} = ${sum}`, eq2];
    return {lines, answerShape: target, answerValue: target === a ? va : vb, hint};
};

/* ── component ────────────────────────────────────────────────────── */
const RebusDrill: React.FC = () => {
    const [round, setRound] = useState<RebusRound | null>(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const level = Math.min(10, 1 + Math.floor(streak / 2));

    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState("");
    const [elapsed, setElapsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [wait, setWait] = useState(false);
    const [cd, setCd] = useState(0);

    const cardRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* mount */
    useEffect(() => {
        if (typeof window !== "undefined") {
            setBestStreak(+localStorage.getItem("rebus_best")! || 0);
        }
        setRound(buildRebus());
    }, []);

    useEffect(() => inputRef.current?.focus(), [round]);

    /* timers */
    useEffect(() => {
        const id = setInterval(() => setElapsed((t) => t + 0.12), 120);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!wait) return;
        if (cd > 0) {
            const t = setTimeout(() => setCd((x) => x - 1), 1000);
            return () => clearTimeout(t);
        }
        nextRound();
    }, [wait, cd]);

    const nextRound = () => {
        const el = cardRef.current;
        if (!el) return;
        el.classList.remove("fadeIn");
        el.classList.add("fadeOut");
        setTimeout(() => {
            el.classList.remove("fadeOut");
            void el.offsetWidth;
            setRound(buildRebus(level));
            setInput("");
            setFeedback("");
            setShowHint(false);
            setWait(false);
            setCd(0);
            setElapsed(0);
            el.classList.add("fadeIn");
            inputRef.current?.focus();
        }, 320);
    };

    const finish = (ok: boolean) => {
        setWait(true);
        setCd(2);
        setFeedback(ok ? "✔ Correct" : `Answer: ${round!.answerValue}`);
    };

    const check = () => {
        if (!round || wait) return;
        const ok = +input.trim() === round.answerValue;
        if (ok) {
            const ns = streak + 1;
            setStreak(ns);
            if (ns > bestStreak) {
                setBestStreak(ns);
                localStorage.setItem("rebus_best", String(ns));
            }
        } else {
            setStreak(0);
        }
        finish(ok);
    };

    const addDigit = (d: string) => setInput((v) => v + d);

    if (!round) return null;

    const glow = level > 1 ? `${(level - 1) * 2 + 4}px` : "0px";
    const bubbleCss: React.CSSProperties = {
        background: OR_BG,
        border: `4px solid ${OR_BORDER}`,
        color: OR_TEXT,
        filter: glow === "0px" ? "none" : `drop-shadow(0 0 ${glow} rgba(255,80,0,0.55))`,
    };

    return (
        <>
            <Head>
                <title>Rebus Drill</title>
            </Head>
            <Navbar pageTitle="rebus"/>

            <main className="relative pt-16 flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <GridPattern width={40} height={40} strokeDasharray={0} className="absolute inset-0"/>

                <div
                    ref={cardRef}
                    className={`fadeIn relative z-10 mt-4
            w-11/12 sm:w-11/12 md:w-8/12 lg:w-7/12 xl:w-1/2
            max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
            bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
            text-[rgb(var(--foreground))]
            rounded-2xl shadow-background backdrop-blur-md
            p-4 sm:p-6 md:py-12 md:px-10 transition-all duration-300 ease-in-out`}
                >
                    {/* info */}
                    <div className="flex justify-between text-[12px] sm:text-base mb-3 sm:mb-4">
                        <span>{elapsed.toFixed(1)} s</span>
                        <span>Streak {streak} (best {bestStreak}) · Lv {level}</span>
                    </div>

                    {/* hint */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                        <button onClick={() => setShowHint((h) => !h)} className="pill xs-pill">
                            Hint
                        </button>
                        <div
                            className={`relative flex-1 overflow-hidden ${
                                showHint ? "max-w-full" : "max-w-0"
                            } transition-[max-width] duration-500`}
                        >
                            {showHint && (
                                <p className="whitespace-nowrap animate-typing text-sm sm:text-base leading-snug">
                                    {round.hint}
                                </p>
                            )}
                        </div>
                    </div>

                    <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8">
                        Solve the rebus
                    </h2>

                    {/* equations */}
                    <div className="flex flex-col items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                        {round.lines.map((ln, i) => (
                            <div
                                key={i}
                                /* same size as the answer oval */
                                className="equation leading-none w-32 h-14 sm:w-36 sm:h-16 rounded-full flex items-center justify-center font-semibold text-xl sm:text-xl animation-pop"
                                style={{...bubbleCss, animationDelay: `${i * 0.1}s`}}
                            >
                                {renderLine(ln)}
                            </div>
                        ))}

                        {/* answer (reference size) */}
                        <div
                            className="ans-bubble leading-none w-32 h-14 sm:w-36 sm:h-16 rounded-full flex items-center justify-center animation-pop"
                            style={{...bubbleCss, animationDelay: "0.25s"}}
                        >
              <span className="mr-2 inline-flex items-center sm:text-xl leading-none font-semibold text-xl">
                <ShapeIcon shape={round.answerShape} className="eq-icon"/>
                <span className="ml-1 eq-text">=</span>
              </span>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="numeric"
                                value={input}
                                onChange={(e) => setInput(e.target.value.replace(/[^0-9\-]/g, ""))}
                                onKeyDown={(e) => e.key === "Enter" && check()}
                                className="answerInput w-14 sm:w-16 bg-transparent text-center font-bold text-xl sm:text-xl focus:outline-none leading-none"
                            />
                        </div>
                    </div>

                    {/* feedback */}
                    {feedback && (
                        <div className="text-center mb-5 sm:mb-6 min-h-[1.5rem]">
                            <p
                                className={
                                    (feedback.startsWith("✔")
                                        ? "text-green-700 dark:text-green-400 "
                                        : "text-rose-700 dark:text-rose-400 ") + "font-semibold text-base sm:text-lg"
                                }
                            >
                                {feedback}
                            </p>
                        </div>
                    )}

                    {/* desktop check */}
                    <div className="hidden md:flex justify-center">
                        <button onClick={check} className="pill">
                            {wait ? "Next" : "Check"}
                        </button>
                    </div>

                    {/* mobile keypad */}
                    <div className="md:hidden w-full">
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
                                <button key={d} onClick={() => addDigit(d)} className="key xs-key">
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                            <button onClick={() => setInput((v) => v.slice(0, -1))} className="key xs-key">
                                Del
                            </button>
                            <button onClick={() => addDigit("0")} className="key xs-key">
                                0
                            </button>
                            <button
                                onClick={check}
                                className="px-3 py-2 sm:px-4 rounded-lg bg-black dark:bg-white text-white dark:text-black font-semibold active:scale-95 transition"
                            >
                                {wait ? "Next" : "Check"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* STYLE (alignment fixes + keep previous styles) */}
            <style jsx>{`
                .pill {
                    padding: 0.45rem 1rem;
                    border-radius: 0.45rem;
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.07);
                    color: rgb(var(--foreground));
                    font-weight: 600;
                    transition: background 0.2s;
                    font-size: 0.95rem;
                }

                .pill:hover {
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.16);
                }

                .key {
                    padding: 0.75rem 0;
                    border-radius: 0.38rem;
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.07);
                    border: 1px solid rgba(var(--foreground-rgb), 0.15);
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: rgb(var(--foreground));
                }

                .equation, .ans-bubble {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    line-height: 1;
                }

                .eq-text {
                    display: inline-block;
                    vertical-align: middle;
                    font-variant-numeric: tabular-nums;
                }

                .eq-icon {
                    display: inline-block;
                    vertical-align: middle;
                    width: 1.25em;
                    height: 1.25em;
                    //transform: translateY(-0.5em); /* lift icons to sit perfectly centered */
                }

                /* pop / fade / typing keyframes */
                .animation-pop {
                    animation: pop 0.47s cubic-bezier(0.55, 1.4, 0.4, 1) both;
                }

                @keyframes pop {
                    0% {
                        transform: scale(0.4) translateY(12px);
                        opacity: 0;
                    }
                    60% {
                        transform: scale(1.08);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .fadeIn {
                    animation: cardIn 0.35s ease both;
                }

                .fadeOut {
                    animation: cardOut 0.3s ease forwards;
                }

                @keyframes cardIn {
                    from {
                        transform: translateY(18px) scale(0.96);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                @keyframes cardOut {
                    from {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    to {
                        transform: translateY(-14px) scale(0.94);
                        opacity: 0;
                    }
                }

                @keyframes typing {
                    from {
                        clip-path: inset(0 100% 0 0);
                    }
                    to {
                        clip-path: inset(0 0 0 0);
                    }
                }

                .animate-typing {
                    animation: typing 1.3s steps(38, end) forwards;
                }

                /* xs‑only keypad sizing kept */
                @media (max-width: 380px) {
                    .xs-pill {
                        padding: 0.35rem 0.8rem;
                        border-radius: 0.4rem;
                        font-size: 0.95rem;
                    }

                    .xs-key {
                        padding: 0.6rem 0;
                        font-size: 1.1rem;
                        border-radius: 0.34rem;
                    }

                    .answerInput {
                        width: 2.5rem;
                        font-size: 1rem;
                    }
                }
            `}</style>
        </>
    );
};

export default RebusDrill;
