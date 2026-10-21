import React, { useEffect, useState } from "react";
import { GitCompare, Lightbulb, CheckCircle2, Layers } from "lucide-react";
import { API_BASE } from "../utils/config";

interface ComparisonData {
  pillar_overview: {
    topic: string;
    velocity_theory_mps: number;
    velocity_simulation_mps: number;
    velocity_experiment_avg_mps: number;
    overall_error_percentage: number;
  };
  comparison_table: {
    test_no: number;
    time_avg_s: number;
    s_theory_m: number;
    s_simulation_m: number;
    s_experiment_m: number;
    error_percentage: number;
    notes: string;
  }[];
  scientific_discussion: string[];
}

export const ComparisonPanel: React.FC = () => {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/comparison`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal load comparison:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="pixel-card" style={{ padding: "32px", textAlign: "center", color: "#8ea3c9", fontFamily: "var(--font-ui)", fontSize: "0.7rem" }}>
        MEMUAT DATA PERBANDINGAN 3 PILAR...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pixel-card" style={{ padding: "24px", textAlign: "center", color: "#ef6f5e", fontFamily: "var(--font-ui)", fontSize: "0.7rem" }}>
        TIDAK DAPAT MENGHUBUNGI API BACKEND ELYSIA.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* 1. HEADER MODUL BAGIAN I */}
      <div
        className="pixel-card pixel-card-accent-mint"
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
          <GitCompare color="#4fc4a8" size={24} />
          <div>
            <h3 style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#fbf6e9", fontWeight: "bold" }}>
              ANALISIS KOMPARASI 3 PILAR (PANDUAN PBL BAGIAN I)
            </h3>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: "#8ea3c9" }}>
              Perbandingan Saintifik Triangulasi: Persamaan Teori vs Simulasi Komputer (Produk 1) vs Praktikum Nyata (Produk 3)
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div style={{ padding: "6px 12px", backgroundColor: "#0b0d17", border: "1px solid #2b3350" }}>
            <span style={{ fontSize: "0.55rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block" }}>RATA-RATA GALAT</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "#f6c453", fontWeight: "bold" }}>
              {data.pillar_overview.overall_error_percentage}%
            </span>
          </div>
          <div style={{ padding: "6px 12px", backgroundColor: "#0b0d17", border: "1px solid #2b3350" }}>
            <span style={{ fontSize: "0.55rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "block" }}>STATUS KELAYAKAN</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "#4fc4a8", fontWeight: "bold" }}>
              PRESISI TINGGI
            </span>
          </div>
        </div>
      </div>

      {/* 2. OVERVIEW 3 CARDS */}
      <div className="grid-3col">
        {/* Pilar 1: Teori */}
        <div className="pixel-card" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#f6c453" }}>
            <Layers size={16} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", fontWeight: "bold" }}>
              [ PILAR 1 ] TEORI ANALITIS
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "#fbf6e9", marginBottom: "6px" }}>
            v = {data.pillar_overview.velocity_theory_mps.toFixed(2)} m/s
          </div>
          <p style={{ fontSize: "0.95rem", color: "#8ea3c9", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
            Berdasarkan Hukum I Newton pada kondisi vakum ideal tanpa gaya gesek. Rumus: s = v * t dengan a = 0.
          </p>
        </div>

        {/* Pilar 2: Simulasi */}
        <div className="pixel-card pixel-card-accent-mint" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#4fc4a8" }}>
            <CheckCircle2 size={16} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", fontWeight: "bold" }}>
              [ PILAR 2 ] SIMULASI WEB (PRODUK 1)
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "#4fc4a8", marginBottom: "6px" }}>
            v = {data.pillar_overview.velocity_simulation_mps.toFixed(2)} m/s
          </div>
          <p style={{ fontSize: "0.95rem", color: "#8ea3c9", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
            Hasil diskritisasi engine Canvas 60 FPS pada aplikasi ini. Deviasi terhadap teori adalah 0.00% (Identik sempurna).
          </p>
        </div>

        {/* Pilar 3: Praktikum */}
        <div className="pixel-card pixel-card-accent-coral" style={{ padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#ef6f5e" }}>
            <Lightbulb size={16} />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", fontWeight: "bold" }}>
              [ PILAR 3 ] PRAKTIKUM RIIL (PRODUK 3)
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.3rem", color: "#ef6f5e", marginBottom: "6px" }}>
            v̄ = {data.pillar_overview.velocity_experiment_avg_mps.toFixed(4)} m/s
          </div>
          <p style={{ fontSize: "0.95rem", color: "#8ea3c9", fontFamily: "var(--font-mono)", lineHeight: 1.5 }}>
            Diperoleh dari rata-rata pengujian stopwatch mobil mainan di lintasan 20 cm - 100 cm. Memiliki galat alami ~1.5%.
          </p>
        </div>
      </div>

      {/* 3. TABEL KOMPARASI LENGKAP */}
      <div className="pixel-card" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", backgroundColor: "#141827", borderBottom: "1px solid #2b3350" }}>
          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.68rem", color: "#f6c453", fontWeight: "bold" }}>
            TABEL RESMI PERBANDINGAN HASIL UJI KINEMATIKA (PBL 1)
          </span>
        </div>

        <div className="pixel-table-wrapper">
          <table className="pixel-table">
            <thead>
              <tr>
                <th>UJI #</th>
                <th>WAKTU RATA-RATA (t̄)</th>
                <th>JARAK TEORI (s_teori)</th>
                <th>SIMULASI KOMPUTER</th>
                <th>EKSPERIMEN NYATA (s_eks)</th>
                <th>DEVIAZI GALAT (%)</th>
                <th>CATATAN PENGUJIAN</th>
              </tr>
            </thead>
            <tbody>
              {data.comparison_table.map((row) => (
                <tr key={row.test_no}>
                  <td style={{ fontFamily: "var(--font-mono)", color: "#f6c453" }}>#{row.test_no}</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{row.time_avg_s.toFixed(3)} s</td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>{row.s_theory_m.toFixed(3)} m</td>
                  <td style={{ color: "#4fc4a8", fontFamily: "var(--font-mono)" }}>{row.s_simulation_m.toFixed(3)} m</td>
                  <td style={{ color: "#ef6f5e", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>
                    {row.s_experiment_m.toFixed(2)} m
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 6px",
                        backgroundColor: "rgba(246, 196, 83, 0.15)",
                        border: "1px solid #f6c453",
                        color: "#f6c453",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {row.error_percentage.toFixed(2)}%
                    </span>
                  </td>
                  <td style={{ color: "#8ea3c9", fontSize: "0.85rem" }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PEMBAHASAN SAINTIFIK & PENYEBAB GALAT */}
      <div className="pixel-card pixel-card-accent-amber" style={{ padding: "16px" }}>
        <h4
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.72rem",
            color: "#f6c453",
            marginBottom: "12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Lightbulb size={16} /> PEMBAHASAN SAINTIFIK & ANALISIS SUMBER GALAT
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.scientific_discussion.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "10px 12px",
                backgroundColor: "rgba(11, 13, 23, 0.65)",
                border: "1px solid #2b3350",
                fontSize: "0.95rem",
                color: "#e8e3d3",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.5,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
