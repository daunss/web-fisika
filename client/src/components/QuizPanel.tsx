import React, { useState } from "react";
import { HelpCircle, Check, X, RotateCcw, Trophy } from "lucide-react";
import { sound } from "../utils/audio";
import confetti from "canvas-confetti";

interface Question {
  id: number;
  question: string;
  context: string;
  options: { label: string; text: string; correct: boolean }[];
  explanation: string;
  formula: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    context: "KUIS 01 • KECEPATAN KONSTAN",
    question: "Partikel bergerak dengan kecepatan 40 m/s secara konstan. Berapakah nilai percepatannya (a)?",
    options: [
      { label: "A", text: "40 m/s²", correct: false },
      { label: "B", text: "0 m/s² (Nol Mutlak)", correct: true },
      { label: "C", text: "20 m/s²", correct: false },
      { label: "D", text: "1 m/s²", correct: false },
    ],
    explanation: "Karena kecepatan konstan (tetap), tidak ada perubahan kecepatan (Δv = 0). Maka a = Δv/Δt = 0.",
    formula: "Δv = 0 ➔ a = 0 m/s²",
  },
  {
    id: 2,
    context: "KUIS 02 • BENTUK GRAFIK KINEMATIKA",
    question: "Bagaimanakah bentuk grafik posisi terhadap waktu (s - t) pada Gerak Lurus Beraturan?",
    options: [
      { label: "A", text: "Parabola Melengkung ke Atas", correct: false },
      { label: "B", text: "Garis Lurus Linier Miring (Kemiringan Konstan)", correct: true },
      { label: "C", text: "Garis Horizontal Datar Tanpa Kemiringan", correct: false },
      { label: "D", text: "Gelombang Sinusoidal", correct: false },
    ],
    explanation: "Grafik s-t berupa garis lurus linier miring karena jarak bertambah sebanding dengan waktu. Kemiringan garis (gradien) menyatakan kecepatan v.",
    formula: "Kemiringan (Gradien) = ds/dt = v",
  },
  {
    id: 3,
    context: "KUIS 03 • KALKULASI JARAK TEMPUH",
    question: "Sebuah mobil melaju dengan kelajuan konstan 25 m/s selama 10 sekon dari posisi awal 0 m. Berapa jarak tempuhnya?",
    options: [
      { label: "A", text: "2.5 Meter", correct: false },
      { label: "B", text: "250 Meter", correct: true },
      { label: "C", text: "35 Meter", correct: false },
      { label: "D", text: "125 Meter", correct: false },
    ],
    explanation: "s = s₀ + (v × t) = 0 + (25 m/s × 10 s) = 250 Meter.",
    formula: "s = 25 × 10 = 250 m",
  },
];

export const QuizPanel: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const q = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = q.options[idx].correct;
    if (isCorrect) {
      sound.playCoin();
      setScore((prev) => prev + 1);
    } else {
      sound.playBuzzer();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f6c453", "#4fc4a8", "#ef6f5e"],
      });
    }
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
      <div
        className="pixel-card pixel-card-accent-amber"
        style={{
          padding: "24px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "24px auto",
        }}
      >
        <Trophy size={48} color="#f6c453" style={{ margin: "0 auto 12px auto" }} />
        <h3 style={{ fontFamily: "var(--font-head)", fontSize: "0.8rem", color: "#fbf6e9", marginBottom: "8px" }}>
          KUIS KINEMATIKA SELESAI!
        </h3>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#8ea3c9", marginBottom: "16px" }}>
          Anda berhasil menyelesaikan seluruh pertanyaan kuis video GLB
        </p>

        <div
          style={{
            backgroundColor: "#0b0d17",
            border: "1px solid #2b3350",
            padding: "16px",
            maxWidth: "260px",
            margin: "0 auto 20px auto",
          }}
        >
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", color: "#8ea3c9", display: "block" }}>
            SKOR AKHIR ANDA
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "3rem", color: "#4fc4a8", fontWeight: "bold" }}>
            {score} / {QUESTIONS.length}
          </span>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", color: "#f6c453", display: "block", marginTop: "4px" }}>
            {score === QUESTIONS.length ? "★ NILAI SEMPURNA 100% ★" : "PEMAHAMAN BAGUS!"}
          </span>
        </div>

        <button onClick={handleRestart} className="pixel-btn pixel-btn-amber">
          <RotateCcw size={14} /> ULANGI KUIS
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "860px", margin: "0 auto" }}>
      {/* Header Kuis */}
      <div
        className="pixel-card"
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <HelpCircle size={22} color="#f6c453" />
          <div>
            <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#fbf6e9", fontWeight: "bold" }}>
              KUIS KILAT GLB (SESUAI VIDEO FRAME 270s)
            </h3>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "#8ea3c9" }}>{q.context}</span>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.55rem", color: "#8ea3c9", display: "block" }}>PERTANYAAN</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", color: "#f6c453", fontWeight: "bold" }}>
            {currentIdx + 1} / {QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Pertanyaan Card */}
      <div className="pixel-card pixel-card-accent-amber" style={{ padding: "20px" }}>
        <h4 style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#fbf6e9", lineHeight: "1.6", marginBottom: "18px" }}>
          {q.question}
        </h4>

        {/* Pilihan Jawaban (Responsive 2col -> 1col) */}
        <div className="grid-2col" style={{ marginBottom: "18px" }}>
          {q.options.map((opt, idx) => {
            let borderColor = "#2b3350";
            let bgColor = "#0b0d17";
            let textColor = "#e8e3d3";

            if (isAnswered) {
              if (opt.correct) {
                borderColor = "#4fc4a8";
                bgColor = "rgba(47, 143, 122, 0.25)";
                textColor = "#4fc4a8";
              } else if (selectedOption === idx) {
                borderColor = "#ef6f5e";
                bgColor = "rgba(200, 67, 63, 0.25)";
                textColor = "#ef6f5e";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isAnswered}
                style={{
                  padding: "14px",
                  border: `1px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  textAlign: "left",
                  cursor: isAnswered ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "var(--font-head)", fontSize: "0.7rem", color: "#f6c453" }}>{opt.label}.</span>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", fontWeight: "bold", color: textColor }}>
                    {opt.text}
                  </span>
                </div>

                {isAnswered && opt.correct && <Check size={16} color="#4fc4a8" />}
                {isAnswered && selectedOption === idx && !opt.correct && (
                  <X size={16} color="#ef6f5e" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Penjelasan */}
        {isAnswered && (
          <div
            style={{
              padding: "14px",
              backgroundColor: "#0b0d17",
              border: "1px solid #2b3350",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  color: q.options[selectedOption!].correct ? "#4fc4a8" : "#ef6f5e",
                }}
              >
                {q.options[selectedOption!].correct ? "★ JAWABAN ANDA BENAR!" : "✕ JAWABAN KURANG TEPAT"}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "#f6c453", backgroundColor: "#141827", padding: "2px 8px", border: "1px solid #2b3350" }}>
                {q.formula}
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "#8ea3c9" }}>{q.explanation}</p>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={handleNext} className="pixel-btn pixel-btn-amber">
                {currentIdx + 1 < QUESTIONS.length ? "PERTANYAAN BERIKUTNYA ➔" : "LIHAT HASIL SKOR ★"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
