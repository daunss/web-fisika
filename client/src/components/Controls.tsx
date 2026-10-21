import React from "react";
import { Play, Pause, RotateCcw, FastForward, Save, Gauge, Navigation } from "lucide-react";
import { sound } from "../utils/audio";
import { RetroGauge } from "./RetroGauge";
import type { VehicleType } from "./CanvasStage";

interface ControlsProps {
  v: number;
  s0: number;
  timeTarget: number;
  timeCurrent: number;
  isRunning: boolean;
  isSlowMo: boolean;
  onSetV: (v: number) => void;
  onSetS0: (s0: number) => void;
  onSetTimeTarget: (t: number) => void;
  onTogglePlay: () => void;
  onToggleSlowMo: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSaveSimulation: () => void;
  isSaving: boolean;
  vehicleType: VehicleType;
  onSelectVehicle: (type: VehicleType) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  v,
  s0,
  timeTarget,
  timeCurrent,
  isRunning,
  isSlowMo,
  onSetV,
  onSetS0,
  onSetTimeTarget,
  onTogglePlay,
  onToggleSlowMo,
  onStepForward,
  onReset,
  onSaveSimulation,
  isSaving,
  vehicleType,
  onSelectVehicle,
}) => {
  const applyPreset = (presetV: number, presetS0: number, presetT: number, vType?: VehicleType) => {
    sound.playClick();
    onReset();
    onSetV(presetV);
    onSetS0(presetS0);
    onSetTimeTarget(presetT);
    if (vType) {
      onSelectVehicle(vType);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* 1. MAIN CONTROL CARD */}
      <div className="pixel-card pixel-card-accent-amber" style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
            borderBottom: "1px solid #2b3350",
            paddingBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "#f6c453",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Gauge size={14} /> PANEL KONTROL & TACHOMETER GLB
          </span>
          <span style={{ fontSize: "0.6rem", color: "#8ea3c9", fontFamily: "var(--font-ui)" }}>
            SPEED MODIFIER: {isSlowMo ? "0.5x (SLOW MOTION)" : "1.0x (REALTIME)"}
          </span>
        </div>

        {/* Buttons Grid with Snappy Micro-interactions */}
        <div className="grid-controls-row" style={{ marginBottom: "16px" }}>
          <button
            onClick={onTogglePlay}
            className={`pixel-btn ${isRunning ? "pixel-btn-coral" : "pixel-btn-mint"} btn-span-all`}
          >
            {isRunning ? (
              <>
                <Pause size={14} /> PAUSE SIMULASI
              </>
            ) : (
              <>
                <Play size={14} /> {timeCurrent > 0 ? "LANJUTKAN" : "MULAI SIMULASI"}
              </>
            )}
          </button>

          <button
            onClick={onToggleSlowMo}
            className={`pixel-btn ${isSlowMo ? "pixel-btn-amber" : ""}`}
            title="Ubah kecepatan jalannya waktu simulasi (0.5x)"
          >
            <FastForward size={14} /> {isSlowMo ? "SLOW-MO: ON" : "SLOW-MO: 0.5x"}
          </button>

          <button
            onClick={onStepForward}
            className="pixel-btn"
            disabled={isRunning}
            title="Lompat maju 0.5 sekon (hanya saat pause)"
          >
            STEP +0.5s
          </button>

          <button onClick={onReset} className="pixel-btn pixel-btn-coral">
            <RotateCcw size={14} /> RESET
          </button>

          <button
            onClick={onSaveSimulation}
            disabled={isSaving}
            className="pixel-btn pixel-btn-mint"
            title="Simpan data running simulasi ini ke database SQLite"
          >
            <Save size={14} /> {isSaving ? "MENYIMPAN..." : "SIMPAN RUN"}
          </button>
        </div>

        {/* 2. PARAMETERS WITH INTEGRATED ANALOG GAUGE */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "12px",
            alignItems: "center",
          }}
        >
          {/* Velocity Control Card with Embedded SVG Gauge */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "rgba(11, 13, 23, 0.75)",
              border: "1px solid #2b3350",
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <RetroGauge value={v} max={160} size={94} label="LAJU v" unit="m/s" color="#f6c453" />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.65rem", color: "#f6c453", fontFamily: "var(--font-ui)", fontWeight: "bold" }}>
                  KECEPATAN KONSTAN (v)
                </label>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.2rem", color: "#f6c453" }}>
                  {v} <span style={{ fontSize: "0.75rem", color: "#8ea3c9" }}>m/s</span>
                </div>
              </div>

              <input
                type="range"
                min="0.2"
                max="150"
                step="0.1"
                value={v}
                onChange={(e) => onSetV(parseFloat(e.target.value) || 1)}
                className="pixel-range"
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#8ea3c9", fontFamily: "var(--font-mono)" }}>
                <span>0.2 m/s (Lab)</span>
                <span>150 m/s (Space)</span>
              </div>
            </div>
          </div>

          {/* Time & Initial Position Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Initial Position (s0) */}
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "rgba(11, 13, 23, 0.75)",
                border: "1px solid #2b3350",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.65rem", color: "#4fc4a8", fontFamily: "var(--font-ui)", fontWeight: "bold" }}>
                  POSISI AWAL (s₀)
                </label>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem", color: "#4fc4a8" }}>
                  {s0} <span style={{ fontSize: "0.75rem", color: "#8ea3c9" }}>meter</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={s0}
                onChange={(e) => onSetS0(parseFloat(e.target.value) || 0)}
                className="pixel-range"
              />
            </div>

            {/* Target Duration (t) */}
            <div
              style={{
                padding: "10px 12px",
                backgroundColor: "rgba(11, 13, 23, 0.75)",
                border: "1px solid #2b3350",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: "0.65rem", color: "#5b8dd9", fontFamily: "var(--font-ui)", fontWeight: "bold" }}>
                  TARGET WAKTU (t)
                </label>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.15rem", color: "#5b8dd9" }}>
                  {timeTarget} <span style={{ fontSize: "0.75rem", color: "#8ea3c9" }}>sekon</span>
                </div>
              </div>
              <input
                type="range"
                min="2"
                max="60"
                step="1"
                value={timeTarget}
                onChange={(e) => onSetTimeTarget(parseFloat(e.target.value) || 2)}
                className="pixel-range"
              />
            </div>
          </div>
        </div>

        {/* 3. PRESETS KASUS FISIKA & WAHANA */}
        <div
          style={{
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(43, 51, 80, 0.6)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.6rem",
              color: "#8ea3c9",
              fontFamily: "var(--font-ui)",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginRight: "4px",
            }}
          >
            <Navigation size={12} /> PRESET KASUS:
          </span>
          <button
            onClick={() => applyPreset(20, 0, 30, "car")}
            className={`pixel-btn ${vehicleType === "car" ? "pixel-btn-amber" : ""}`}
            style={{ padding: "4px 8px", fontSize: "0.6rem", minHeight: "28px" }}
          >
            ★ Kasus Video (v=20 m/s, t=30s)
          </button>
          <button
            onClick={() => applyPreset(80, 0, 15, "train")}
            className={`pixel-btn ${vehicleType === "train" ? "pixel-btn-amber" : ""}`}
            style={{ padding: "4px 8px", fontSize: "0.6rem", minHeight: "28px" }}
          >
            🚄 Maglev Metropolis (v=80 m/s)
          </button>
          <button
            onClick={() => applyPreset(150, 0, 20, "probe")}
            className={`pixel-btn ${vehicleType === "probe" ? "pixel-btn-amber" : ""}`}
            style={{ padding: "4px 8px", fontSize: "0.6rem", minHeight: "28px" }}
          >
            🛰️ Voyager Probe (v=150 m/s)
          </button>
          <button
            onClick={() => applyPreset(0.25, 0, 4, "lab")}
            className={`pixel-btn ${vehicleType === "lab" ? "pixel-btn-amber" : ""}`}
            style={{ padding: "4px 8px", fontSize: "0.6rem", minHeight: "28px" }}
          >
            🤖 Praktikum Lab (v=0.25 m/s)
          </button>
          <button
            onClick={() => applyPreset(15, 50, 20, "car")}
            className="pixel-btn"
            style={{ padding: "4px 8px", fontSize: "0.6rem", minHeight: "28px" }}
          >
            Offset Posisi Awal (s₀=50m)
          </button>
        </div>
      </div>
    </div>
  );
};
