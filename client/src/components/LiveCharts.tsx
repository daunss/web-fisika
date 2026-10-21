import React from "react";
import { TrendingUp, Activity, CheckCircle2 } from "lucide-react";

interface LiveChartsProps {
  v: number;
  s0: number;
  timeTarget: number;
  timeCurrent: number;
}

export const LiveCharts: React.FC<LiveChartsProps> = ({
  v,
  s0,
  timeTarget,
  timeCurrent,
}) => {
  const sMax = Math.max(10, s0 + v * timeTarget);
  const sNow = s0 + v * timeCurrent;
  const progressRatio = Math.min(1, timeCurrent / (timeTarget || 1));

  // Dimensi ViewBox SVG untuk ketajaman pixel
  const svgW = 400;
  const svgH = 180;
  const padL = 45;
  const padB = 30;
  const padT = 20;
  const padR = 25;

  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  // Koordinat Titik Sekarang pada Grafik s-t
  const pointX_ST = padL + chartW * progressRatio;
  const pointY_ST = svgH - padB - (sNow / sMax) * chartH;

  // Koordinat Garis Penuh s-t
  const startY_ST = svgH - padB - (s0 / sMax) * chartH;
  const endY_ST = svgH - padB - ((s0 + v * timeTarget) / sMax) * chartH;

  // Koordinat Grafik v-t (Konstan Horizontal)
  const vMax = Math.max(10, v * 1.5);
  const lineY_VT = svgH - padB - (v / vMax) * chartH;
  const currentX_VT = padL + chartW * progressRatio;

  return (
    <div className="grid-charts-row">
      {/* 1. GRAFIK POSISI TERHADAP WAKTU (s - t) */}
      <div className="pixel-card pixel-card-accent-mint" style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "10px",
            paddingBottom: "8px",
            borderBottom: "1px solid #2b3350",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={14} color="#4fc4a8" />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#4fc4a8", fontWeight: "bold" }}>
              GRAFIK 01: POSISI (s) - WAKTU (t)
            </span>
          </div>
          <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)" }}>
            GRADIEN = v ({v} m/s)
          </span>
        </div>

        {/* SVG Chart s - t */}
        <div
          className="grid-paper-bg"
          style={{
            position: "relative",
            backgroundColor: "#0b0d17",
            border: "1px solid #2b3350",
            padding: "4px",
          }}
        >
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}>
            {/* Grid Lines */}
            <line x1={padL} y1={padT + chartH * 0.25} x2={svgW - padR} y2={padT + chartH * 0.25} stroke="#2b3350" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + chartH * 0.50} x2={svgW - padR} y2={padT + chartH * 0.50} stroke="#2b3350" strokeDasharray="3 3" />
            <line x1={padL} y1={padT + chartH * 0.75} x2={svgW - padR} y2={padT + chartH * 0.75} stroke="#2b3350" strokeDasharray="3 3" />

            {/* Sumbu X & Y */}
            <line x1={padL} y1={padT} x2={padL} y2={svgH - padB} stroke="#5b8dd9" strokeWidth="2" />
            <line x1={padL} y1={svgH - padB} x2={svgW - padR} y2={svgH - padB} stroke="#5b8dd9" strokeWidth="2" />

            {/* Label Sumbu */}
            <text x={padL - 10} y={padT + 10} fill="#4fc4a8" fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
              s (m)
            </text>
            <text x={svgW - padR + 5} y={svgH - padB + 4} fill="#8ea3c9" fontSize="12" fontFamily="'VT323', monospace">
              t (s)
            </text>

            <text x={padL - 8} y={padT + 12} fill="#8ea3c9" fontSize="11" fontFamily="'VT323', monospace" textAnchor="end">
              {sMax.toFixed(0)}
            </text>
            <text x={padL - 8} y={svgH - padB + 2} fill="#8ea3c9" fontSize="11" fontFamily="'VT323', monospace" textAnchor="end">
              {s0}
            </text>
            <text x={svgW - padR} y={svgH - padB + 16} fill="#8ea3c9" fontSize="11" fontFamily="'VT323', monospace" textAnchor="middle">
              {timeTarget.toFixed(0)}
            </text>

            {/* Garis Lintasan Penuh Teori (Dashed Mint) */}
            <line
              x1={padL}
              y1={startY_ST}
              x2={padL + chartW}
              y2={endY_ST}
              stroke="#2f8f7a"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Garis Lintasan Realtime Berjalan (Solid Mint Glow) */}
            <line
              x1={padL}
              y1={startY_ST}
              x2={pointX_ST}
              y2={pointY_ST}
              stroke="#4fc4a8"
              strokeWidth="3"
            />

            {/* Titik Koordinat Realtime */}
            <circle cx={pointX_ST} cy={pointY_ST} r="5" fill="#f6c453" stroke="#0b0d17" strokeWidth="2" />
          </svg>

          {/* Current Values Ticker */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
              padding: "6px 10px",
              backgroundColor: "#141827",
              borderTop: "1px solid #2b3350",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
            }}
          >
            <span style={{ color: "#8ea3c9" }}>
              Posisi s(t) = <strong style={{ color: "#4fc4a8", fontSize: "1.2rem" }}>{sNow.toFixed(1)} m</strong>
            </span>
            <span style={{ color: "#8ea3c9" }}>
              Waktu t = <strong style={{ color: "#f6c453", fontSize: "1.2rem" }}>{timeCurrent.toFixed(1)} s</strong>
            </span>
          </div>
        </div>

        <div style={{ marginTop: "10px", fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={12} color="#4fc4a8" />
          <span>Bentuk: Garis lurus linier miring (Kemiringan konstan)</span>
        </div>
      </div>

      {/* 2. GRAFIK KECEPATAN TERHADAP WAKTU (v - t) */}
      <div className="pixel-card pixel-card-accent-amber" style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "10px",
            paddingBottom: "8px",
            borderBottom: "1px solid #2b3350",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={14} color="#f6c453" />
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#f6c453", fontWeight: "bold" }}>
              GRAFIK 02: KECEPATAN (v) - WAKTU (t)
            </span>
          </div>
          <span style={{ fontSize: "0.6rem", color: "#ef6f5e", fontFamily: "var(--font-ui)", fontWeight: "bold" }}>
            a = 0 (PERCEPATAN NOL)
          </span>
        </div>

        {/* SVG Chart v - t */}
        <div
          className="grid-paper-bg"
          style={{
            position: "relative",
            backgroundColor: "#0b0d17",
            border: "1px solid #2b3350",
            padding: "4px",
          }}
        >
          <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", height: "auto", display: "block", userSelect: "none" }}>
            {/* Sumbu X & Y */}
            <line x1={padL} y1={padT} x2={padL} y2={svgH - padB} stroke="#5b8dd9" strokeWidth="2" />
            <line x1={padL} y1={svgH - padB} x2={svgW - padR} y2={svgH - padB} stroke="#5b8dd9" strokeWidth="2" />

            {/* Label Sumbu */}
            <text x={padL - 10} y={padT + 10} fill="#f6c453" fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
              v (m/s)
            </text>
            <text x={svgW - padR + 5} y={svgH - padB + 4} fill="#8ea3c9" fontSize="12" fontFamily="'VT323', monospace">
              t (s)
            </text>

            <text x={padL - 8} y={lineY_VT + 4} fill="#f6c453" fontSize="12" fontFamily="'VT323', monospace" textAnchor="end">
              {v}
            </text>
            <text x={padL - 8} y={svgH - padB + 2} fill="#8ea3c9" fontSize="11" fontFamily="'VT323', monospace" textAnchor="end">
              0
            </text>

            {/* Area Di Bawah Kurva (Luas Daerah = Jarak Tempuh Δs) */}
            <polygon
              points={`
                ${padL},${svgH - padB} 
                ${padL},${lineY_VT} 
                ${currentX_VT},${lineY_VT} 
                ${currentX_VT},${svgH - padB}
              `}
              fill="rgba(246, 196, 83, 0.22)"
              stroke="none"
            />

            {/* Garis Teori Lengkap */}
            <line
              x1={padL}
              y1={lineY_VT}
              x2={padL + chartW}
              y2={lineY_VT}
              stroke="#8b5a3c"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Garis Kecepatan Realtime (Solid Amber Horizontal) */}
            <line
              x1={padL}
              y1={lineY_VT}
              x2={currentX_VT}
              y2={lineY_VT}
              stroke="#f6c453"
              strokeWidth="3"
            />

            {/* Titik Realtime */}
            <circle cx={currentX_VT} cy={lineY_VT} r="5" fill="#4fc4a8" stroke="#0b0d17" strokeWidth="2" />

            {/* Label Luas Daerah = s */}
            {progressRatio > 0.2 && (
              <text
                x={padL + (currentX_VT - padL) * 0.5}
                y={lineY_VT + (svgH - padB - lineY_VT) * 0.55}
                fill="#fbf6e9"
                fontSize="11"
                fontFamily="'Silkscreen', monospace"
                textAnchor="middle"
              >
                LUAS = Δs ({((sNow - s0)).toFixed(1)} m)
              </text>
            )}
          </svg>

          {/* Current Values Ticker */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
              padding: "6px 10px",
              backgroundColor: "#141827",
              borderTop: "1px solid #2b3350",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
            }}
          >
            <span style={{ color: "#8ea3c9" }}>
              Kecepatan v = <strong style={{ color: "#f6c453", fontSize: "1.2rem" }}>{v.toFixed(1)} m/s (Tetap)</strong>
            </span>
            <span style={{ color: "#8ea3c9" }}>
              Luas Daerah = <strong style={{ color: "#4fc4a8", fontSize: "1.2rem" }}>{((sNow - s0)).toFixed(1)} m</strong>
            </span>
          </div>
        </div>

        <div style={{ marginTop: "10px", fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)", display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={12} color="#f6c453" />
          <span>Bentuk: Garis horizontal datar (Kecepatan tidak pernah berubah)</span>
        </div>
      </div>
    </div>
  );
};
