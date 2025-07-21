/* pages/seq-bubble.tsx ------------------------------------------------ */
import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

/* helpers ------------------------------------------------------------ */
type SeqKind =
    | "arithmetic"
    | "geometric"
    | "fibo"
    | "alt"
    | "mixed"
    | "quadratic"
    | "square"
    | "pow2";

interface GeneratedSeq {
    shown: (number | null)[];
    finalAnswer: number;
    kind: SeqKind;
    hintIndex: number | null;
    hint: string;
}

const ri = (a: number, b: number) =>
    Math.floor(Math.random() * (b - a + 1)) + a;
const choice = <T, >(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const MAX_LEN = 6;

/* pastel‑orange palette (unchanging) */
const OR_BG = "hsl(30,100%,85%)"; /* inner fill – dark enough to see numbers */
const OR_BORDER = "hsl(30,100%,55%)";
// const OR_TEXT = "hsl(25,90%,30%)";
const OR_TEXT = "hsl(26,88%,37%)";

const makeSequence = (difficulty = 1): GeneratedSeq => {
    const kinds: SeqKind[] =
        difficulty < 4
            ? ["arithmetic", "geometric", "fibo", "alt"]
            : ["arithmetic", "geometric", "fibo", "alt", "mixed", "quadratic"];
    if (difficulty >= 8) kinds.push("square", "pow2");

    const kind = choice(kinds);
    const seq: number[] = [];
    let hint = "";

    const safe = (v: number) => {
        if (Math.abs(v) > 20_000) throw new Error("overflow");
        seq.push(v);
    };
    const regen = () => makeSequence(difficulty);

    try {
        switch (kind) {
            case "arithmetic": {
                const start = ri(-12, 18);
                const d = choice([ri(1, 4 + difficulty), -ri(1, 4 + difficulty)]);
                for (let i = 0; i < MAX_LEN; i++) safe(start + i * d);
                hint = `Add ${d > 0 ? "+" : ""}${d}`;
                break;
            }
            case "geometric": {
                const start = choice([ri(1, 6), -ri(1, 6)]);
                const rPool = [2, 3];
                if (difficulty >= 4) rPool.push(-2);
                if (difficulty >= 7) rPool.push(4);
                const r = choice(rPool);
                safe(start);
                for (let i = 1; i < MAX_LEN; i++) safe(seq[i - 1] * r);
                hint = `Multiply by ${r}`;
                break;
            }
            case "fibo": {
                safe(ri(1, 9));
                safe(ri(1, 9));
                while (seq.length < MAX_LEN) safe(seq.at(-1)! + seq.at(-2)!);
                hint = "Next = sum of two previous";
                break;
            }
            case "alt": {
                const a1 = ri(1, 15),
                    d1 = choice([ri(1, 4 + difficulty), -ri(1, 4 + difficulty)]);
                const a2 = ri(1, 15),
                    d2 = choice([ri(1, 4 + difficulty), -ri(1, 4 + difficulty)]);
                for (let i = 0; i < MAX_LEN; i++)
                    safe(i % 2 === 0 ? a1 + (i / 2) * d1 : a2 + ((i - 1) / 2) * d2);
                hint = "Two interleaved arithmetic rows";
                break;
            }
            case "mixed": {
                const start = ri(2, 10),
                    d = ri(1, 3 + difficulty),
                    r = choice([2, 3, 4]);
                safe(start);
                for (let i = 1; i < MAX_LEN / 2; i++) safe(seq[i - 1] + d);
                for (let i = MAX_LEN / 2; i < MAX_LEN; i++) safe(seq[i - 1] * r);
                hint = `Add ${d}, then ×${r}`;
                break;
            }
            case "quadratic": {
                const a = ri(1, 3),
                    b = ri(0, 4),
                    c = ri(-3, 3);
                for (let n = 1; n <= MAX_LEN; n++) safe(a * n * n + b * n + c);
                hint = "Quadratic pattern";
                break;
            }
            case "square": {
                const off = ri(0, 3);
                for (let n = 1; n <= MAX_LEN; n++) safe((n + off) ** 2);
                hint = "Perfect squares";
                break;
            }
            case "pow2": {
                const k = ri(1, 3);
                for (let i = 0; i < MAX_LEN; i++) safe(k * 2 ** i);
                hint = "Powers of two";
                break;
            }
        }
    } catch {
        return regen();
    }

    const final = seq.at(-1)!;
    const shown = seq.slice(0, -1) as (number | null)[];
    let hintIndex: number | null = null;

    if (
        kind !== "alt" &&
        shown.length >= 5 &&
        Math.random() < 0.35 &&
        difficulty < 9
    ) {
        const idx = ri(2, shown.length - 2);
        shown[idx] = null;
        hintIndex = idx;
    }
    return {shown, finalAnswer: final, kind, hintIndex, hint};
};

/* component -------------------------------------------------------- */
const SeqBubbleDrill: React.FC = () => {
    const [data, setData] = useState<GeneratedSeq | null>(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const level = Math.min(10, Math.floor(streak / 2));

    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState("");
    const [attempts, setAttempts] = useState(0);

    const [elapsed, setElapsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [revealed, setRevealed] = useState<"none" | "correct" | "wrong">(
        "none"
    );
    const [wait, setWait] = useState(false);
    const [cd, setCd] = useState(0);

    const cardRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* first mount */
    useEffect(() => {
        if (typeof window !== "undefined") {
            setBestStreak(+localStorage.getItem("seq_best")! || 0);
        }
        setData(makeSequence());
    }, []);

    useEffect(() => inputRef.current?.focus(), [data]);

    /* simple timer */
    useEffect(() => {
        const id = setInterval(() => setElapsed((t) => t + 0.12), 120);
        return () => clearInterval(id);
    }, []);

    /* auto next timer */
    useEffect(() => {
        if (!wait) return;
        if (cd > 0) {
            const t = setTimeout(() => setCd((x) => x - 1), 1000);
            return () => clearTimeout(t);
        }
        nextSeq();
    }, [wait, cd]);

    const nextSeq = () => {
        const el = cardRef.current;
        if (!el) return;
        el.classList.remove("fadeIn");
        el.classList.add("fadeOut");
        setTimeout(() => {
            el.classList.remove("fadeOut");
            void el.offsetWidth;
            setData(makeSequence(level));
            setInput("");
            setFeedback("");
            setAttempts(0);
            setShowHint(false);
            setRevealed("none");
            setWait(false);
            setCd(0);
            setElapsed(0);
            el.classList.add("fadeIn");
            inputRef.current?.focus();
        }, 320);
    };

    const finishRound = (ok: boolean) => {
        setRevealed(ok ? "correct" : "wrong");
        setWait(true);
        setCd(2);
    };

    const check = () => {
        if (!data) return;
        if (wait) {
            nextSeq();
            return;
        }
        const val = input.trim() === "" ? NaN : +input.trim();
        const ok = val === data.finalAnswer;
        if (ok) {
            setFeedback("✔ Correct");
            const ns = streak + 1;
            setStreak(ns);
            if (ns > bestStreak) {
                setBestStreak(ns);
                localStorage.setItem("seq_best", String(ns));
            }
            finishRound(true);
        } else if (attempts === 0) {
            setFeedback("✖ Try again");
            setAttempts(1);
        } else {
            setFeedback(`Answer: ${data.finalAnswer}`);
            setStreak(0);
            finishRound(false);
        }
    };

    /* bubble style helper */
    const bubbleCss = (delay: number, dashed?: boolean) => ({
        animationDelay: `${delay}s`,
        background: dashed ? "transparent" : OR_BG,
        border: `4px ${dashed ? "dashed" : "solid"} ${OR_BORDER}`,
        color: OR_TEXT,
    });

    /* fire glow size */
    const glow = level > 0 ? `${(level - 1) * 2 + 4}px` : "0px";

    if (!data) return null;

    return (
        <>
            <Head>
                <title>Sequence Bubble Drill</title>
            </Head>
            <Navbar pageTitle="sequences"/>

            <main className="relative pt-16 flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <GridPattern
                    width={40}
                    height={40}
                    strokeDasharray={0}
                    className="absolute inset-0"
                />

                <div
                    ref={cardRef}
                    className="fadeIn relative z-10 w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-5/12 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-2xl shadow-background backdrop-blur-md p-4 sm:p-6 md:p-8 transition"
                >
                    {/* info row */}
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                        <span>{elapsed.toFixed(1)} s</span>
                        <span>
              Streak {streak} (best {bestStreak}) · Lv {level}
            </span>
                    </div>

                    {/* hint row */}
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setShowHint((h) => !h)} className="pill">
                            Hint
                        </button>
                        <div
                            className={`relative flex-1 overflow-hidden ${
                                showHint ? "max-w-full" : "max-w-0"
                            } transition-[max-width] duration-500`}
                        >
                            {showHint && (
                                <p className="whitespace-nowrap animate-typing text-sm leading-snug">
                                    {data.hint}
                                </p>
                            )}
                        </div>
                    </div>

                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-6">
                        Complete the sequence
                    </h2>

                    {/* bubbles */}
                    <div
                        className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6"
                        style={{
                            filter: glow === "0px" ? "none" : `drop-shadow(0 0 ${glow} rgba(255,80,0,0.55))`,
                        }}
                    >
                        {data.shown.map((v, i) => (
                            <div
                                key={i}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg animation-pop"
                                style={bubbleCss(i * 0.1, v === null)}
                            >
                                {v === null ? "?" : v}
                            </div>
                        ))}

                        {/* answer bubble */}
                        <div
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center animation-pop"
                            style={bubbleCss(data.shown.length * 0.1, revealed === "none")}
                        >
                            {revealed === "none" ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={input}
                                    onChange={(e) =>
                                        setInput(e.target.value.replace(/[^0-9\-]/g, ""))
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && check()}
                                    className="w-full h-full bg-transparent text-center font-bold text-lg focus:outline-none"
                                />
                            ) : (
                                <span className="font-bold text-lg">{data.finalAnswer}</span>
                            )}
                        </div>
                    </div>

                    {/* feedback */}
                    {feedback && (
                        <div className="text-center mb-5 min-h-[1.5rem]">
                            <p
                                className={
                                    feedback.startsWith("✔")
                                        ? "text-green-700 font-semibold dark:text-green-400"
                                        : "text-rose-700 font-semibold dark:text-rose-400"
                                }
                            >
                                {feedback}
                            </p>
                        </div>
                    )}

                    {/* control */}
                    <div className="flex justify-center">
                        <button onClick={check} className="pill">
                            {wait ? "Next" : "Check"}
                        </button>
                    </div>

                    {/* keypad mobile */}
                    <div className="md:hidden mt-6">
                        <div className="grid grid-cols-3 gap-2">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
                                <button key={d} onClick={() => setInput((v) => v + d)} className="key">
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button
                                onClick={() => setInput((v) => v.slice(0, -1))}
                                className="key"
                            >
                                Del
                            </button>
                            <button
                                onClick={() =>
                                    setInput((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))
                                }
                                className="key"
                            >
                                ±
                            </button>
                            <button onClick={check} className="key enter">
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* css‑in‑js --------------------------------------------------- */}
            <style jsx>{`
                /* pills & keys */
                .pill {
                    padding: 0.4rem 0.9rem;
                    border-radius: 0.4rem;
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.06);
                    color: rgb(var(--foreground));
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: background 0.2s;
                }

                .pill:hover {
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.15);
                }

                .key {
                    padding: 0.55rem 0;
                    border-radius: 0.38rem;
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.06);
                    border: 1px solid rgba(var(--foreground-rgb, 0, 0, 0), 0.25);
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: rgb(var(--foreground));
                }

                .key.enter {
                    background: rgba(var(--foreground-rgb, 0, 0, 0), 0.15);
                    color: rgb(var(--background));
                }

                /* pop */
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

                /* card fade */
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

                /* typing */
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
            `}</style>
        </>
    );
};

export default SeqBubbleDrill;
