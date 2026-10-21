import React, { useState } from "react";
import { sound } from "../utils/audio";
import { Play, Pause, RotateCcw, FastForward, ChevronUp, ChevronDown } from "lucide-react";

export type TabKey = "simulator" | "validation" | "praktikum" | "comparison" | "quiz" | "history";

interface MobileFloatingDockProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  // Simulator floating controls props
  isRunning: boolean;
  timeCurrent: number;
  timeTarget: number;
  v: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onReset: () => void;
  currentDistance: number;
}

interface TabDef {
  key: TabKey;
  label: string;
  shortLabel: string;
  icon: string;
  accent: string;
}

const TABS: TabDef[] = [
  {
    key: "simulator",
    label: "SIMULATOR",
    shortLabel: "Sim",
    icon: "/pixel-icons/speedometer.png",
    accent: "#f6c453",
  },
  {
    key: "validation",
    label: "RUMUS GLB",
    shortLabel: "Rumus",
    icon: "/pixel-icons/formula_book.png",
    accent: "#4fc4a8",
  },
  {
    key: "praktikum",
    label: "PRAKTIKUM",
    shortLabel: "Praktik",
    icon: "/pixel-icons/flask_lab.png",
    accent: "#5b8dd9",
  },
  {
    key: "comparison",
    label: "3 PILAR",
    shortLabel: "3 Pilar",
    icon: "/pixel-icons/scales_balance.png",
    accent: "#f6c453",
  },
  {
    key: "quiz",
    label: "KUIS GLB",
    shortLabel: "Kuis",
    icon: "/pixel-icons/quiz_box.png",
    accent: "#ef6f5e",
  },
  {
    key: "history",
    label: "SQLITE",
    shortLabel: "SQLite",
    icon: "/pixel-icons/floppy_disk.png",
    accent: "#4fc4a8",
  },
];

export const MobileFloatingDock: React.FC<MobileFloatingDockProps> = ({
  activeTab,
  onSelectTab,
  isRunning,
  timeCurrent,
  timeTarget,
  v,
  onTogglePlay,
  onStepForward,
  onReset,
  currentDistance,
}) => {
  const [showQuickFab, setShowQuickFab] = useState<boolean>(true);

  return (
    <nav className="mobile-floating-dock-container" aria-label="Mobile Navigation Dock">
      {/* 1. FLOATING QUICK ACTION BAR (Only active on Simulator tab) */}
      {activeTab === "simulator" && (
        <div className={`mobile-quick-fab-wrapper ${showQuickFab ? "expanded" : "minimized"}`}>
          {showQuickFab ? (
            <div className="mobile-quick-fab-bar">
              {/* Telemetry pill */}
              <div className="mobile-quick-telemetry">
                <span className="telemetry-item" style={{ color: "#f6c453" }}>
                  s: <strong>{currentDistance.toFixed(1)}m</strong>
                </span>
                <span className="telemetry-sep">•</span>
                <span className="telemetry-item" style={{ color: "#4fc4a8" }}>
                  v: <strong>{v.toFixed(0)}m/s</strong>
                </span>
                <span className="telemetry-sep">•</span>
                <span className="telemetry-item" style={{ color: "#e8e3d3" }}>
                  t: <strong>{timeCurrent.toFixed(1)}s</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mobile-quick-buttons">
                {/* Play/Pause Button */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onTogglePlay();
                  }}
                  className={`mobile-fab-btn ${isRunning ? "fab-pause" : "fab-play"}`}
                  title={isRunning ? "Pause Simulasi" : "Mulai Simulasi"}
                >
                  {isRunning ? (
                    <>
                      <Pause size={13} />
                      <span>JEDA</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} />
                      <span>{timeCurrent > 0 ? "LANJUT" : "MULAI"}</span>
                    </>
                  )}
                </button>

                {/* Step +0.5s */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onStepForward();
                  }}
                  disabled={isRunning || timeCurrent >= timeTarget}
                  className="mobile-fab-btn fab-secondary"
                  title="Langkah Maju 0.5s"
                >
                  <FastForward size={13} />
                  <span>+0.5s</span>
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    sound.playClick();
                    onReset();
                  }}
                  className="mobile-fab-btn fab-reset"
                  title="Reset Simulasi ke Posisi Awal"
                >
                  <RotateCcw size={13} />
                  <span>RESET</span>
                </button>

                {/* Minimize button */}
                <button
                  onClick={() => setShowQuickFab(false)}
                  className="mobile-fab-toggle-btn"
                  title="Sembunyikan tombol melayang"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Minimized Pill to reopen */
            <button
              onClick={() => setShowQuickFab(true)}
              className="mobile-quick-fab-collapsed-pill"
              title="Buka Tombol Kontrol Cepat"
            >
              <ChevronUp size={12} color="#f6c453" />
              <span>KONTROL SIMULATOR</span>
              <span className="fab-status-dot" style={{ background: isRunning ? "#4fc4a8" : "#8ea3c9" }} />
            </button>
          )}
        </div>
      )}

      {/* 2. THE 6-TAB FLOATING CYBER DOCK */}
      <div className="mobile-floating-dock">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.key);
              }}
              className={`mobile-dock-item ${isActive ? "active" : ""}`}
              style={{
                borderColor: isActive ? tab.accent : "transparent",
              }}
              aria-label={tab.label}
              title={`[0${idx + 1}] ${tab.label}`}
            >
              <div className="mobile-dock-icon-wrap">
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="mobile-dock-icon"
                  style={{
                    filter: isActive
                      ? `drop-shadow(0 0 6px ${tab.accent})`
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
                  }}
                />
                {isActive && (
                  <span
                    className="mobile-dock-glow-dot"
                    style={{ background: tab.accent, boxShadow: `0 0 6px ${tab.accent}` }}
                  />
                )}
              </div>
              <span
                className="mobile-dock-label"
                style={{
                  color: isActive ? tab.accent : "var(--color-mist)",
                  fontWeight: isActive ? "bold" : "normal",
                }}
              >
                {tab.shortLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileFloatingDock;
