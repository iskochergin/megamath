import dynamic from "next/dynamic";

const MultiplicationQuiz = dynamic(
  () => import("../components/MultiplicationQuiz"),
  { ssr: false, loading: () => null }
);

export default function MathPage() {
  return <MultiplicationQuiz />;
}


