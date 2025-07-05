import React, {
    useState,
    useEffect,
    useCallback,
    useContext,
    useRef,
} from "react";
import Header from "../components/Header";
import DigitSelector from "../components/DigitSelector";
import ProblemDisplay from "../components/ProblemDisplay";
import {LanguageContext} from "@/context/LanguageContext";
import {IoCheckmarkCircle, IoCloseCircle} from "react-icons/io5";

const ui = {
    en: {solver: "Fast Math Solver", next: "Next"},
    ru: {solver: "Быстрый Решатель", next: "Далее"},
};

export default function MathPage() {
    const {language} = useContext(LanguageContext);

    // state
    const [digits, setDigits] = useState(2);
    const [a, setA] = useState(0);
    const [b, setB] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<"" | "correct" | "incorrect">("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState("0.00");
    const [history, setHistory] = useState<boolean[]>([]);

    // ref for auto-focus
    const inputRef = useRef<HTMLInputElement>(null);

    // new problem generator
    const newProblem = useCallback(() => {
        const min = 10 ** (digits - 1),
            max = 10 ** digits - 1;
        setA(Math.floor(Math.random() * (max - min + 1)) + min);
        setB(Math.floor(Math.random() * (max - min + 1)) + min);
        setAnswer("");
        setFeedback("");
        setStartTime(Date.now());
    }, [digits]);

    // on mount & digits change
    useEffect(() => {
        newProblem();
    }, [newProblem]);

    // auto-focus on new problem
    useEffect(() => {
        inputRef.current?.focus();
    }, [a, b]);

    // timer
    useEffect(() => {
        if (startTime === null) return;
        const id = setInterval(() => {
            setElapsed(((Date.now() - startTime) / 1000).toFixed(2));
        }, 50);
        return () => clearInterval(id);
    }, [startTime]);

    // submit handler
    const checkAnswer = () => {
        // stop timer
        if (startTime !== null) setStartTime(null);

        const correct = parseInt(answer, 10) === a * b;
        setFeedback(correct ? "correct" : "incorrect");
        setHistory((h) => [...h, correct]);
    };

    // form submit (Enter key)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback) checkAnswer();
    };

    // history UI: last 3 + counts if overflow
    const lastThree = history.slice(-3);
    const totalCorrect = history.filter((v) => v).length;
    const totalWrong = history.length - totalCorrect;
    const overflow = history.length > 3;

    return (
        <div className="min-h-screen bg-background text-foreground pt-16 px-4 pb-8">
            {/* header with centered pageTitle */}
            <Header pageTitle={ui[language].solver}/>

            <div className="mt-8 flex justify-center">
                <div className="space-y-6 max-w-xl w-full">
                    {/* 2) APPLE HISTORY at top of card */}
                    <div
                        className="
              flex items-center justify-center space-x-2
              animate-slideIn
            "
                    >
                        {overflow && (
                            <span className="text-sm text-foreground/70">
                ✔️{totalCorrect} ✖️{totalWrong}
              </span>
                        )}
                        {lastThree.map((ok, i) => (
                            <span
                                key={i}
                                className={`text-3xl pastel-apple ${
                                    ok ? "" : "opacity-80"
                                }`}
                            >
                {ok ? "🍏" : "🍎"}
              </span>
                        ))}
                    </div>

                    {/* 3–6) SOLVER CARD */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8"
                    >
                        {/* title moved into header, so skip here */}

                        {/* digit selector */}
                        <DigitSelector digits={digits} onChange={setDigits}/>

                        {/* 1) BIGGER numbers */}
                        <ProblemDisplay a={a} b={b} sizeClass="text-7xl"/>

                        {/* 3 & 4 & 5) BIG INPUT + BUILT-IN ENTER */}
                        <div className="relative mb-6">
                            <input
                                ref={inputRef}
                                value={answer}
                                onChange={e => setAnswer(e.target.value.replace(/\D/, ""))}
                                onKeyDown={e => e.key === "Enter" && checkAnswer()}
                                inputMode="numeric"
                                className="
      w-full h-20
      text-5xl text-center
      border-2 border-secondary
      rounded-xl
      focus:outline-none focus:ring-4 focus:ring-primary/50
      caret-primary
      placeholder:text-gray-400
    "
                                placeholder=""
                                autoComplete="off"
                            />

                            <button
                                onClick={checkAnswer}
                                className="
      absolute right-3 top-1/2 transform -translate-y-1/2
      bg-primary text-white
      px-8 py-4
      rounded-full
      shadow-lg
      hover:bg-primary/80
      transition
    "
                            >
                                Enter
                            </button>
                        </div>


                        {/* 5) FEEDBACK text */}
                        {feedback === "correct" && (
                            <p className="flex justify-center items-center text-green-600 mb-4">
                                <IoCheckmarkCircle size={24} className="mr-2"/>
                                Correct!
                            </p>
                        )}
                        {feedback === "incorrect" && (
                            <p className="flex justify-center items-center text-red-600 mb-4">
                                <IoCloseCircle size={24} className="mr-2"/>
                                Wrong! Answer:{" "}
                                <strong className="ml-1">
                                    {(a * b).toString()}
                                </strong>
                            </p>
                        )}

                        {/* 5) Next button */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={newProblem}
                                className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg transition"
                            >
                                {ui[language].next}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
