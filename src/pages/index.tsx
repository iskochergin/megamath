import React, {useState, useEffect, useCallback} from "react";
import DigitSelector from "../components/DigitSelector";
import ProblemDisplay from "../components/ProblemDisplay";
import AnswerInput from "../components/AnswerInput";
import Timer from "../components/Timer";

export default function Home() {
    const [digits, setDigits] = useState<number>(2);
    const [a, setA] = useState<number>(0);
    const [b, setB] = useState<number>(0);
    const [answer, setAnswer] = useState<string>("");
    const [feedback, setFeedback] = useState<string>("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState<string>("0.00");

    // Generate a new problem
    const newProblem = useCallback(() => {
        const min = 10 ** (digits - 1);
        const max = 10 ** digits - 1;
        setA(Math.floor(Math.random() * (max - min + 1)) + min);
        setB(Math.floor(Math.random() * (max - min + 1)) + min);
        setAnswer("");
        setFeedback("");
        setStartTime(Date.now());
    }, [digits]);

    // On load or when digits change
    useEffect(() => {
        newProblem();
    }, [newProblem]);

    // Timer update
    useEffect(() => {
        if (startTime === null) return;
        const id = setInterval(() => {
            const secs = (Date.now() - startTime) / 1000;
            setElapsed(secs.toFixed(2));
        }, 50);
        return () => clearInterval(id);
    }, [startTime]);

    const checkAnswer = () => {
        if (parseInt(answer, 10) === a * b) {
            setFeedback(`✅ Correct! You took ${elapsed}s.`);
        } else {
            setFeedback("❌ Try again.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-4 text-primary">
                    Fast Math Solver
                </h1>

                <DigitSelector digits={digits} onChange={setDigits}/>
                <ProblemDisplay a={a} b={b}/>
                <AnswerInput
                    answer={answer}
                    onChange={setAnswer}
                    onCheck={checkAnswer}
                />
                <Timer elapsed={elapsed}/>

                {feedback && (
                    <p className="text-center mb-4 font-medium">{feedback}</p>
                )}

                <div className="text-center">
                    <button
                        onClick={newProblem}
                        className="bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
