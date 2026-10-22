import React, { useState } from "react";
import confetti from "canvas-confetti";
import { ArrowRight, Check, HelpCircle, RotateCcw, Trophy, X } from "lucide-react";
import { sound } from "../utils/audio";
import { Badge, Card, CardHead } from "./ui";

interface Question {
  id: number;
  context: string;
  question: string;
  options: { label: string; text: string; correct: boolean }[];
  explanation: string;
  formula: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    context: "Kecepatan konstan",
    question:
      "Partikel bergerak dengan kecepatan 40 m/s secara konstan. Berapakah nilai percepatannya?",
    options: [
      { label: "A", text: "40 m/s²", correct: false },
      { label: "B", text: "0 m/s²", correct: true },
      { label: "C", text: "20 m/s²", correct: false },
      { label: "D", text: "1 m/s²", correct: false },
    ],
    explanation:
      "Kecepatan tidak berubah, sehingga Δv = 0. Percepatan adalah perubahan kecepatan dibagi selang waktu, jadi hasilnya nol.",
    formula: "a = Δv / Δt = 0",
  },
  {
    id: 2,
    context: "Bentuk grafik",
    question:
      "Bagaimana bentuk grafik posisi terhadap waktu (s–t) pada Gerak Lurus Beraturan?",
    options: [
      { label: "A", text: "Parabola melengkung ke atas", correct: false },
      { label: "B", text: "Garis lurus miring dengan kemiringan tetap", correct: true },
      { label: "C", text: "Garis horizontal tanpa kemiringan", correct: false },
      { label: "D", text: "Gelombang sinusoidal", correct: false },
    ],
    explanation:
      "Jarak bertambah sebanding dengan waktu, sehingga grafiknya garis lurus. Kemiringan garis itu menyatakan kecepatan v.",
    formula: "gradien = ds/dt = v",
  },
  {
    id: 3,
    context: "Kalkulasi jarak",
    question:
      "Sebuah mobil melaju dengan kelajuan konstan 25 m/s selama 10 sekon mulai dari posisi 0 m. Berapa jarak yang ditempuh?",
    options: [
      { label: "A", text: "2,5 meter", correct: false },
      { label: "B", text: "250 meter", correct: true },
      { label: "C", text: "35 meter", correct: false },
      { label: "D", text: "125 meter", correct: false },
    ],
    explanation: "Masukkan nilai ke persamaan GLB: s = s₀ + v·t.",
    formula: "s = 0 + 25 × 10 = 250 m",
  },
];

function scoreNote(score: number, total: number): string {
  if (score === total) return "Ketiga jawaban benar.";
  if (score >= total - 1) return "Hampir semua benar. Periksa satu konsep yang terlewat.";
  return "Ulangi kuis setelah membaca kembali bagian rumus GLB.";
}

export const QuizPanel: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const question = QUESTIONS[currentIdx];
  const total = QUESTIONS.length;
  const progress = ((currentIdx + (isAnswered ? 1 : 0)) / total) * 100;
  const isCorrect = selectedOption !== null && question.options[selectedOption]?.correct === true;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (question.options[index].correct) {
      sound.playCoin();
      setScore((prev) => prev + 1);
    } else {
      sound.playBuzzer();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx + 1 < total) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      return;
    }

    setQuizFinished(true);
    sound.playSuccess();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f6c453", "#4fc4a8", "#ef6f5e"],
    });
  };

  const handleRestart = () => {
    sound.playReset();
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    return (
      <div className="quiz-shell">
        <Card accent="amber" className="quiz-score-card" data-reveal>
          <Trophy size={44} color="#f6c453" aria-hidden="true" />
          <div className="card-index" style={{ marginTop: "10px" }}>
            Kuis selesai
          </div>
          <div className="quiz-score">
            {score} / {total}
          </div>
          <p className="calc-note" style={{ marginBottom: "16px" }}>
            {scoreNote(score, total)}
          </p>
          <button type="button" className="btn btn-primary" onClick={handleRestart}>
            <RotateCcw size={14} /> Ulangi kuis
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="quiz-shell">
      <Card accent="amber" data-reveal>
        <CardHead
          index="01"
          title="Kuis kilat GLB"
          icon={<HelpCircle size={15} />}
          meta={
            <span>
              {currentIdx + 1} / {total} · skor {score}
            </span>
          }
        />
        <div className="card-body">
          <div className="quiz-progress">
            <span className="mono muted">
              {currentIdx + 1}/{total}
            </span>
            <div
              className="quiz-track"
              role="progressbar"
              aria-label="Kemajuan kuis"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <Badge tone="muted">{question.context}</Badge>
          </div>

          <h3 className="quiz-question">{question.question}</h3>

          <div className="quiz-options">
            {question.options.map((option, index) => {
              let state: "correct" | "wrong" | undefined;
              if (isAnswered) {
                if (option.correct) state = "correct";
                else if (selectedOption === index) state = "wrong";
              }

              return (
                <button
                  key={index}
                  type="button"
                  className="quiz-option"
                  data-state={state}
                  disabled={isAnswered}
                  aria-pressed={selectedOption === index}
                  onClick={() => handleSelect(index)}
                >
                  <span className="quiz-letter" aria-hidden="true">
                    {option.label}
                  </span>
                  <span className="quiz-option-text">{option.text}</span>
                  {state === "correct" ? <Check size={16} aria-hidden="true" /> : null}
                  {state === "wrong" ? <X size={16} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className="quiz-feedback" role="status">
              <div className="quiz-feedback-head">
                <span className={`quiz-result ${isCorrect ? "is-support" : "is-alert"}`}>
                  {isCorrect ? "Jawaban benar" : "Jawaban belum tepat"}
                </span>
                <span className="quiz-formula">{question.formula}</span>
              </div>

              <p className="quiz-explain">{question.explanation}</p>

              <div className="actions-row" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  {currentIdx + 1 < total ? "Pertanyaan berikutnya" : "Lihat hasil"}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default QuizPanel;
