/* ── pages/seq-bubble.tsx ────────────────────────────────────────── */
import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

/* helpers */
type SeqKind = "arithmetic" | "geometric" | "fibo" | "alt" | "mixed";

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

const makeSequence = (difficulty = 1): GeneratedSeq => {
    const kind: SeqKind = choice([
        "arithmetic",
        "geometric",
        "fibo",
        "alt",
        "mixed",
    ]);
    const seq: number[] = [];
    let hint = "";

    const safePush = (v: number) => {
        if (Math.abs(v) > 12_000) throw new Error("too large");
        seq.push(v);
    };
    const regen = () => makeSequence(difficulty);

    try {
        if (kind === "arithmetic") {
            const start = ri(-12, 18);
            const d = choice([ri(1, 5 + difficulty), -ri(1, 5 + difficulty)]);
            for (let i = 0; i < MAX_LEN; i++) safePush(start + i * d);
            hint = `Add ${d > 0 ? "+" : ""}${d} each time`;
        } else if (kind === "geometric") {
            const start = choice([ri(1, 6), -ri(1, 6)]);
            const r = choice([2, 3, -2, difficulty > 3 ? 4 : 2]);
            safePush(start);
            for (let i = 1; i < MAX_LEN; i++) safePush(seq[i - 1] * r);
            hint = `Multiply by ${r}`;
        } else if (kind === "fibo") {
            safePush(ri(1, 9));
            safePush(ri(1, 9));
            while (seq.length < MAX_LEN) safePush(seq.at(-1)! + seq.at(-2)!);
            hint = "Term = sum of two previous";
        } else if (kind === "alt") {
            const a1 = ri(1, 20),
                d1 = choice([ri(1, 5 + difficulty), -ri(1, 5 + difficulty)]);
            const a2 = ri(1, 20),
                d2 = choice([ri(1, 5 + difficulty), -ri(1, 5 + difficulty)]);
            for (let i = 0; i < MAX_LEN; i++)
                safePush(i % 2 === 0 ? a1 + (i / 2) * d1 : a2 + ((i - 1) / 2) * d2);
            hint = "Two interleaved arithmetic rows";
        } else {
            const start = ri(2, 10),
                d = ri(1, 4 + difficulty),
                r = choice([2, 3, 4]);
            safePush(start);
            for (let i = 1; i < MAX_LEN / 2; i++) safePush(seq[i - 1] + d);
            for (let i = MAX_LEN / 2; i < MAX_LEN; i++) safePush(seq[i - 1] * r);
            hint = `First +${d}, then ×${r}`;
        }
    } catch {
        return regen();
    }

    const finalAnswer = seq.at(-1)!;
    const shown: (number | null)[] = seq.slice(0, -1);
    let hintIndex: number | null = null;

    if (
        kind !== "alt" && // never hide inside overlay sequence
        shown.length >= 5 &&
        Math.random() < 0.35
    ) {
        const idx = ri(2, shown.length - 2); // keep first two visible
        shown[idx] = null;
        hintIndex = idx;
    }

    return {shown, finalAnswer, kind, hintIndex, hint};
};

