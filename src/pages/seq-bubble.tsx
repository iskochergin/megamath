// pages/seq-bubble.tsx
import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

/* ------------------------------------------------------------------
   1.  Types of sequences generated on‑the‑fly (nothing pre‑baked):
       arithmetic, geometric, Fibonacci‑type, alternating, mixed‑rule
   2.  “Skip” now reveals the correct answer with a soft pop‑in flash;
       ENTER/Next goes on to a brand‑new animated card.
   3.  Pastel colour scheme:
          • default bubbles → calm blue
          • correct state  → pastel green
          • wrong/skip     → pastel red
   4.  Hint drawer (click “Hint ▾” to open) – personalised for every
       sequence.  No rule‑titles cluttering the main card.
   5.  Whole card slides‑out / slides‑in between sequences.
   ------------------------------------------------------------------ */

type SeqKind = "arithmetic" | "geometric" | "fibo" | "alt" | "mixed";

interface GeneratedSeq {
    shown: (number | null)[];
    finalAnswer: number;
    kind: SeqKind;
    hintIndex: number | null;
    hint: string;
}

const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const choice = <T, >(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const MAX_LEN = 6;

/* ---------------- sequence generator ---------------- */
const makeSequence = (): GeneratedSeq => {
    const kind: SeqKind = choice(["arithmetic", "geometric", "fibo", "alt", "mixed"]);
    let seq: number[] = [];
    let hint = "";
    /* helpers */
    const push = (val: number) => {
        if (Math.abs(val) > 8_000) throw new Error("too large");
        seq.push(val);
    };

    try {
        if (kind === "arithmetic") {
            const start = ri(-9, 15);
            const d = choice([ri(1, 7), -ri(1, 7)]);
            for (let i = 0; i < MAX_LEN; i++) push(start + i * d);
            hint = `Add ${d > 0 ? "+" : ""}${d} each time`;
        } else if (kind === "geometric") {
            const start = choice([ri(1, 5), -ri(1, 5)]);
            const r = choice([2, 3, -2]);
            push(start);
            for (let i = 1; i < MAX_LEN; i++) push(seq[i - 1] * r);
            hint = `Multiply by ${r}`;
        } else if (kind === "fibo") {
            push(ri(1, 8));
            push(ri(1, 8));
            while (seq.length < MAX_LEN) push(seq.at(-1)! + seq.at(-2)!);
            hint = "Next = sum of two previous terms";
        } else if (kind === "alt") {
            const a1 = ri(1, 15), d1 = choice([ri(1, 5), -ri(1, 5)]);
            const a2 = ri(1, 15), d2 = choice([ri(1, 5), -ri(1, 5)]);
            for (let i = 0; i < MAX_LEN; i++)
                push(i % 2 === 0 ? a1 + (i / 2) * d1 : a2 + ((i - 1) / 2) * d2);
            hint = "Two interleaved arithmetic sub‑sequences";
        } else {
            // mixed: arithmetic half then geometric
            const start = ri(1, 12), d = ri(1, 5), r = choice([2, 3]);
            push(start);
            for (let i = 1; i < MAX_LEN / 2; i++) push(seq[i - 1] + d);
            for (let i = MAX_LEN / 2; i < MAX_LEN; i++) push(seq[i - 1] * r);
            hint = `First add ${d}, then ×${r}`;
        }
    } catch {
        // regenerate if limits exceeded
        return makeSequence();
    }

    const finalAnswer = seq.at(-1)!;
    const shown = seq.slice(0, -1);
    let hintIndex: number | null = null;
    if (Math.random() < 0.4 && shown.length >= 4 && kind !== "mixed") {
        const idx = ri(1, shown.length - 2);
        shown[idx] = null;
        hintIndex = idx;
    }
    return {shown, finalAnswer, kind, hintIndex, hint};
};

/* ------------------ main component ------------------ */
const SeqBubbleDrill: React.FC = () => {
    /* state */
    const [data, setData] = useState<GeneratedSeq>(makeSequence());
    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [streak, setStreak] = useState(0);
    const bestFromLS = +(localStorage.getItem("seq_best") ?? 0);
    const [bestStreak, setBestStreak] = useState(bestFromLS);

    const [start, setStart] = useState(Date.now());
    const [elapsed, setElapsed] = useState(0);

    const [showHint, setShowHint] = useState(false);
    const [revealed, setRevealed] = useState<"none" | "correct" | "wrong">("none"); // for colour
    const [wait, setWait] = useState(false);
    const [cd, setCd] = useState(0);

    const cardRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* timers */
    useEffect(() => {
        const iv = setInterval(() => setElapsed(((Date.now() - start) / 1000)), 100);
        return () => clearInterval(iv);
    }, [start]);

    /* countdown for auto next */
    useEffect(() => {
        if (!wait) return;
        if (cd > 0) {
            const t = setTimeout(() => setCd(x => x - 1), 1000);
            return () => clearTimeout(t);
        }
        nextSeq();
    }, [wait, cd]);

    /* helpers */
    const nextSeq = () => {
        /* slide out ‑ slide in animation */
        const el = cardRef.current;
        if (el) {
            el.classList.remove("fadeIn");
            el.classList.add("fadeOut");
            setTimeout(() => {
                el.classList.remove("fadeOut");
                void el.offsetWidth;
                setData(makeSequence());
                setInput("");
                setFeedback("");
                setAttempts(0);
                setShowHint(false);
                setRevealed("none");
                setWait(false);
                setStart(Date.now());
                el.classList.add("fadeIn");
                inputRef.current?.focus();
            }, 320);
        }
    };

    const showAnswer = (type: "correct" | "wrong") => {
        setRevealed(type);
        setWait(true);
        setCd(2);
    };

    /* actions */
    const check = () => {
        if (wait) {
            nextSeq();
            return;
        }
        if (input.trim() === "") return;
        const val = +input.trim();
        if (val === data.finalAnswer) {
            setFeedback("✔ Correct");
            setStreak(s => s + 1);
            if (streak + 1 > bestStreak) {
                setBestStreak(streak + 1);
                localStorage.setItem("seq_best", (streak + 1).toString());
            }
            showAnswer("correct");
        } else {
            if (attempts === 0) {
                setFeedback("✖ Try again");
                setAttempts(1);
            } else {
                setFeedback(`Answer: ${data.finalAnswer}`);
                setStreak(0);
                showAnswer("wrong");
            }
        }
    };

    const skip = () => {
        setFeedback(`Answer: ${data.finalAnswer}`);
        setStreak(0);
        showAnswer("wrong");
    };

    /* render helpers */
    const bubbleClass = (missing: boolean) =>
        missing
            ? "border-2 border-dashed border-blue-300 text-blue-600 dark:text-blue-100"
            : "bg-blue-100/60 border border-blue-300 text-blue-800 dark:bg-blue-200/30 dark:text-blue-100";

    const answerBubbleClass =
        revealed === "none"
            ? "border-4 border-dashed border-blue-400"
            : revealed === "correct"
                ? "bg-green-200/60 border-green-400"
                : "bg-rose-200/60 border-rose-400";

    const answerTextColour =
        revealed === "correct"
            ? "text-green-800"
            : revealed === "wrong"
                ? "text-rose-800"
                : "text-blue-800";

    return (
        <>
            <Head><title>Sequence Bubble Drill</title></Head>
            <Navbar pageTitle="sequences"/>
            <main className="relative pt-16 flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <GridPattern width={40} height={40} strokeDasharray={0} className="absolute inset-0"/>

                <div
                    ref={cardRef}
                    className="fadeIn relative z-10 w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-5/12
                     max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
                     bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
                     text-[rgb(var(--foreground))] rounded-2xl shadow-background
                     p-4 sm:p-6 md:p-8 backdrop-blur-md transition">

                    {/* header row */}
                    <div className="flex justify-between items-center text-xs sm:text-sm mb-3">
                        <span>Time: {elapsed.toFixed(1)} s</span>
                        <span>Streak: {streak} (best {bestStreak})</span>
                    </div>

                    {/* hint toggle */}
                    <button
                        onClick={() => setShowHint(h => !h)}
                        className="group flex items-center gap-1 text-sm font-semibold mb-3 mx-auto"
                    >
                        Hint
                        <span className={`transition-transform duration-300 ${showHint ? "rotate-180" : ""}`}>▾</span>
                    </button>

                    {/* hint panel */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out mb-4 ${
                            showHint ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <p className="text-sm leading-snug">{data.hint}</p>
                        {data.hintIndex !== null && (
                            <p className="mt-1 text-xs opacity-70">
                                One inner term is hidden to raise the difficulty.
                            </p>
                        )}
                    </div>

                    {/* title */}
                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-6">
                        Complete the sequence
                    </h2>

                    {/* bubbles */}
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6">
                        {data.shown.map((val, idx) => (
                            <div
                                key={idx}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg select-none
                            bubble animation-pop ${bubbleClass(val === null)}`}
                                style={{animationDelay: `${idx * 0.1}s`}}
                            >
                                {val === null ? "?" : val}
                            </div>
                        ))}

                        {/* answer bubble */}
                        <div
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg
                          animation-pop ${answerBubbleClass}`}
                            style={{animationDelay: `${data.shown.length * 0.1}s`}}
                        >
                            {revealed === "none" ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={input}
                                    onChange={e => setInput(e.target.value.replace(/[^0-9\-]/g, ""))}
                                    onKeyDown={e => e.key === "Enter" && check()}
                                    className="w-full h-full bg-transparent text-center focus:outline-none"
                                />
                            ) : (
                                <span className={`${answerTextColour}`}>{data.finalAnswer}</span>
                            )}
                        </div>
                    </div>

                    {/* feedback */}
                    <div className="min-h-[1.5rem] text-center mb-5">
                        {feedback && (
                            <p
                                className={`font-semibold ${
                                    feedback.startsWith("✔")
                                        ? "text-green-700"
                                        : feedback.startsWith("Answer")
                                            ? "text-rose-700"
                                            : "text-rose-700"
                                }`}
                            >
                                {feedback}
                            </p>
                        )}
                    </div>

                    {/* buttons */}
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={check}
                            className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white font-semibold text-sm transition active:scale-95"
                        >
                            {wait ? "Next" : "Check"}
                        </button>
                        <button
                            onClick={skip}
                            className="px-6 py-2 rounded-lg border border-blue-300 bg-blue-100/40 hover:bg-blue-100/70 text-sm font-semibold transition active:scale-95"
                        >
                            Skip
                        </button>
                    </div>

                    {/* mobile keypad */}
                    <div className="md:hidden mt-6">
                        <div className="grid grid-cols-3 gap-2">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map(k => (
                                <button
                                    key={k}
                                    onClick={() => setInput(v => v + k)}
                                    className="py-2 rounded-lg bg-blue-100/50 border border-blue-300 font-semibold text-lg active:scale-95"
                                >
                                    {k}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button
                                onClick={() => setInput(v => v.slice(0, -1))}
                                className="py-2 rounded-lg bg-blue-100/50 border border-blue-300 font-semibold text-lg active:scale-95"
                            >
                                Del
                            </button>
                            <button
                                onClick={() => setInput(v => (v.startsWith("-") ? v.slice(1) : "-" + v))}
                                className="py-2 rounded-lg bg-blue-100/50 border border-blue-300 font-semibold text-lg active:scale-95"
                            >
                                ±
                            </button>
                            <button
                                onClick={check}
                                className="py-2 rounded-lg bg-blue-500/80 text-white font-semibold text-lg active:scale-95"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* animations & bubble palette */}
            <style jsx>{`
                .animation-pop {
                    animation: pop 0.5s cubic-bezier(0.55, 1.4, 0.4, 1) both;
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
                    0% {
                        transform: translateY(18px) scale(0.96);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }

                @keyframes cardOut {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-14px) scale(0.94);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};

export default SeqBubbleDrill;
