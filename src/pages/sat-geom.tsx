// pages/sat-geom.tsx
import React, {useState, useEffect, useRef} from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import {GridPattern} from "@/components/GridPattern";

type ProblemType = "area" | "pythag" | "angle" | "random";
type AreaSub = "rect" | "tri" | "circ";
const ri = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const svgWrap = (inner: React.ReactNode) => (
    <div className="flex justify-center -mt-3 sm:mt-0 my-0 sm:my-0.5">
        <svg
            viewBox="0 0 120 90"
            className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] h-auto text-[rgb(var(--foreground))]"
            stroke="currentColor"
            strokeWidth={0.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        >
            {inner}
        </svg>
    </div>
);

const SATGeometryDrill: React.FC = () => {
    const tabs: ProblemType[] = ["area", "pythag", "angle", "random"];
    const [selected, setSelected] = useState<ProblemType>("area");
    const [question, setQuestion] = useState("");
    const [correct, setCorrect] = useState("");
    const [diagram, setDiagram] = useState<React.ReactNode>(null);

    const [inputValue, setInputValue] = useState("");
    const [feedback, setFeedback] = useState("");
    const [history, setHistory] = useState<boolean[]>([]);
    const [totalCount, setTotalCount] = useState(0);

    const [bestTime, setBestTime] = useState<number | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(0);

    const [countdown, setCountdown] = useState(0);
    const [waiting, setWaiting] = useState(false);
    const [dotCount, setDotCount] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const iv = setInterval(() => setDotCount(d => (d + 1) % 4), 500);
        return () => clearInterval(iv);
    }, []);
    useEffect(() => inputRef.current?.focus(), []);
    useEffect(() => setMounted(true), []);
    useEffect(() => {
        const b = localStorage.getItem("best_geometry");
        if (b) setBestTime(parseFloat(b));
    }, []);
    useEffect(() => {
        if (waiting) return;
        const iv = setInterval(() => {
            setCurrentTime((Date.now() - startTime) / 1000);
        }, 50);
        return () => clearInterval(iv);
    }, [startTime, waiting]);

    const generate = () => {
        const kind: ProblemType =
            selected === "random"
                ? (["area", "pythag", "angle"][ri(0, 2)] as ProblemType)
                : selected;

        let q = "", a = "", svg: React.ReactNode = null;

        if (kind === "area") {
            const sub: AreaSub = (["rect", "tri", "circ"][ri(0, 2)] as AreaSub);
            if (sub === "rect") {
                const L = ri(4, 20), W = ri(3, 15);
                q = `Rectangle ${L}×${W}. Find area.`;
                a = `${L * W}`;
                svg = svgWrap(
                    <>
                        <rect x="22" y="22" width="76" height="46"/>
                        <text x="60" y="17" fontSize="7" fontWeight={400} textAnchor="middle">{L}</text>
                        <text x="20" y="45" fontSize="7" fontWeight={400} textAnchor="end">{W}</text>
                    </>
                );
            } else if (sub === "tri") {
                const b = ri(6, 18), h = ri(4, 14);
                q = `Right triangle sides: ${b},${h}. Area?`;
                a = `${(b * h) / 2}`;
                svg = svgWrap(
                    <>
                        <line x1="25" y1="70" x2="95" y2="70"/>
                        <line x1="25" y1="70" x2="25" y2="25"/>
                        <line x1="25" y1="25" x2="95" y2="70"/>
                        <rect x="25" y="62" width="8" height="8"/>
                        <text x="60" y="78" fontSize="7" fontWeight={400} textAnchor="middle">{b}</text>
                        <text x="23" y="45" fontSize="7" fontWeight={400} textAnchor="end">{h}</text>
                    </>
                );
            } else {
                const r = ri(3, 10);
                q = `Circle radius ${r}. Area = ? (π).`;
                a = `${r * r}π`;
                svg = svgWrap(
                    <>
                        <circle cx="60" cy="45" r="30"/>
                        <line x1="60" y1="45" x2="90" y2="45"/>
                        <text x="75" y="40" fontSize="7" fontWeight={400}>{r}</text>
                    </>
                );
            }
        } else if (kind === "pythag") {
            const triples: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17]];
            const [A0, B0, C0] = triples[ri(0, triples.length - 1)];
            const k = ri(1, 3), A = A0 * k, B = B0 * k, C = C0 * k;
            const hide = ["A", "B", "C"][ri(0, 2)];
            if (hide === "A") {
                q = `Leg x, other ${B}, hyp ${C}.`;
                a = `${A}`;
            } else if (hide === "B") {
                q = `Leg ${A}, other x, hyp ${C}.`;
                a = `${B}`;
            } else {
                q = `Legs ${A}&${B}. Hyp?`;
                a = `${C}`;
            }
            svg = svgWrap(
                <>
                    <line x1="20" y1="70" x2="100" y2="70"/>
                    <line x1="20" y1="70" x2="20" y2="20"/>
                    <line x1="20" y1="20" x2="100" y2="70"/>
                    <rect x="20" y="62" width="8" height="8"/>
                    <text x="60" y="78" fontSize="7" fontWeight={400}
                          textAnchor="middle">{hide === "A" ? "x" : A}</text>
                    <text x="18" y="47" fontSize="7" fontWeight={400} textAnchor="end">{hide === "B" ? "x" : B}</text>
                    <text x="68" y="33" fontSize="7" fontWeight={400}>{hide === "C" ? "x" : C}</text>
                </>
            );
        } else {
            const A = ri(30, 65), B = ri(30, 65 - A), C = 180 - A - B;
            q = `Angles: ${A}°,${B}°,x°. Find x.`;
            a = `${C}`;
            svg = svgWrap(
                <>
                    <polygon points="20,70 100,70 60,25"/>
                    <text x="12" y="63" fontSize="7" fontWeight={400}>{A}°</text>
                    <text x="108" y="63" fontSize="7" fontWeight={400} textAnchor="end">{B}°</text>
                    <text x="60" y="21" fontSize="6" fontWeight={300} textAnchor="middle">x°</text>
                </>
            );
        }

        setQuestion(q);
        setCorrect(a);
        setDiagram(svg);
        setInputValue("");
        setFeedback("");
        setWaiting(false);
        setCountdown(0);
        setStartTime(Date.now());
        inputRef.current?.focus();
    };

    useEffect(generate, [selected]);

    const handleSubmit = () => {
        if (waiting) {
            generate();
            return;
        }
        const ok = inputValue.trim() === correct;
        const elapsed = (Date.now() - startTime) / 1000;
        if (ok && (bestTime === null || elapsed < bestTime)) {
            setBestTime(elapsed);
            localStorage.setItem("best_geometry", `${elapsed}`);
        }
        setFeedback(ok ? "Correct!" : `Wrong: ${correct}`);
        setHistory(h => [...h, ok]);
        setTotalCount(c => c + 1);
        setWaiting(true);
        setCountdown(3);
    };

    useEffect(() => {
        if (!waiting) return;
        if (countdown > 0) {
            const t = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
        generate();
    }, [countdown, waiting]);

    const sanitize = (s: string) => s.replace(/[^0-9π\-]/g, "");

    return (
        <>
            <Head><title>SAT Geometry Drill</title></Head>
            <Navbar pageTitle="geometry"/>

            <main className="relative pt-16 flex items-center justify-end min-h-[calc(100vh-4rem)] md:justify-center">
                <GridPattern width={40} height={40} strokeDasharray={0} className="absolute inset-0"/>

                <div className={`relative z-10 mt-6 w-11/12 sm:w-10/12 md:w-1/2 xl:w-5/12
          max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl
          mx-auto bg-[rgb(var(--primary))] dark:bg-[rgb(var(--secondary))]
          text-[rgb(var(--foreground))] p-3 sm:p-5 md:p-8
          rounded-2xl shadow-background transition-all duration-500 ${mounted ? "scale-100" : "scale-105"}`}>

                    <div className="text-right text-sm mb-1">
                        <a href="https://www.khanacademy.org/math/geometry-home"
                           className="underline" target="_blank" rel="noopener noreferrer">
                            Geometry Guide
                        </a>
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-2">
                        {tabs.map(t => (
                            <button key={t} onClick={() => setSelected(t)}
                                    className={`flex-1 min-w-[90px] py-1.5 rounded-lg text-sm font-medium
                  ${selected === t
                                        ? "bg-[rgb(var(--accent))] dark:bg-white dark:text-black"
                                        : "bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))]"}`}>
                                {t === "area" ? "Area" : t === "pythag" ? "Pythag" : t === "angle" ? "Angle" : "Random"}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between text-sm mb-1">
                        <div>Current: {currentTime.toFixed(2)} s</div>
                        <div>Best: {bestTime?.toFixed(2) ?? "--"} s</div>
                    </div>

                    <div className="text-center mb-0">
                        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold">{question}</span>
                    </div>

                    {diagram}

                    <div className="flex items-center justify-center my-2">
                        {totalCount > 3 &&
                            <span className="text-xs text-[rgb(var(--accent))] mr-2">+{totalCount - 3}</span>}
                        {history.slice(-3).map((ok, i) => (
                            <span key={i}
                                  className={`w-5 h-5 rounded-full mr-1 ${ok ? "bg-[rgb(var(--foreground))]" : "border-2 border-[rgb(var(--foreground))]"}`}/>
                        ))}
                    </div>

                    <div className="text-center mb-3 min-h-[1.25rem]">
                        {feedback ? (
                            <>
                                <div className="font-medium">{feedback}</div>
                                {waiting &&
                                    <div className="text-xs text-[rgb(var(--accent))] mt-1">Next in {countdown}s…</div>}
                            </>
                        ) : (
                            <div className="text-sm text-[rgb(var(--accent))]">Waiting{".".repeat(dotCount)}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <input ref={inputRef} type="text" inputMode="numeric"
                               value={inputValue}
                               onChange={e => setInputValue(sanitize(e.target.value))}
                               onKeyDown={e => e.key === "Enter" && handleSubmit()}
                               className="w-full text-center text-2xl font-semibold border-2 border-[rgb(var(--accent))] rounded-lg py-2 bg-transparent focus:outline-none"
                               placeholder="your answer"/>
                    </div>

                    {/* mobile keypad: 4 rows of 3, smaller */}
                    <div className="md:hidden w-full">
                        <div className="grid grid-cols-3 gap-1">
                            {["7", "8", "9"].map(d => (
                                <button key={d} onClick={() => setInputValue(v => v + d)}
                                        className="text-lg bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-1">
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            {["4", "5", "6"].map(d => (
                                <button key={d} onClick={() => setInputValue(v => v + d)}
                                        className="text-lg bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-1">
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            {["1", "2", "3"].map(d => (
                                <button key={d} onClick={() => setInputValue(v => v + d)}
                                        className="text-lg bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg py-1">
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-1">
                            {["Del", ".", "0", "Enter"].map(d => {
                                const isE = d === "Enter";
                                return (
                                    <button key={d} onClick={() => {
                                        if (d === "Del") setInputValue(v => v.slice(0, -1));
                                        else if (d === "Enter") handleSubmit();
                                        else setInputValue(v => v + d);
                                    }}
                                            className={isE
                                                ? "text-lg py-1 bg-[rgb(var(--foreground))] text-[rgb(var(--background))] rounded-lg font-medium"
                                                : "text-lg py-1 bg-[rgb(var(--background))] dark:bg-[rgb(var(--primary))] border border-[rgb(var(--accent))] rounded-lg"}>
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

export default SATGeometryDrill;