/* component */
const SeqBubbleDrill: React.FC = () => {
    const [data, setData] = useState<GeneratedSeq | null>(null);
    const [level, setLevel] = useState(1);
    const [flash, setFlash] = useState(false);

    const [input, setInput] = useState("");
    const [feedback, setFeedback] = useState("");
    const [attempts, setAttempts] = useState(0);

    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    const [start, setStart] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    const [showHint, setShowHint] = useState(false);
    const [revealed, setRevealed] = useState<"none" | "correct" | "wrong">(
        "none"
    );
    const [wait, setWait] = useState(false);
    const [cd, setCd] = useState(0);

    const cardRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    /* hydrate / first load */
    useEffect(() => {
        if (typeof window !== "undefined") {
            setBestStreak(+localStorage.getItem("seq_best")! || 0);
        }
        const first = makeSequence();
        setData(first);
        setStart(Date.now());
    }, []);

    useEffect(() => {
        if (data) inputRef.current?.focus();
    }, [data]);

    /* timer */
    useEffect(() => {
        if (!start) return;
        const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 120);
        return () => clearInterval(id);
    }, [start]);

    /* auto next */
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
            const harder = Math.min(8, 1 + Math.floor(streak / 4));
            if (harder > level) {
                setFlash(true);
                setTimeout(() => setFlash(false), 900);
            }
            setLevel(harder);
            setData(makeSequence(harder));
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
        const correct = val === data.finalAnswer;
        if (correct) {
            setFeedback("✔ Correct");
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > bestStreak) {
                setBestStreak(newStreak);
                if (typeof window !== "undefined")
                    localStorage.setItem("seq_best", String(newStreak));
            }
            finishRound(true);
        } else if (attempts === 0) {
            setFeedback("✖ Try again");
            setAttempts(1);
        } else {
            setFeedback(`Answer: ${data.finalAnswer}`);
            setStreak(0);
            finishRound(false);
        }
    };

    const answerBubbleClass =
        revealed === "none"
            ? "border-4 border-dashed border-blue-300"
            : revealed === "correct"
                ? "bg-green-200/60 border-green-400"
                : "bg-rose-200/60 border-rose-400";

    const answerNode =
        revealed === "none" ? (
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^0-9\-]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && check()}
                className="w-full h-full bg-transparent text-center font-bold text-lg focus:outline-none"
            />
        ) : (
            <span className="font-bold text-lg">{data?.finalAnswer}</span>
        );

    const addDigit = (d: string) => setInput((v) => v + d);

    if (!data) return null;

    /* card css */
    const cardClass = `
      fadeIn relative z-10 w-11/12 sm:w-10/12 md:w-2/3 lg:w-1/2 xl:w-5/12
      max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
      bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
      text-[rgb(var(--foreground))] rounded-2xl shadow-background backdrop-blur-md
      p-4 sm:p-6 md:p-8 transition
      ${flash ? "ring-4 ring-orange-300/60" : ""}
  `;

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
                <div ref={cardRef} className={cardClass}>
                    {/* header */}
                    <div className="flex justify-between text-xs sm:text-sm mb-3">
                        <span>Time {elapsed.toFixed(1)} s</span>
                        <span>
              Streak {streak} (best {bestStreak}) · Lv {level}
            </span>
                    </div>

                    {/* hint row */}
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setShowHint(h => !h)}
                            className="hint-btn"
                        >
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


                    {/* title */}
                    <h2 className="text-center text-2xl sm:text-3xl font-extrabold mb-6">
                        Complete the sequence
                    </h2>

                    {/* bubbles */}
                    <div
                        className={
                            "flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 " +
                            (flash ? "flame" : "")
                        }
                    >
                        {data.shown.map((v, i) => (
                            <div
                                key={i}
                                className={
                                    "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-bold text-lg animation-pop " +
                                    (v === null
                                        ? "border-2 border-dashed border-blue-300 text-blue-600"
                                        : "bg-blue-100/60 border border-blue-300 text-blue-800")
                                }
                                style={{animationDelay: `${i * 0.1}s`}}
                            >
                                {v === null ? "?" : v}
                            </div>
                        ))}

                        <div
                            className={
                                "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center animation-pop " +
                                answerBubbleClass
                            }
                            style={{animationDelay: `${data.shown.length * 0.1}s`}}
                        >
                            {answerNode}
                        </div>
                    </div>

                    {/* feedback */}
                    <div className="min-h-[1.5rem] text-center mb-5">
                        {feedback && (
                            <p
                                className={
                                    feedback.startsWith("✔")
                                        ? "text-green-700 font-semibold"
                                        : feedback.startsWith("Answer")
                                            ? "text-rose-700 font-semibold"
                                            : "text-rose-700 font-semibold"
                                }
                            >
                                {feedback}
                            </p>
                        )}
                    </div>

                    {/* controls */}
                    <div className="flex justify-center">
                        <button
                            onClick={check}
                            className="px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white font-semibold text-sm active:scale-95 transition"
                        >
                            {wait ? "Next" : "Check"}
                        </button>
                    </div>

                    {/* keypad mobile */}
                    <div className="md:hidden mt-6">
                        <div className="grid grid-cols-3 gap-2">
                            {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
                                <button
                                    key={d}
                                    onClick={() => addDigit(d)}
                                    className="py-2 rounded-lg bg-blue-100/50 border border-blue-300 font-semibold text-lg active:scale-95"
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <button
                                onClick={() => setInput((v) => v.slice(0, -1))}
                                className="py-2 rounded-lg bg-blue-100/50 border border-blue-300 font-semibold text-lg active:scale-95"
                            >
                                Del
                            </button>
                            <button
                                onClick={() =>
                                    setInput((v) => (v.startsWith("-") ? v.slice(1) : "-" + v))
                                }
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

            {/* css in js */}
            <style jsx>{`
                /* pop‑in */
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

                /* card fade */
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

                /* hint animations */
                .hint-btn {
                    display: inline-block;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    background-color: rgba(var(--foreground-rgb), 0.05); /* always‑visible tint */
                    color: rgb(var(--foreground));
                    font-size: 0.875rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }

                .hint-btn:hover {
                    background-color: rgba(var(--foreground-rgb), 0.15); /* brighter on hover */
                }

                .hint-btn.active {
                    color: rgb(var(--foreground));
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
                    animation: typing 1.4s steps(40, end) forwards;
                }

                /* level‑up flame */
                .flame > div {
                    position: relative;
                }

                .flame > div::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 9999px;
                    border: 3px solid rgba(255, 138, 0, 0.45);
                    animation: blaze 0.9s ease-out forwards;
                    pointer-events: none;
                }

                @keyframes blaze {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.25);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};

export default SeqBubbleDrill;
