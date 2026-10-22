import { Moon, Sun, Volume2, VolumeX, ScanLine } from "lucide-react";
import { sound } from "../utils/audio";
import { num } from "../utils/format";

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
  const progress = timeTarget > 0 ? Math.min(100, Math.max(0, (timeCurrent / timeTarget) * 100)) : 0;
  const state = isRunning ? "running" : isFinished ? "finished" : "standby";
  const stateLabel = isRunning ? "Berjalan" : isFinished ? "Selesai" : "Siaga";

  const handleSfxClick = () => {
    sound.enabled = !sfxEnabled;
    onToggleSfx();
    if (!sfxEnabled) {
      sound.playClick();
    }
  };

  return (
    <header className="hud">
      <div
        className={`hud-progress ${isFinished ? "is-complete" : ""}`}
        role="progressbar"
        aria-label="Kemajuan simulasi"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="hud-main">
        <div className="hud-id">
          <img src="/pixel-icons/logo.png" alt="" className="hud-logo" />
          <div className="hud-id-text">
            <span className="hud-kicker">LAB KINEMATIKA / GLB</span>
            <h1 className="hud-title">Simulasi Gerak Lurus Beraturan</h1>
          </div>
        </div>

        <div className="hud-status" data-state={state} aria-live="polite">
          <span className="hud-dot" aria-hidden="true" />
          <span className="hud-state">{stateLabel}</span>
          <span className="hud-clock">
            {num(timeCurrent, 1)}
            <span> / {num(timeTarget, 1)} s</span>
          </span>
        </div>

        <div className="hud-tools">
          <button
            type="button"
            className="tool-btn"
            aria-pressed={isNightMode}
            aria-label="Tema malam"
            title="Ganti tema siang / malam"
            onClick={onToggleNightMode}
          >
            {isNightMode ? <Moon size={14} /> : <Sun size={14} />}
            <span>{isNightMode ? "Malam" : "Siang"}</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            aria-pressed={sfxEnabled}
            aria-label="Efek suara"
            title="Nyalakan / matikan efek suara 8-bit"
            onClick={handleSfxClick}
          >
            {sfxEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Suara</span>
          </button>

          <button
            type="button"
            className="tool-btn"
            aria-pressed={scanlinesEnabled}
            aria-label="Efek layar CRT"
            title="Nyalakan / matikan scanline CRT"
            onClick={onToggleScanlines}
          >
            <ScanLine size={14} />
            <span>CRT</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default HudTop;
