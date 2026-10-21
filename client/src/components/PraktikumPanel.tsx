import React, { useState } from "react";
import { PlusCircle, RotateCcw, Trash2, FlaskConical, AlertCircle, FileSpreadsheet, TrendingUp, Calculator } from "lucide-react";
import { sound } from "../utils/audio";

export interface ExperimentItem {
  id: number;
  test_no: number;
  distance_s: number;
  time_t1: number;
  time_t2: number;
  time_t3: number;
  time_avg: number;
  v_calc: number;
  v_theory: number;
  error_pct: number;
  notes: string;
}

interface PraktikumPanelProps {
  experiments: ExperimentItem[];
  onAddExperiment: (exp: {
    test_no: number;
    distance_s: number;
    time_t1: number;
    time_t2: number;
    time_t3: number;
    v_theory?: number;
    notes?: string;
  }) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onDeleteExperiment: (id: number) => Promise<void>;
  isLoading: boolean;
}

export const PraktikumPanel: React.FC<PraktikumPanelProps> = ({
  experiments,
  onAddExperiment,
  onResetDefaults,
  onDeleteExperiment,
  isLoading,
}) => {
  const [distance, setDistance] = useState<number>(1.2);
  const [t1, setT1] = useState<number>(4.85);
  const [t2, setT2] = useState<number>(4.82);
  const [t3, setT3] = useState<number>(4.88);
  const [notes, setNotes] = useState<string>("Lintasan tambahan 120 cm");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    sound.playClick();
    try {
      await onAddExperiment({
        test_no: experiments.length + 1,
        distance_s: distance,
        time_t1: t1,
        time_t2: t2,
        time_t3: t3,
        v_theory: 0.25,
        notes,
      });
      sound.playSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  // Analisis Regresi Linier Data Praktikum
  const n = experiments.length;
  let slope_v = 0.25;
  let intercept_s0 = 0.0;
  let r_squared = 0.999;

  if (n >= 2) {
    let sumT = 0;
    let sumS = 0;
    let sumTS = 0;
    let sumT2 = 0;
    let sumS2 = 0;

    experiments.forEach((pt) => {
      sumT += pt.time_avg;
      sumS += pt.distance_s;
      sumTS += pt.time_avg * pt.distance_s;
      sumT2 += pt.time_avg * pt.time_avg;
      sumS2 += pt.distance_s * pt.distance_s;
    });

    const denom = n * sumT2 - sumT * sumT;
    if (denom !== 0) {
      slope_v = (n * sumTS - sumT * sumS) / denom;
      intercept_s0 = (sumS - slope_v * sumT) / n;

      const numR = n * sumTS - sumT * sumS;
      const denR = Math.sqrt((n * sumT2 - sumT * sumT) * (n * sumS2 - sumS * sumS));
      const r = denR !== 0 ? numR / denR : 1;
      r_squared = Math.min(1, Math.max(0, r * r));
    }
  }

  const svgW = 420;
  const svgH = 180;
  const maxT = Math.max(...experiments.map((e) => e.time_avg), 5);
  const maxS = Math.max(...experiments.map((e) => e.distance_s), 1.2);
  const pL = 40;
  const pB = 25;
  const pT = 15;
  const pR = 20;
  const cW = svgW - pL - pR;
  const cH = svgH - pT - pB;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. KETERANGAN PRAKTIKUM FISIKA SEDERHANA */}
      <div
        className="pixel-card"
        style={{
          padding: "16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FlaskConical color="#f6c453" size={22} />
          <div>
            <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#fbf6e9", fontWeight: "bold" }}>
              PRODUK 3: PRAKTIKUM FISIKA SEDERHANA (DATA RIIL)
            </h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: "#8ea3c9" }}>
              Eksperimen pengukuran GLB menggunakan Mobil Mainan Baterai Berkecepatan Konstan di atas lintasan datar berjarak
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => {
              sound.playClick();
              onResetDefaults();
            }}
            disabled={isLoading}
            className="pixel-btn"
            style={{ fontSize: "0.6rem", padding: "6px 12px" }}
            title="Reset data ke 5 percobaan standar kelompok"
          >
            <RotateCcw size={12} /> RESET DATA DEFAULT
          </button>
        </div>
      </div>

      {/* 2. FORM INPUT DATA BARU & DESKRIPSI VARIABEL */}
      <div className="grid-2col">
        {/* Deskripsi Variabel Praktikum */}
        <div className="pixel-card pixel-card-accent-amber" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#f6c453", fontWeight: "bold", display: "block", marginBottom: "8px", borderBottom: "1px solid #2b3350", paddingBottom: "4px" }}>
              VARIABEL EKSPERIMEN (MODUL G)
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "var(--font-mono)", fontSize: "0.95rem", color: "#e8e3d3" }}>
              <div style={{ backgroundColor: "#0b0d17", padding: "8px", border: "1px solid #2b3350" }}>
                <strong style={{ color: "#f6c453", fontFamily: "var(--font-ui)", fontSize: "0.6rem", display: "block" }}>
                  1. VARIABEL BEBAS (Manipulated):
                </strong>
                Jarak Tempuh Lintasan (s) diubah: 20 cm, 40 cm, 60 cm, 80 cm, 100 cm.
              </div>
              <div style={{ backgroundColor: "#0b0d17", padding: "8px", border: "1px solid #2b3350" }}>
                <strong style={{ color: "#4fc4a8", fontFamily: "var(--font-ui)", fontSize: "0.6rem", display: "block" }}>
                  2. VARIABEL TERIKAT (Responding):
                </strong>
                Waktu tempuh (t) yang dicatat menggunakan Stopwatch HP (diulang 3 kali per jarak).
              </div>
              <div style={{ backgroundColor: "#0b0d17", padding: "8px", border: "1px solid #2b3350" }}>
                <strong style={{ color: "#ef6f5e", fontFamily: "var(--font-ui)", fontSize: "0.6rem", display: "block" }}>
                  3. VARIABEL KONTROL (Controlled):
                </strong>
                Kecepatan motor mobil baterai, permukaan meja datar 0°, tegangan baterai awal.
              </div>
            </div>
          </div>

          <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "rgba(43, 51, 80, 0.3)", border: "1px solid #2b3350", fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertCircle size={13} color="#f6c453" />
            Tersimpan otomatis di SQLite (fisika.db)
          </div>
        </div>

        {/* Form Tambah Percobaan */}
        <div className="pixel-card pixel-card-accent-mint" style={{ padding: "16px" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#4fc4a8", fontWeight: "bold", display: "block", marginBottom: "12px", borderBottom: "1px solid #2b3350", paddingBottom: "4px" }}>
            <PlusCircle size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
            INPUT HASIL PENGUKURAN STOPWATCH
          </span>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
              <div>
                <label style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block", marginBottom: "4px" }}>JARAK s (M)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  className="pixel-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block", marginBottom: "4px" }}>WAKTU t₁ (S)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={t1}
                  onChange={(e) => setT1(parseFloat(e.target.value) || 0)}
                  className="pixel-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block", marginBottom: "4px" }}>WAKTU t₂ (S)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={t2}
                  onChange={(e) => setT2(parseFloat(e.target.value) || 0)}
                  className="pixel-input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block", marginBottom: "4px" }}>WAKTU t₃ (S)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={t3}
                  onChange={(e) => setT3(parseFloat(e.target.value) || 0)}
                  className="pixel-input"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block", marginBottom: "4px" }}>CATATAN PENGUJIAN</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pengujian lintasan 120 cm"
                className="pixel-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="pixel-btn pixel-btn-mint"
              style={{ width: "100%", marginTop: "4px" }}
            >
              <PlusCircle size={14} /> {submitting ? "PROSES..." : "TAMBAH PENGUKURAN KE SQLITE"}
            </button>
          </form>
        </div>
      </div>

      {/* 3. ANALISIS REGRESI LINIER DATA PRAKTIKUM (INTEGRASI INFORMATIKA) */}
      <div className="grid-2col">
        {/* Scatter Plot + Garis Best Fit Regresi */}
        <div className="pixel-card pixel-card-accent-mint" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid #2b3350" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#4fc4a8", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp size={14} /> SCATTER PLOT & REGRESI LINIER
            </span>
            <span style={{ fontSize: "0.85rem", color: "#8ea3c9", fontFamily: "var(--font-mono)" }}>
              R² = <strong style={{ color: "#4fc4a8", fontSize: "1rem" }}>{r_squared.toFixed(4)}</strong>
            </span>
          </div>

          <div className="grid-paper-bg" style={{ position: "relative", backgroundColor: "#0b0d17", border: "1px solid #2b3350", padding: "4px" }}>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}>
              <line x1={pL} y1={pT} x2={pL} y2={svgH - pB} stroke="#5b8dd9" strokeWidth="2" />
              <line x1={pL} y1={svgH - pB} x2={svgW - pR} y2={svgH - pB} stroke="#5b8dd9" strokeWidth="2" />

              <text x={pL - 6} y={pT + 8} fill="#4fc4a8" fontSize="11" fontFamily="'VT323', monospace" textAnchor="end">
                s (m)
              </text>
              <text x={svgW - pR + 4} y={svgH - pB + 4} fill="#8ea3c9" fontSize="11" fontFamily="'VT323', monospace">
                t̄ (s)
              </text>

              {experiments.length >= 2 && (
                <line
                  x1={pL}
                  y1={svgH - pB - (intercept_s0 / maxS) * cH}
                  x2={pL + cW}
                  y2={svgH - pB - ((slope_v * maxT + intercept_s0) / maxS) * cH}
                  stroke="#f6c453"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}

              {experiments.map((pt) => {
                const cx = pL + (pt.time_avg / maxT) * cW;
                const cy = svgH - pB - (pt.distance_s / maxS) * cH;
                return (
                  <g key={pt.id}>
                    <circle cx={cx} cy={cy} r="4" fill="#4fc4a8" stroke="#0b0d17" strokeWidth="1.5" />
                    <text x={cx + 6} y={cy - 4} fill="#e8e3d3" fontSize="9" fontFamily="'VT323', monospace">
                      {pt.distance_s}m
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Persamaan & Parameter Statistik */}
        <div className="pixel-card pixel-card-accent-amber" style={{ padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#f6c453", fontWeight: "bold", display: "block", marginBottom: "8px", borderBottom: "1px solid #2b3350", paddingBottom: "4px" }}>
              <Calculator size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
              HASIL KALKULASI REGRESI LINIER
            </span>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "var(--font-mono)", fontSize: "1rem", color: "#e8e3d3" }}>
              <div style={{ backgroundColor: "#0b0d17", padding: "10px", border: "1px solid #2b3350" }}>
                <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block" }}>PERSAMAAN GARIS REGRESI:</span>
                <div style={{ fontSize: "1.2rem", color: "#f6c453", fontWeight: "bold", marginTop: "2px" }}>
                  s = {slope_v.toFixed(4)} · t + ({intercept_s0.toFixed(4)})
                </div>
              </div>

              <div style={{ backgroundColor: "#0b0d17", padding: "10px", border: "1px solid #2b3350" }}>
                <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block" }}>KECEPATAN HASIL FIT (v̄_fit):</span>
                <div style={{ fontSize: "1.4rem", color: "#4fc4a8", fontWeight: "bold", marginTop: "2px" }}>
                  v = {slope_v.toFixed(4)} m/s{" "}
                  <span style={{ fontSize: "0.85rem", color: "#8ea3c9" }}>(Teori: 0.2500 m/s)</span>
                </div>
              </div>

              <div style={{ backgroundColor: "#0b0d17", padding: "10px", border: "1px solid #2b3350" }}>
                <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block" }}>KOEFISIEN DETERMINASI (R²):</span>
                <div style={{ fontSize: "1.4rem", color: "#fbf6e9", fontWeight: "bold", marginTop: "2px" }}>
                  R² = {r_squared.toFixed(4)}{" "}
                  <span style={{ fontSize: "0.6rem", color: "#4fc4a8", fontFamily: "var(--font-ui)" }}>
                    ({(r_squared * 100).toFixed(2)}% Linier Sempurna)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABEL DATA HASIL PENGUKURAN (RESPONSIVE SCROLL) */}
      <div className="pixel-card" style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #2b3350" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSpreadsheet size={15} color="#f6c453" />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#fbf6e9", fontWeight: "bold" }}>
              TABEL HASIL PRAKTIKUM LENGKAP (s, t₁, t₂, t₃, t̄, v̄)
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "#4fc4a8" }}>
            TOTAL {experiments.length} TITIK PENGUKURAN
          </span>
        </div>

        <div className="table-responsive-wrapper">
          <div className="table-scroll-hint">➔ GESER TABEL KE KANAN UNTUK MELIHAT SELURUH KOLOM</div>
          <table className="pixel-table">
            <thead>
              <tr>
                <th>NO</th>
                <th>JARAK (s)</th>
                <th>t₁ (s)</th>
                <th>t₂ (s)</th>
                <th>t₃ (s)</th>
                <th style={{ color: "#f6c453" }}>t̄ RATA-RATA</th>
                <th style={{ color: "#4fc4a8" }}>v TERHITUNG</th>
                <th style={{ color: "#ef6f5e" }}>GALAT (%)</th>
                <th>CATATAN</th>
                <th style={{ textAlign: "center" }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ color: "#8ea3c9" }}>#{idx + 1}</td>
                  <td style={{ fontWeight: "bold", color: "#fbf6e9" }}>{item.distance_s.toFixed(2)} m</td>
                  <td>{item.time_t1.toFixed(2)} s</td>
                  <td>{item.time_t2.toFixed(2)} s</td>
                  <td>{item.time_t3.toFixed(2)} s</td>
                  <td style={{ color: "#f6c453", fontWeight: "bold" }}>{item.time_avg.toFixed(3)} s</td>
                  <td style={{ color: "#4fc4a8", fontWeight: "bold" }}>{item.v_calc.toFixed(4)} m/s</td>
                  <td>
                    <span style={{ padding: "2px 6px", backgroundColor: "rgba(239, 111, 94, 0.15)", color: "#ef6f5e", border: "1px solid rgba(239, 111, 94, 0.4)", fontSize: "0.85rem", fontWeight: "bold" }}>
                      {item.error_pct.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ color: "#8ea3c9", fontSize: "0.9rem" }}>{item.notes}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onDeleteExperiment(item.id);
                      }}
                      style={{ background: "none", border: "none", color: "#ef6f5e", cursor: "pointer", padding: "4px" }}
                      title="Hapus baris ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
