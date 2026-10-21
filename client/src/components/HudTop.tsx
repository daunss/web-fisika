import { Sparkles, Volume2, VolumeX, Sun, Moon } from "lucide-react";
import { sound } from "../utils/audio";


interface HudTopProps {
  isRunning: boolean;
  isFinished: boolean;
  timeCurrent: number;
  timeTarget: number;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
}

export const HudTop: React.FC<HudTopProps> = ({
  isRunning,
  isFinished,
  timeCurrent,
  timeTarget,
  scanlinesEnabled,
  onToggleScanlines,
  isNightMode,
  onToggleNightMode,
  sfxEnabled,
  onToggleSfx,
}) => {
  const progressPct = Math.min(100, Math.max(0, (timeCurrent / (timeTarget || 1)) * 100));

  const handleSfxClick = () => {
    sound.enabled = !sfxEnabled;
    onToggleSfx();
    if (!sfxEnabled) {
      sound.playClick();
    }
  };

  return (
    <header className="hud-header">
      {/* 2px Neon Progress Bar at the very top */}
      <div
        className="hud-progress-line"
        style={{
          width: `${progressPct}%`,
          background: isFinished ? "#4fc4a8" : "#f6c453",
          boxShadow: isFinished ? "0 0 10px #4fc4a8" : "0 0 10px #f6c453",
        }}
      />

      <div className="hud-inner">
        {/* Left: Brand & Topic Title */}
        <div className="hud-brand">
          <img
            src="/pixel-icons/logo.png"
            alt="Logo Fisika GLB"
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 0 5px rgba(79, 196, 168, 0.6))",
            }}
          />
          <div>
            <div className="hud-brand-title">■ SIMULASI / LAB KINEMATIKA GLB</div>
            <div className="hud-brand-sub">FISIKA DASAR • TEKNIK INFORMATIKA (PBL 1)</div>
          </div>
        </div>

        {/* Center: Realtime Running Status Pill */}
        <div className="hud-status-pill">
          <span style={{ color: "#8ea3c9", fontFamily: "var(--font-ui)", fontSize: "0.6rem" }}>STATUS:</span>
          {isRunning ? (
            <span style={{ color: "#4fc4a8", fontFamily: "var(--font-ui)", fontWeight: "bold", fontSize: "0.65rem" }}>
              ● RUNNING
            </span>
          ) : isFinished ? (
            <span style={{ color: "#f6c453", fontFamily: "var(--font-ui)", fontWeight: "bold", fontSize: "0.65rem" }}>
              TARGET REACHED ★
            </span>
          ) : (
            <span style={{ color: "#8ea3c9", fontFamily: "var(--font-ui)", fontSize: "0.65rem" }}>STANDBY</span>
          )}
          <span style={{ color: "#2b3350" }}>|</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem", color: "#fbf6e9" }}>
            {timeCurrent.toFixed(1)}s / {timeTarget.toFixed(1)}s
          </span>
        </div>

        {/* Right: Controls & Toggles */}
        <div className="hud-actions">
          {/* Day / Night Environment Toggle */}
          <button
            onClick={onToggleNightMode}
            className="pixel-btn"
            style={{ padding: "6px 10px", minHeight: "30px", fontSize: "0.6rem" }}
            title="Ganti Tema Siang / Malam (Ala Frame Video 180s vs 0.3s)"
          >
            {isNightMode ? (
              <>
                <Moon size={12} color="#5b8dd9" /> MALAM
              </>
            ) : (
              <>
                <Sun size={12} color="#f6c453" /> SIANG
              </>
            )}
          </button>

          {/* 8-bit Audio Toggle */}
          <button
            onClick={handleSfxClick}
            className="pixel-btn"
            style={{
              padding: "6px 10px",
              minHeight: "30px",
              fontSize: "0.6rem",
              borderColor: sfxEnabled ? "#4fc4a8" : "#2b3350",
              color: sfxEnabled ? "#4fc4a8" : "#8ea3c9",
            }}
            title="Toggle 8-bit Sound Effects"
          >
            {sfxEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            SFX: {sfxEnabled ? "ON" : "OFF"}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={onToggleScanlines}
            className="pixel-btn"
            style={{
              padding: "6px 10px",
              minHeight: "30px",
              fontSize: "0.6rem",
              borderColor: scanlinesEnabled ? "#f6c453" : "#2b3350",
              color: scanlinesEnabled ? "#f6c453" : "#8ea3c9",
            }}
            title="Toggle Retro CRT Scanline Effect"
          >
            <Sparkles size={12} />
            CRT: {scanlinesEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default HudTop;
